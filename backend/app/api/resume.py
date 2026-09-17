from fastapi import APIRouter

from app.schemas import ResumeBundle
from app.services.content import load_resume

router = APIRouter(prefix="/resume", tags=["resume"])


@router.get("", response_model=ResumeBundle)
def read_resume() -> ResumeBundle:
    return load_resume()


@router.get("/{section}")
def read_resume_section(section: str):
    bundle = load_resume().model_dump()
    if section not in bundle:
        return {"error": "unknown_section", "available": sorted(bundle)}
    return bundle[section]

