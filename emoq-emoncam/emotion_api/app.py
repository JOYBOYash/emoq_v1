from flask import Flask, request, jsonify
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Initialize the Flask app
app = Flask(__name__)

# Load your pre-trained emotion detection model (change the path to your model)
emotion_model = load_model('path_to_your_model.h5')  # Replace with the correct model file

# Define emotion labels (based on the training of your model)
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    try:
        # Receive the image from the POST request
        data = request.get_json()
        
        # Image is passed as a base64 string
        image_data = np.array(data['image'], dtype=np.uint8)  
        frame = cv2.imdecode(image_data, cv2.IMREAD_COLOR)  # Decode the image
        
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        detected_emotions = []

        for (x, y, w, h) in faces:
            roi = gray[y:y+h, x:x+w]
            roi = cv2.resize(roi, (48, 48))  # Resize to the model's input shape
            roi = roi.astype("float") / 255.0  # Normalize
            roi = img_to_array(roi)  # Convert to array
            roi = np.expand_dims(roi, axis=0)  # Add batch dimension

            # Predict emotion for this face
            predictions = emotion_model.predict(roi, verbose=0)[0]
            label = emotion_labels[np.argmax(predictions)]  # Get the emotion with the highest probability
            confidence = round(np.max(predictions), 2)  # Confidence level

            # Append the result to the response
            detected_emotions.append({
                "emotion": label,
                "confidence": float(confidence),
                "box": [int(x), int(y), int(w), int(h)]  # Face bounding box
            })

        # Send the detected emotions as JSON response
        return jsonify({
            "status": "success",
            "emotions": detected_emotions
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
