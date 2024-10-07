from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Connect to MongoDB
mongo_uri = 'mongodb+srv://ashutosh2003chaudhary:Ashutosh1510@cluster0.m9f7l.mongodb.net/livestream_db?retryWrites=true&w=majority'  
client = MongoClient(mongo_uri)
db = client.livestream_db  # Database name
overlays_collection = db.overlays  # Collection name

# Ensure 'static' directory exists for HLS files
if not os.path.exists('static'):
    os.makedirs('static')

@app.route('/api/overlays', methods=['GET', 'POST'])
def manage_overlays():
    if request.method == 'POST':
        overlay_data = request.json

        # Validate overlay data
        required_fields = ['text', 'position', 'size']
        for field in required_fields:
            if field not in overlay_data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        try:
            # Insert the new overlay
            result = overlays_collection.insert_one(overlay_data)
            overlay_data['_id'] = str(result.inserted_id)
            return jsonify({"message": "Overlay created!", "overlay": overlay_data}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'GET':
        try:
            overlays = list(overlays_collection.find())
            for overlay in overlays:
                overlay['_id'] = str(overlay['_id'])  # Convert ObjectId to string
            return jsonify(overlays), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/overlays/<overlay_id>', methods=['PUT', 'DELETE'])
def overlay_detail(overlay_id):
    try:
        obj_id = ObjectId(overlay_id)
    except Exception:
        return jsonify({"error": "Invalid overlay ID"}), 400

    if request.method == 'PUT':
        overlay_data = request.json

        # Remove '_id' from the overlay_data if it exists
        overlay_data.pop('_id', None)  # This ensures that '_id' will not cause an error

        try:
            # Update the overlay in the database
            result = overlays_collection.update_one({"_id": obj_id}, {"$set": overlay_data})
            if result.matched_count == 0:
                return jsonify({"error": "Overlay not found"}), 404
            return jsonify({"message": "Overlay updated!"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'DELETE':
        try:
            result = overlays_collection.delete_one({"_id": obj_id})
            if result.deleted_count == 1:
                return jsonify({"message": "Overlay deleted!"}), 200
            else:
                return jsonify({"error": "Overlay not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/stream')
def stream():
    rtsp_url = request.args.get('url')
    if not rtsp_url:
        return jsonify({"error": "RTSP URL is required"}), 400

    # Command to transcode RTSP to HLS using FFmpeg
    command = [
        'ffmpeg',
        '-i', rtsp_url,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        'static/stream.m3u8'
    ]

    try:
        # Use subprocess.Popen to run the command without blocking the Flask server
        subprocess.Popen(command)
        return jsonify({"message": "Streaming started"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)
