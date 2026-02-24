import subprocess
import os

# Base directory of backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, "audio")


def has_audio(video_path):
    """
    Returns True if video contains an audio stream.
    Uses ffprobe for reliable detection.
    """
    try:
        command = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "a",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
            video_path
        ]

        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )

        return bool(result.stdout.strip())

    except subprocess.CalledProcessError:
        return False
    except Exception as e:
        print("Audio detection error:", e)
        return False


def extract_audio(video_path):
    """
    Extracts audio from video and saves as 16kHz mono WAV
    inside uploads/audio folder.
    Returns absolute path of extracted audio.
    """

    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    if not has_audio(video_path):
        raise ValueError("No audio stream found in video.")

    os.makedirs(AUDIO_FOLDER, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(video_path))[0]
    output_audio_path = os.path.join(AUDIO_FOLDER, base_name + ".wav")

    # If already extracted, reuse it
    if os.path.exists(output_audio_path):
        return os.path.abspath(output_audio_path)

    try:
        command = [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_audio_path
        ]

        subprocess.run(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

        if not os.path.exists(output_audio_path):
            raise RuntimeError("Audio extraction failed.")

        return os.path.abspath(output_audio_path)

    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"FFmpeg extraction failed: {e}")
