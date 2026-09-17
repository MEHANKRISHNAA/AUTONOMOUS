"""In-process request/error/latency counters, read by GET /metrics.

WHY THIS EXISTS: a Kubernetes liveness probe on /health answers one question -
"is this process alive?" - and nothing else. A pod can be perfectly Running
while every request returns 500. self_healing_cicd's site_watcher polls THIS
endpoint to see the failure mode the cluster itself cannot.

THE FIELD NAMES ARE A CONTRACT, NOT A STYLE CHOICE. site_watcher reads
`error_ratio` and the NESTED `latency_ms["p95"]` (see
self_healing_cicd/app/monitor/site_watcher.py). An earlier version of this file
emitted `error_rate` and a flat `p95_latency_ms`; the watcher read both as 0.0
and therefore never alerted, while every dashboard reported the site healthy.
A monitoring contract that fails silently is worse than no monitoring, so if
these keys are renamed, site_watcher must be changed in the same commit.

DELIBERATELY PROCESS-LOCAL, NOT PERSISTED. A pod restart resetting these to
zero is correct: the numbers describe THIS pod since it came up, and a fresh
pod genuinely has no history. Persisting them would make "the error rate looks
fine" lie for as long as the previous pod's bad numbers lingered.
"""

import threading
import time
from collections import deque
from typing import Any


def _percentile(sorted_values: list[float], fraction: float) -> float:
    """Nearest-rank percentile over an already-sorted list.

    No numpy for one small computation. Nearest-rank is accurate enough for a
    threshold check, which is all site_watcher does with the result.

    The `min(len - 1, ...)` clamp is load-bearing: the naive
    `values[int(fraction * len) - 1]` indexes -1 for a single sample, which
    silently wraps to the LARGEST value and reports one slow request as the
    steady-state p95.
    """
    if not sorted_values:
        return 0.0
    index = min(len(sorted_values) - 1, int(fraction * len(sorted_values)))
    return round(sorted_values[index], 1)


class Metrics:
    """Thread-safe counters, updated once per request by the middleware.

    A lock rather than bare attributes because FastAPI runs sync route handlers
    in a threadpool, so `total_requests += 1` from two workers can genuinely
    interleave and lose a count.
    """

    def __init__(self, window: int = 500) -> None:
        self._lock = threading.Lock()
        self._started_at = time.time()
        self.total_requests = 0
        self.error_5xx_count = 0
        # A bounded rolling window, not a running average - p95/p99 need the
        # actual shape of the distribution, and 500 samples estimates that
        # without the buffer growing without limit on a long-lived pod.
        self._latencies_ms: deque[float] = deque(maxlen=window)

    def record(self, status_code: int, duration_ms: float) -> None:
        """Called once per request, success or failure, from the middleware."""
        with self._lock:
            self.total_requests += 1
            if status_code >= 500:
                self.error_5xx_count += 1
            self._latencies_ms.append(duration_ms)

    def snapshot(self) -> dict[str, Any]:
        """Read consistently under the lock, then compute outside it.

        Holding the lock only long enough to copy avoids blocking every
        in-flight request's record() for the duration of a sort.
        """
        with self._lock:
            total = self.total_requests
            errors = self.error_5xx_count
            latencies = sorted(self._latencies_ms)
            uptime = time.time() - self._started_at

        return {
            "uptime_seconds": round(uptime, 1),
            "requests_total": total,
            "errors_5xx_total": errors,
            # 0.0 rather than a ZeroDivisionError - "no traffic yet" is a real,
            # healthy state for a freshly started pod, not an error condition.
            "error_ratio": round(errors / total, 4) if total else 0.0,
            "latency_ms": {
                "p50": _percentile(latencies, 0.50),
                "p95": _percentile(latencies, 0.95),
                "p99": _percentile(latencies, 0.99),
                "samples": len(latencies),
            },
        }


# One instance for the process, imported by both main.py's middleware (writes)
# and the /metrics route (reads).
metrics = Metrics()
