import tempfile
import traceback
import requests

from .services import minio_client, whisper_model
from .database import update_video_status, save_transcript_chunks, embed_script
from .config import MINIO_BUCKET, EXTERNAL_API_KEY

BACKEND_URL = "http://localhost:8080"

def notify_backend(video_id, status):
    try:
        headers = {
            'X-API-KEY': EXTERNAL_API_KEY,
            'Content-Type': 'application/json'
        }

        print(f"🚀 Notifying backend for video {video_id}: {status}")
        
        response = requests.post(
            f"{BACKEND_URL}/videos/{video_id}/status",
            json={"status": status},
            headers=headers
        )
    except Exception as e:
        print(f"Failed to notify backend: {e}")

def process_video_task(video_id, user_id, object_key):
    try:
        notify_backend(video_id, "PROCESSING")
        update_video_status(video_id, "PROCESSING")

        with tempfile.NamedTemporaryFile(delete=True, suffix=".mp4") as temp_file:
            print(f"Downloading {object_key} from Minio...")
            minio_client.fget_object(
                MINIO_BUCKET,
                object_key,
                temp_file.name
            )
            print("Download complete. Starting transcription...")

            result = whisper_model.transcribe(temp_file.name, verbose=True)
            
            print("Transcription complete. Saving to database...")
            
            save_transcript_chunks(video_id, result['segments'])
            embed_script(video_id, user_id)
            
            update_video_status(video_id, "COMPLETED")
            notify_backend(video_id, "COMPLETED")
            print(f"Successfully processed video {video_id}")

    except Exception as e:
        print(f"ERROR processing video {video_id}: {e}")
        traceback.print_exc()
        update_video_status(video_id, "FAILED")
        notify_backend(video_id, "FAILED")
