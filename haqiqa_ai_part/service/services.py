from minio import Minio
import whisper
from . import config

minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=False
)

whisper_model = whisper.load_model(config.WHISPER_MODEL_NAME)