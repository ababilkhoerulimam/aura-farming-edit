from __future__ import annotations

import time
from pathlib import Path
from typing import Any

import cv2

from .buffer import RollingFrameBuffer
from .edit_engine import EditEngine
from .face import FaceTracker


class AuraMonitorApp:
    def __init__(self, config: dict[str, Any], project_root: Path) -> None:
        camera_config = config.get("camera", {})
        self._camera_index = int(camera_config.get("index", 0))
        self._width = int(camera_config.get("width", 1280))
        self._height = int(camera_config.get("height", 720))
        self._target_fps = float(camera_config.get("fps", 30))
        self._window_name = str(config.get("window_name", "MONITOR"))
        self._mirror = bool(camera_config.get("mirror", True))
        self._buffer = RollingFrameBuffer(float(config.get("rolling_buffer_seconds", 12)), self._target_fps)
        self._face_tracker = FaceTracker()
        self._edit_engine = EditEngine(config.get("edit", {}), project_root)

    def run(self) -> None:
        capture = cv2.VideoCapture(self._camera_index, cv2.CAP_DSHOW)
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, self._width)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self._height)
        capture.set(cv2.CAP_PROP_FPS, self._target_fps)
        if not capture.isOpened():
            raise SystemExit(f"Could not open camera index {self._camera_index}")

        cv2.namedWindow(self._window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(self._window_name, self._width, self._height)
        try:
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                if self._mirror:
                    frame = cv2.flip(frame, 1)

                now = time.monotonic()
                self._buffer.append(now, frame)
                face = self._face_tracker.detect_primary(frame)
                output = self._edit_engine.render(frame, now)
                self._face_tracker.draw(output, face)
                self._draw_hud(output)

                cv2.imshow(self._window_name, output)
                key = cv2.waitKey(1) & 0xFF
                if key in (ord("q"), 27):
                    break
                if key in (ord(" "), ord("s")):
                    self._edit_engine.trigger(now, self._buffer.snapshot())
                if key == ord("r"):
                    self._edit_engine.cancel()
        finally:
            capture.release()
            cv2.destroyAllWindows()

    @staticmethod
    def _draw_hud(frame) -> None:
        height, width = frame.shape[:2]
        color = (90, 255, 150)
        cv2.putText(frame, "LIVE", (26, 34), cv2.FONT_HERSHEY_DUPLEX, 0.65, color, 1, cv2.LINE_AA)
        cv2.circle(frame, (16, 28), 5, (45, 70, 245), -1)
        cv2.putText(frame, "CAM_01", (width - 90, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (225, 232, 229), 1, cv2.LINE_AA)
        cv2.putText(frame, "REC", (22, height - 22), cv2.FONT_HERSHEY_SIMPLEX, 0.48, color, 1, cv2.LINE_AA)
        cv2.putText(frame, "SPACE/S: TRIGGER EDIT   R: RESET   Q/ESC: QUIT", (120, height - 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 205, 210), 1, cv2.LINE_AA)
