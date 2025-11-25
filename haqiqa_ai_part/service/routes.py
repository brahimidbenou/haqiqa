import threading
from flask import Response, request, jsonify, Blueprint
from functools import wraps

from .config import INTERNAL_API_KEY
from .tasks import process_video_task
from .utils import get_summary, get_title, get_rag_response
from .database import update_video_title, update_video_summary

bp = Blueprint('api', __name__)

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != INTERNAL_API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


@bp.route('/transcribe', methods=['POST'])
@require_api_key
def handle_transcribe_request():
    data = request.get_json()
    if not data or 'video_id' not in data or 'object_key' not in data:
        return jsonify({"error": "Missing video_id or object_key"}), 400

    video_id = data['video_id']
    object_key = data['object_key']

    thread = threading.Thread(
        target=process_video_task, 
        args=(video_id, object_key)
    )
    thread.start()

    return jsonify({
        "message": "Transcription task accepted and started.",
        "video_id": video_id
    }), 202

@bp.route('/analyze', methods=['Post'])
@require_api_key
def analyze_handler():
    data = request.get_json()
    if not data or 'video_id' not in data:
        return jsonify({"error": "Missing video_id"}), 400
    
    video_id = data['video_id']
    summary = get_summary(video_id)
    title = get_title(video_id)

    if "error" in summary or "error" in title:
        return jsonify({"error": "error"}), 500
    
    resp = {
        'title': title['answer'],
        'summary': summary['answer']
    }


    update_video_summary(video_id, resp['summary'])
    update_video_title(video_id, resp['title'])

    return jsonify(resp), 200

@bp.route('/ask/stream', methods=['Post'])
@require_api_key
def ask_haqiqa_bot():
    data = request.json
    video_id = data.get('video_id')
    query = data.get('query')
    if not video_id or not query:
        return jsonify({"error": "Missing 'video_id' or 'query'"}), 400

    def generate():
        for chunk in get_rag_response(video_id, query, True):
            yield chunk

    return Response(generate(), mimetype="text/event-stream")

@bp.route('/ask', methods=['Post'])
@require_api_key
def ask_haqiqa():
    data = request.json
    video_id = data.get('video_id')
    query = data.get('query')
    if not video_id or not query:
        return jsonify({"error": "Missing 'video_id' or 'query'"}), 400
    response = get_rag_response(video_id, query)

    if "error" in response:
        return jsonify({"error": response.get("error", "error")}), 500
    
    return jsonify(response), 200