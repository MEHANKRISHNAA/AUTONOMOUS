from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Codex Sample Portfolio"
    environment: str = "local"
    cors_origins: str = "http://localhost:5173,http://localhost:4173"
    data_path: Path = Path(__file__).resolve().parents[1] / "data" / "resume.json"
    database_path: Path = Path(__file__).resolve().parents[2] / "contact_messages.db"

    # DELIBERATE FAILURE TOGGLES. These exist so self_healing_cicd has a real,
    # narratable failure to detect and heal, rather than a faked event. Note
    # env_prefix below: the ConfigMap keys are PORTFOLIO_FAIL_ON_BOOT etc., not
    # the bare names the sibling portfolio_website project uses.
    #
    # fail_on_boot  - crashes 100% of boots. CrashLoopBackOff forever, so
    #                 restart_pod can never resolve it: that is the point, it
    #                 proves the system escalates instead of claiming a heal.
    # flaky_boot    - crashes ~70% of boots. THIS is the one restart_pod can
    #                 actually fix, because a fresh pod has a ~30% chance of
    #                 booting clean. Without it there is no demonstrable
    #                 automatic heal anywhere in the system.
    # slow_response - adds 650ms, above the engine's 500ms p95 threshold. The
    #                 failure Kubernetes probes cannot see: pod stays Running
    #                 and /health stays green while the app is unusable.
    # load_test     - leaks 2MB per request against a 128Mi limit -> OOMKilled.
    fail_on_boot: bool = False
    flaky_boot: bool = False
    slow_response: bool = False
    load_test: bool = False

    model_config = SettingsConfigDict(env_prefix="PORTFOLIO_", env_file=".env")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

