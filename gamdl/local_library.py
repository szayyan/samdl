from pathlib import Path
from mutagen.mp4 import MP4

def get_local_library_song_ids(path: Path):
    m4a_files = list(path.glob('**/*.m4a'))
    ids = [MP4(file).get('cnID')[0] for file in m4a_files]
    return ids
