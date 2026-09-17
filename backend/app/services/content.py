import json
from functools import lru_cache

from app.core.config import settings
from app.schemas import ResumeBundle


@lru_cache(maxsize=1)
def load_resume() -> ResumeBundle:
    with open(settings.data_path, "r", encoding="utf-8") as handle:
        return ResumeBundle.model_validate(json.load(handle))

