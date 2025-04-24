from tensorflow.keras.models import load_model

def load_emotion_model(path="emotion_model.h5"):
    return load_model(path, compile=False)
