import whisper
import os

# Recommended model for better punctuation:
# "small" gives noticeably better punctuation than "base"
model = whisper.load_model("small")   # change to "base" if performance is slow


def audio_to_text(audio_path):
    """
    Converts 16kHz mono WAV audio to text using OpenAI Whisper.
    Returns transcript with automatic punctuation and capitalization.
    """

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    try:
        result = model.transcribe(
            audio_path,
            language="en",          # specify language for better punctuation
            task="transcribe",      # ensures transcription (not translation)
            fp16=False,             # important if running on CPU
            temperature=0.0         # more stable decoding
        )

        text = result["text"].strip()
        return text

    except Exception as e:
        raise RuntimeError(f"Whisper transcription failed: {e}")
