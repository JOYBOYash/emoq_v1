from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from emotion_detector import detect_emotion_from_frame

app = Flask(__name__)
CORS(app)

last_emotions = []

def gen_video():
    global last_emotions
    cap = cv2.VideoCapture(0)

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame, emotions = detect_emotion_from_frame(frame)
        last_emotions = emotions

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(gen_video(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/emotion_data')
def emotion_data():
    return jsonify(last_emotions)

@app.route('/ping')
def ping():
    return jsonify({"status": "Server is running ✅"})

if __name__ == '__main__':
    app.run(debug=True)
