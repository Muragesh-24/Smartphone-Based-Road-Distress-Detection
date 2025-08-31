
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import threading
from datetime import datetime
import shutil
import numpy as np
import cv2
from ultralytics import YOLO
import json
import base64
import openai
import requests

# ---------- CONFIG ----------
OUTPUT_DIR = "./outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

MAX_CONFIDENCE = 0.5
CLEANUP_DELAY = 10  # seconds before report generation after a detection
ALLOWED_VIDEO_EXTS = {"mp4", "mov", "avi", "mkv", "webm"}


# Initialize model once
model = YOLO("bestv1.pt")  # ensure best.pt is in working dir or give full path

app = Flask(__name__)
CORS(app)

# In-memory sessions (not persistent) keyed by user_key or job_id
video_sessions = {}  # user_key -> {detections: [], images: [], lat, lon, report, processed_video_uri}
video_jobs = {}      # job_id -> {status, uploaded_path, processed_path, user_key}

# ---------- Helpers ----------
def save_uploaded_file(file_storage, dest_dir=OUTPUT_DIR, prefix="file"):
    filename = secure_filename(file_storage.filename or f"{prefix}_{uuid.uuid4().hex}")
    dest_path = os.path.join(dest_dir, f"{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex}_{filename}")
    file_storage.save(dest_path)
    return dest_path

def decode_base64_image(image_b64: str):
    """Backward-compatible helper — decodes base64 string into an OpenCV image (numpy array)."""
    image_b64 = image_b64.replace("\n", "").replace("\r", "").replace(" ", "")
    missing_padding = len(image_b64) % 4
    if missing_padding:
        image_b64 += "=" * (4 - missing_padding)
    img_bytes = base64.b64decode(image_b64)
    img_np = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    return img



def get_yolov12_predictions(model, image_path):
   
    results = model(image_path)  # Run inference
    predictions = []

    for r in results:  # Loop over results per image
        boxes = r.boxes.cpu().numpy()  # convert to numpy
        for box in boxes:
            # xyxy format
            x1, y1, x2, y2 = box.xyxy[0]
            w = x2 - x1
            h = y2 - y1
            cx = x1 + w / 2
            cy = y1 + h / 2

            prediction = {
                "x": float(np.round(cx, 2)),
                "y": float(np.round(cy, 2)),
                "width": float(np.round(w, 2)),
                "height": float(np.round(h, 2)),
                "confidence": float(np.round(box.conf[0], 3)),
                "class": str(int(box.cls[0])),
                "class_id": int(box.cls[0]),
                "detection_id": str(uuid.uuid4())  # unique ID
            }
            predictions.append(prediction)

    return {"predictions": predictions}

def send_predictions(url, report_id, gps, frame, predictions):
    # Encode the frame to JPEG in memory
    _, buffer = cv2.imencode('.jpg', frame)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    # Prepare payload
    payload = {
        "report_id": report_id,
        "gps": gps,
        "image": img_base64,
        "predictions": predictions["predictions"]
    }

    # Send POST request
    response = requests.post(url, json=payload)
    return response
# ---------- Routes ----------
@app.route("/detect-frame", methods=["POST"])
def detect_frame():
    try:
        print("Received a request!") 
        print(request.files['image'])
        print(request.form['key'])

        if 'image' not in request.files or 'key' not in request.form:
            return jsonify({"error": "Missing image or key"}), 400
        
        print(request.form)
        file = request.files['image']
        user_key = request.form['key']
        lat = float(request.form.get('latitude', 0))
        lon = float(request.form.get('longitude', 0))

        # convert file to OpenCV image
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        # YOLO detection
        print("Running model prediction...")
        results = model.predict(source=img, save=False, conf=0.25)
        annotated_img = results[0].plot()
        print("Model prediction done.")
        # save annotated
        filename = f"{user_key}_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)
        cv2.imwrite(filepath, annotated_img)

        # store session with lat/lon
        if user_key not in video_sessions:
            video_sessions[user_key] = {"detections": [], "images": [], "lat": lat, "lon": lon}
        video_sessions[user_key]['detections'].append(results[0].to_json())
        video_sessions[user_key]['images'].append(filepath)
        video_sessions[user_key]['lat'] = lat
        video_sessions[user_key]['lon'] = lon
        print("upadating the video session")
        print(video_sessions)
        
       
        return jsonify({"detections": results[0].to_json(), "image_url": f"/outputs/{filename}"})

    except Exception as e:
        print("Error in detect-frame:", e)
        return jsonify({"error": str(e)}), 500

#####################################################
openai.api_key = "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"
openai.api_base = "https://api.groq.com/openai/v1"
# "predictions": [
# "x": 127.5,
#   "y": 114.5,
#   "width": 131,
#   "height": 49,
#   "confidence": 0.917,
#   "class": "0",
#   "class_id": 0,
#   "detection_id": "78ba5fb8-b4b2-4065-b73c-7411d60ebe57"
#                 
#      ]

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        finalreport = data.get("finalreport", "")
        # location = data.get("location", {})
       

        user_message = f"""
        Final Report: {finalreport}
       
 
        """

        completion = openai.ChatCompletion.create(
            model="llama-3.1-8b-instant",
            messages=[{
            "role": "system",
            "content": (
                "You are an assistant that transforms rough road damage notes "
                "into a formal, professional report suitable for submission to government officials. "
                "Your submission must be final: do not include placeholders, brackets, or filler text. "
                "Structure the report with clear headings such as Location, Issue, Impact, and Recommendations. "
                "Keep it professional, concise, and authoritative."
            ),
        },{"role": "user", "content": user_message}],
        )
        print(completion.choices[0].message["content"])
        return jsonify({"reply": completion.choices[0].message["content"]})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

payload = {
    "predictions": [{
        "x": 123,
        "y": 456,
        "width": 789,
        "height": 101,
        "confidence": 0.95,
        "class": "0",
        "class_id": 0,
        "detection_id": "unique-id-123"
    }],
    "gps": "28.6139,77.2090",
    "report_id": "REPORT123"
}
@app.route("/upload-video", methods=["POST"])
def upload_video():
    try:
        print(request.files)
        print(request.form)
        if "video" not in request.files or "key" not in request.form:
            return jsonify({"error": "Missing video or key"}), 400

        vid_file = request.files["video"]
        user_key = request.form["key"]

        # Save uploaded video
        vid_path = save_uploaded_file(vid_file, prefix="video")

        # Open video with OpenCV
        cap = cv2.VideoCapture(vid_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25
        interval = int(fps)  # take 1 frame per second

        annotated_urls = []
        all_detections = []

        for i in range(frame_count):
            ret, frame = cap.read()
            if not ret:
                break
            if i % interval != 0:
                continue  # skip frames
             
            print("Processing frame")
            results = model.predict(source=frame, save=False, conf=0.25)
            # results = model(frame, conf=0.25)
            print("skdms")
            detection_json = results[0].to_json()
            detections = json.loads(detection_json)
            print(detections)
            # Only save if there are detections
            if detections and len(detections) > 0:
                # print(len(detection_json)) 
                # payload = {
                #   "report_id": "REPORT123",
                #   "gps": "28.6139,77.2090",
                #  "image": frame,   
                #  "boxes": [[867.47778,345.80396,1012.64478,425.27765],[867.47778,345.80396,1012.64478,    425.27765]],
                #  "classes": [0, 0],
                #  "confidences": [0.95, 0.88]
                #         }
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()

                files = {
                    "image": ("frame.jpg", frame_bytes, "image/jpeg")
                }
             
                # # data = {
                 
                # #     # "detections": json.dumps(detections)  # still send detection info
                # # }
                
                # resp = requests.post(
                #     "https://h5-descon.onrender.com/analyze_defect",
                #     files=files,
                #     json=payload,
                    

                #     timeout=120
                # )
                # pr=get_yolov12_predictions(model,frame)
                # res=send_predictions("https://h5-descon.onrender.com/analyze_defect","REPORT123","28.6139,77.2090",frame,pr)

                # print("Status:", res.status_code)
                # print("Response:", res.text)
                annotated = results[0].plot()
                filename = f"{user_key}_{uuid.uuid4().hex[:8]}.jpg"
                filepath = os.path.join(OUTPUT_DIR, filename)
                cv2.imwrite(filepath, annotated)
                annotated_urls.append(f"/outputs/{filename}")

                # Store in session
                if user_key not in video_sessions:
                    video_sessions[user_key] = {"detections": [], "images": []}
                video_sessions[user_key]["detections"].append(detection_json)
                video_sessions[user_key]["images"].append(filepath)
                all_detections.append(detection_json)



        cap.release()
        print(annotated_urls,"dkdw0",all_detections)
        _, buffer = cv2.imencode(".jpg", frame)
        frame_b64 = base64.b64encode(buffer).decode("utf-8")
        print(frame_b64)
        print("ddkwdwkdnwkdnwdnwkdnwkdw")
       






                                    
        return jsonify({
            "annotated_frames": annotated_urls,
            "detections": all_detections
        })

    except Exception as e:
        print("Error in upload-video:", e)
        return jsonify({"error": str(e)}), 500







@app.route("/outputs/<path:filename>", methods=["GET"])
def serve_output(filename):
    """Serve files from OUTPUT_DIR (annotated images, processed videos, etc)."""
    return send_from_directory(os.path.abspath(OUTPUT_DIR), filename, as_attachment=False)




# ---------- Run ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)  # turn off debug autoreload

