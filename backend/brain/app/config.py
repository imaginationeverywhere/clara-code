from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", extra="ignore")

  clara_brain_api_key: str = Field(default="", validation_alias="CLARA_BRAIN_API_KEY")
  data_dir: str = Field(default="/data", validation_alias="DATA_DIR")


settings = Settings()
