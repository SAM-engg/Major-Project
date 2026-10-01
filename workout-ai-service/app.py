from flask import Flask, jsonify, Response
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.components import containers
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------------------- Global State --------------------
rep_counter = 0
stage = "down"
counter_active = False
feedback = "Press Start to begin workout"
angle_history = []
latest_landmarks = None

# -------------------- Angle Calculation --------------------
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180:
        angle = 360 - angle
    return angle

# -------------------- MediaPipe Setup --------------------
base_options = mp_tasks.BaseOptions(model_asset_path='pose_landmarker.task')
options = mp_vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=mp_vision.RunningMode.VIDEO,
    num_poses=1,
    min_pose_detection_confidence=0.7,
    min_pose_presence_confidence=0.7,
    min_tracking_confidence=0.7
)
detector = mp_vision.PoseLandmarker.create_from_options(options)

# Landmark indices (same as old mp_pose.PoseLandmark)
LEFT_SHOULDER  = 11
LEFT_ELBOW     = 13
LEFT_WRIST     = 15
RIGHT_SHOULDER = 12
RIGHT_ELBOW    = 14
RIGHT_WRIST    = 16

# -------------------- API CONTROLS --------------------
@app.route('/start_counter', methods=['POST'])
def start_counter():
    global counter_active, rep_counter, stage, feedback, angle_history
    counter_active = True
    rep_counter = 0
    stage = "down"
    angle_history.clear()
    feedback = "Workout started. Extend arms fully."
    return jsonify({"status": "started"})

@app.route('/stop_counter', methods=['POST'])
def stop_counter():
    global counter_active, feedback
    counter_active = False
    feedback = "Workout stopped"
    return jsonify({"status": "stopped"})

@app.route('/ai_status', methods=['GET'])
def ai_status():
    return jsonify({"reps": rep_counter, "stage": stage, "feedback": feedback})

# -------------------- VIDEO STREAM --------------------
def draw_landmarks(image, landmarks):
    """Draw pose landmarks manually."""
    h, w = image.shape[:2]
    connections = [
        (11,13),(13,15),(12,14),(14,16),  # arms
        (11,12),(11,23),(12,24),(23,24),  # torso
        (23,25),(25,27),(24,26),(26,28)   # legs
    ]
    for lm in landmarks:
        cx, cy = int(lm.x * w), int(lm.y * h)
        cv2.circle(image, (cx, cy), 5, (100, 255, 100), -1)
    for a, b in connections:
        if a < len(landmarks) and b < len(landmarks):
            ax, ay = int(landmarks[a].x * w), int(landmarks[a].y * h)
            bx, by = int(landmarks[b].x * w), int(landmarks[b].y * h)
            cv2.line(image, (ax, ay), (bx, by), (255, 100, 255), 2)

def generate_frames():
    global rep_counter, stage, counter_active, feedback, angle_history

    cap = cv2.VideoCapture(0,cv2.CAP_DSHOW)
    timestamp_ms = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success or frame is None:
            continue

        timestamp_ms +=60  # ~30fps

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        result = detector.detect_for_video(mp_image, timestamp_ms)

        try:
            if not result.pose_landmarks:
                raise ValueError("No landmarks")

            landmarks = result.pose_landmarks[0]

            def lm(idx):
                return [landmarks[idx].x, landmarks[idx].y]

            left_angle  = calculate_angle(lm(LEFT_SHOULDER),  lm(LEFT_ELBOW),  lm(LEFT_WRIST))
            right_angle = calculate_angle(lm(RIGHT_SHOULDER), lm(RIGHT_ELBOW), lm(RIGHT_WRIST))
            angle = min(left_angle, right_angle)

            angle_history.append(angle)
            if len(angle_history) > 5:
                angle_history.pop(0)
            angle = int(sum(angle_history) / len(angle_history))

            if counter_active:
                feedback = "Extend arms fully"
                if angle > 160:
                    stage = "down"
                    feedback = "Arms extended. Curl up!"
                if angle < 40 and stage == "down":
                    stage = "up"
                    rep_counter += 1
                    feedback = "Great rep! Now extend arms."
                if angle < 160 and stage == "up":
                    feedback = "Extend arms fully before next rep"

            draw_landmarks(frame, landmarks)

        except:
            if counter_active:
                feedback = "Adjust camera: full arms not visible"

        ret, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# -------------------- MAIN --------------------
if __name__ == '__main__':
    app.run(debug=True,port=5002)