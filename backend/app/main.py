import asyncio
import random
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import contact, resume
from app.core.config import settings
from app.core.metrics import metrics
from app.services.contact_store import init_contact_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Raising here means the app never becomes Ready, which is exactly what
    # CrashLoopBackOff looks like: Kubernetes restarts the container, sees it
    # die again, and starts backing off.
    if settings.fail_on_boot:
        raise RuntimeError("PORTFOLIO_FAIL_ON_BOOT=true")

    # ~70% rather than 100%, unlike fail_on_boot above. That difference is the
    # whole reason this toggle exists: restart_pod (LOW risk, executes with no
    # human) deletes the pod, the Deployment recreates it, and a ~30% clean-boot
    # chance per restart means the automatic path can genuinely resolve the
    # incident. fail_on_boot would loop forever no matter how often it retried.
    if settings.flaky_boot and random.random() < 0.7:
        raise RuntimeError("PORTFOLIO_FLAKY_BOOT=true: simulated intermittent startup failure")

    init_contact_store()
    yield


app = FastAPI(
    title="Codex Sample Portfolio API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def instrument_requests(request: Request, call_next):
    # `started` is captured BEFORE the slow_response sleep on purpose, so the
    # injected latency shows up in the p95 the prober thresholds against. A
    # timer started after the sleep would report a healthy p95 while every real
    # user waited 650ms.
    started = time.perf_counter()
    if settings.slow_response:
        await asyncio.sleep(0.65)
    if settings.load_test:
        request.app.state.ballast = getattr(request.app.state, "ballast", [])
        request.app.state.ballast.append(bytes(2 * 1024 * 1024))

    # An exception handler runs INSIDE the middleware stack, so an unhandled
    # error propagates through call_next() as a raise, not as a response. This
    # except block is therefore the only place that sees every request's real
    # outcome - without it, a route that raises is never counted, and
    # error_ratio reports 0.0 while every request 500s.
    try:
        response = await call_next(request)
    except Exception:
        metrics.record(500, (time.perf_counter() - started) * 1000)
        raise  # let handle_unexpected_error() produce the actual response
    metrics.record(response.status_code, (time.perf_counter() - started) * 1000)
    return response


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": "internal_error", "message": str(exc)})


app.include_router(resume.router)
app.include_router(contact.router)


@app.get("/health")
def health() -> dict:
    """Liveness, plus which failure toggles are armed.

    Echoing the toggles is not decoration: the engine's site_watcher reads
    health_body["fail_on_boot"] to distinguish "this app is deliberately
    broken" from "this app is unexpectedly broken". Answering only
    {status, service, environment} makes that branch dead code.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.environment,
        "fail_on_boot": settings.fail_on_boot,
        "flaky_boot": settings.flaky_boot,
        "slow_response": settings.slow_response,
        "load_test": settings.load_test,
    }


@app.get("/metrics")
def read_metrics() -> dict:
    return metrics.snapshot()


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"service": settings.app_name, "docs": "/docs", "health": "/health"}

