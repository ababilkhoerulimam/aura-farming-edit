from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np


@dataclass(frozen=True)
class FaceBox:
    x: int
    y: int
    width: int
    height: int


class FaceTracker:
    def __init__(self) -> None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(cascade_path)

    def detect_primary(self, frame: np.ndarray) -> FaceBox | None:
        gray = cv2.equalizeHist(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))
        faces = self._cascade.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=6, minSize=(72, 72))
        if len(faces) == 0:
            return None
        x, y, width, height = max(faces, key=lambda item: item[2] * item[3])
        return FaceBox(int(x), int(y), int(width), int(height))

    @staticmethod
    def draw(frame: np.ndarray, box: FaceBox | None) -> None:
        if box is None:
            return
        x, y, width, height = box.x, box.y, box.width, box.height
        color = (82, 255, 142)
        cv2.rectangle(frame, (x, y), (x + width, y + height), color, 2)
        cv2.rectangle(frame, (x + 8, y - 20), (x + 112, y), color, -1)
        cv2.putText(frame, "SUBJECT", (x + 13, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (15, 28, 20), 1, cv2.LINE_AA)
        depth = 12
        cv2.line(frame, (x, y), (x + depth, y - depth), color, 1)
        cv2.line(frame, (x + width, y), (x + width + depth, y - depth), color, 1)
        cv2.line(frame, (x + depth, y - depth), (x + width + depth, y - depth), color, 1)
