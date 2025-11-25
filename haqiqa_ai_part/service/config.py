import os

MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY")
MINIO_BUCKET = os.environ.get("MINIO_BUCKET")

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")
EXTERNAL_API_KEY = os.environ.get("EXTERNAL_API_KEY")

CEREVRAS_API_KEY = os.environ.get("CEREVRAS_API_KEY", "")

WHISPER_MODEL_NAME = os.environ.get("WHISPER_MODEL_NAME", "base")