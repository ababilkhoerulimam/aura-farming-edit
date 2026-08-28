from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from .audio import AudioPlayer
from .buffer import BufferedFrame, nearest_frame, resize_cover


@dataclass
class ActiveEdit:
    started_at: float
    frames: list[BufferedFrame]


class EditEngine:
    def __init__(self, config: dict[str, Any], project_root: Path) -> None:
        self._stages = config.get("stages", [])
        self._layouts = config.get("layouts", {})
        self._project_root = project_root
        self._active: ActiveEdit | None = None
        self._audio = AudioPlayer()
        self._pre_sound = self._resolve_optional(config.get("pre_edit_sound"))
        self._post_sound = self._resolve_optional(config.get("post_edit_sound"))
        self._video_cache: dict[str, list[np.ndarray]] = {}

    def trigger(self, timestamp: float, frames: list[BufferedFrame]) -> bool:
        if self._active is not None or len(frames) < 2:
            return False
        self._active = ActiveEdit(timestamp, frames)
        self._audio.play(self._pre_sound)
        return True

    def cancel(self) -> None:
        self._active = None

    def render(self, live_frame: np.ndarray, timestamp: float) -> np.ndarray:
        output = live_frame.copy()
        if self._active is None:
            self._draw_waiting(output)
            return output
        elapsed = timestamp - self._active.started_at
        stage, local_elapsed = self._stage_at(elapsed)
        if stage is None:
            self._active = None
            self._audio.play(self._post_sound)
            self._draw_waiting(output)
            return output
        stage_frame = self._render_stage(stage, local_elapsed)
        if stage_frame is not None:
            self._place_overlay(output, stage_frame, str(stage.get("layout", "pip")))
        return output

    def _stage_at(self, elapsed: float) -> tuple[dict[str, Any] | None, float]:
        cursor = 0.0
        for stage in self._stages:
            duration = float(stage.get("duration", 1.0))
            if cursor <= elapsed < cursor + duration:
                return stage, elapsed - cursor
            cursor += duration
        return None, 0.0

    def _render_stage(self, stage: dict[str, Any], local_elapsed: float) -> np.ndarray | None:
        stage_type = stage.get("type", "live_replay")
        if stage_type == "external_video":
            frame = self._external_frame(stage, local_elapsed)
        elif stage_type == "montage":
            frame = self._montage_frame(stage)
        else:
            frame = self._replay_frame(stage, local_elapsed)
        if frame is not None and stage.get("text"):
            self._draw_stage_text(frame, str(stage["text"]), tuple(stage.get("text_color", [30, 30, 235])))
        return frame

    def _replay_frame(self, stage: dict[str, Any], local_elapsed: float) -> np.ndarray | None:
        assert self._active is not None
        offset = float(stage.get("source_offset_seconds", 3.0))
        playback_rate = float(stage.get("playback_rate", 1.0))
        target = self._active.started_at - offset + local_elapsed * playback_rate
        return nearest_frame(self._active.frames, target)

    def _montage_frame(self, stage: dict[str, Any]) -> np.ndarray | None:
        assert self._active is not None
        offsets = stage.get("offsets", [6.0, 3.0, 1.0])
        selected = [nearest_frame(self._active.frames, self._active.started_at - float(offset)) for offset in offsets]
        selected = [frame for frame in selected if frame is not None]
        if not selected:
            return None
        canvas = np.full((420, 900, 3), (15, 16, 20), dtype=np.uint8)
        for frame, (x, y) in zip(selected[:3], [(30, 90), (325, 35), (620, 90)]):
            tile = resize_cover(frame, 250, 280)
            canvas[y : y + 280, x : x + 250] = tile
            cv2.rectangle(canvas, (x, y), (x + 250, y + 280), (90, 255, 150), 2)
        return canvas

    def _external_frame(self, stage: dict[str, Any], local_elapsed: float) -> np.ndarray | None:
        relative_path = str(stage.get("file", ""))
        if not relative_path:
            return None
        frames = self._video_cache.get(relative_path)
        if frames is None:
            frames = self._load_video(self._project_root / relative_path)
            self._video_cache[relative_path] = frames
        if not frames:
            return self._missing_clip_frame(Path(relative_path).name)
        index = min(len(frames) - 1, max(0, int(local_elapsed * float(stage.get("fps", 30.0)))))
        return frames[index].copy()

    @staticmethod
    def _load_video(path: Path) -> list[np.ndarray]:
        if not path.exists():
            return []
        capture = cv2.VideoCapture(str(path))
        frames: list[np.ndarray] = []
        while len(frames) < 600:
            ok, frame = capture.read()
            if not ok:
                break
            frames.append(frame)
        capture.release()
        return frames

    @staticmethod
    def _missing_clip_frame(name: str) -> np.ndarray:
        frame = np.full((480, 640, 3), (12, 13, 18), dtype=np.uint8)
        cv2.putText(frame, "ADD MEME CLIP", (130, 220), cv2.FONT_HERSHEY_DUPLEX, 1.0, (85, 255, 155), 2, cv2.LINE_AA)
        cv2.putText(frame, name, (130, 265), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (170, 175, 185), 1, cv2.LINE_AA)
        return frame

    def _place_overlay(self, output: np.ndarray, overlay: np.ndarray, layout_name: str) -> None:
        height, width = output.shape[:2]
        layout = self._layouts.get(layout_name, self._layouts.get("pip", [0.69, 0.05, 0.28, 0.40]))
        x, y = int(float(layout[0]) * width), int(float(layout[1]) * height)
        overlay_width, overlay_height = int(float(layout[2]) * width), int(float(layout[3]) * height)
        overlay = resize_cover(overlay, overlay_width, overlay_height)
        output[y : y + overlay_height, x : x + overlay_width] = overlay
        cv2.rectangle(output, (x, y), (x + overlay_width, y + overlay_height), (88, 255, 150), 2)

    @staticmethod
    def _draw_waiting(frame: np.ndarray) -> None:
        height, width = frame.shape[:2]
        box_width, box_height = int(width * 0.26), int(height * 0.28)
        x, y = width - box_width - 24, 28
        overlay = frame.copy()
        cv2.rectangle(overlay, (x, y), (x + box_width, y + box_height), (9, 12, 16), -1)
        cv2.addWeighted(overlay, 0.83, frame, 0.17, 0, frame)
        color = (90, 255, 150)
        center = (x + box_width // 2, y + box_height // 2)
        cv2.line(frame, (center[0] - 55, center[1]), (center[0] + 55, center[1]), color, 1)
        cv2.line(frame, (center[0], center[1] - 55), (center[0], center[1] + 55), color, 1)
        cv2.circle(frame, center, 36, color, 1)
        cv2.putText(frame, "WAITING...", (center[0] - 48, center[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (225, 232, 229), 1, cv2.LINE_AA)
        cv2.rectangle(frame, (x, y), (x + box_width, y + box_height), color, 1)

    @staticmethod
    def _draw_stage_text(frame: np.ndarray, text: str, color: tuple[int, int, int]) -> None:
        height, width = frame.shape[:2]
        font_scale = max(1.0, width / 540)
        thickness = max(2, int(font_scale * 2))
        size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, font_scale, thickness)
        origin = ((width - size[0]) // 2, int(height * 0.82))
        cv2.putText(frame, text, origin, cv2.FONT_HERSHEY_DUPLEX, font_scale, (5, 5, 10), thickness + 5, cv2.LINE_AA)
        cv2.putText(frame, text, origin, cv2.FONT_HERSHEY_DUPLEX, font_scale, color, thickness, cv2.LINE_AA)

    def _resolve_optional(self, path: str | None) -> Path | None:
        return self._project_root / path if path else None
