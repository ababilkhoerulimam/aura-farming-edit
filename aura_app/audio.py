from __future__ import annotations

import sys
from pathlib import Path


class AudioPlayer:
    def play(self, path: Path | None) -> None:
        if path is None or not path.exists() or path.suffix.lower() != ".wav":
            return
        if sys.platform == "win32":
            import winsound

            winsound.PlaySound(str(path), winsound.SND_FILENAME | winsound.SND_ASYNC)
