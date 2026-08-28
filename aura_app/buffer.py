from __future__ import annotations

from collections import deque
from dataclasses import dataclass

import cv2
import numpy as np


@dataclass(frozen=True)
class BufferedFrame:
    timestamp: float
    image: np.ndarray


class RollingFrameBuffer:
    def __init__(self, seconds: float, target_fps: float) -> None:
        self._frames: deque[BufferedFrame] = deque(maxlen=max(2, int(seconds * target_fps)))

    def append(self, timestamp: float, frame: np.ndarray) -> None:
        self._frames.append(BufferedFrame(timestamp, frame.copy()))

    def snapshot(self) -> list[BufferedFrame]:
        return list(self._frames)


def nearest_frame(frames: list[BufferedFrame], target_timestamp: float) -> np.ndarray | None:
    if not frames:
        return None
    return min(frames, key=lambda item: abs(item.timestamp - target_timestamp)).image.copy()


def resize_cover(frame: np.ndarray, width: int, height: int) -> np.ndarray:
    source_height, source_width = frame.shape[:2]
    source_ratio = source_width / source_height
    target_ratio = width / height
    if source_ratio > target_ratio:
        crop_width = int(source_height * target_ratio)
        start_x = max(0, (source_width - crop_width) // 2)
        frame = frame[:, start_x : start_x + crop_width]
    else:
        crop_height = int(source_width / target_ratio)
        start_y = max(0, (source_height - crop_height) // 2)
        frame = frame[start_y : start_y + crop_height, :]
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
