from pydantic_settings import BaseSettings



class Settings(BaseSettings):
    PROJECT_NAME: str = "Universal Digital Life Manager"
    API_V1_STR: str = "/api/v1"
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./udlm.db"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY"  # production me env se lo
    ALGORITHM: str = "HS256"

    class Config:
        case_sensitive = True


settings = Settings()

