import cv2
import numpy as np
from model_loader import load_emotion_model
from tensorflow.keras.preprocessing.image import img_to_array
from collections import deque  # For smoothing the predictions

# Load the emotion detection model
emotion_model = load_emotion_model()
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Queue to store the last few emotions (for smoothing)
emotion_history = deque(maxlen=5)  # Keep the last 5 predictions

# Confidence threshold to display the emotion
CONFIDENCE_THRESHOLD = 0.6  # Only show emotions with confidence > 60%

def detect_emotion_from_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)  # Convert frame to grayscale
    faces = face_detector.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)  # Detect faces
    detected = []

    # Loop through the detected faces
    for (x, y, w, h) in faces:
        roi = gray[y:y+h, x:x+w]  # Region of interest (ROI) for face
        roi = cv2.resize(roi, (64, 64))  # Resize to 64x64 as per the model's input shape
        roi = roi.astype("float32") / 255.0  # Normalize the image
        roi = img_to_array(roi)  # Convert to an array
        roi = np.expand_dims(roi, axis=0)  # Expand dims to make it (1, 64, 64, 1) for model input

        # Predict emotion using the model
        predictions = emotion_model.predict(roi, verbose=0)[0]
        label = emotion_labels[np.argmax(predictions)]  # Get the emotion label with the highest confidence
        confidence = np.max(predictions)  # Get the confidence score

        # Only update the history if the confidence is high enough
        if confidence > CONFIDENCE_THRESHOLD:
            emotion_history.append(label)

        # Most common emotion over the last few frames (smoothing)
        if len(emotion_history) > 0:
            # Get the most frequent emotion from the history
            smoothed_emotion = max(set(emotion_history), key=emotion_history.count)
        else:
            smoothed_emotion = label

        # Draw the label and bounding box on the frame
        cv2.putText(frame, f"{smoothed_emotion} ({round(confidence, 2)})", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Append the emotion details
        detected.append({
            "emotion": smoothed_emotion,
            "confidence": float(confidence),
            "box": [int(x), int(y), int(w), int(h)]
        })

    return frame, detected
