# Python desktop instant-edit plan

_Corrected architecture for the Aura Farming project. This replaces the earlier browser-based photo generator direction._

---

## 📋 Product definition

The active product is a Python desktop application launched from a terminal. It opens a native OpenCV window named MONITOR and does not start a web server or use localhost.

The application continuously captures webcam frames into a rolling buffer. When an edit is triggered, recent camera moments are replayed and combined with configured meme clips, text, layouts, and sounds directly over the live monitor.

## 🎯 Core behavior

1. Launch with PowerShell or Python
2. Open webcam in the MONITOR window
3. Detect and outline the primary face
4. Show WAITING in the top-right overlay slot
5. Keep the latest camera frames in memory
6. Trigger an edit with Space or S
7. Replay recent frames as picture-in-picture and wide overlays
8. Insert optional external meme clips
9. Show text effects and a multi-frame montage
10. Return to WAITING

## 🏗️ Runtime architecture

~~~mermaid
flowchart LR
    accTitle: Desktop Instant Edit Runtime
    accDescr: The webcam feeds a rolling buffer and live monitor while the edit engine replays recent moments through configured overlays.

    camera[Webcam] --> live[Live monitor]
    camera --> buffer[Rolling frame buffer]
    detector[Face detector] --> live
    buffer --> trigger[Edit trigger]
    config[Timeline JSON] --> engine[Edit engine]
    clips[Meme clips and WAV sounds] --> engine
    trigger --> engine
    engine --> overlay[Animated overlay]
    overlay --> live
~~~

## 🧰 Active stack

| Area | Technology |
| --- | --- |
| Runtime | Python 3.11+ |
| Camera/window | OpenCV |
| Image arrays | NumPy |
| Face detection | OpenCV Haar cascade |
| Rolling history | collections.deque |
| Timeline | JSON |
| WAV playback | Windows winsound |
| External clips | OpenCV VideoCapture |

## ⌨️ Controls

| Key | Action |
| --- | --- |
| Space or S | Trigger the configured edit |
| R | Cancel the edit and return to WAITING |
| Q or Escape | Close the application |

## 🧩 Timeline stage types

| Type | Purpose |
| --- | --- |
| live_replay | Replay a recent moment from the rolling camera buffer |
| external_video | Play a configured meme/reaction clip |
| montage | Display multiple captured moments in one overlay |

Each stage supports duration and layout. Replay stages additionally support source offset, playback speed, text, and text color.

## 🗂️ Active files

~~~text
main.py
aura_app/
  app.py
  audio.py
  buffer.py
  edit_engine.py
  face.py
config/
  edit_timeline.json
assets/
  edits/
  sounds/
requirements.txt
run.ps1
~~~

## ✅ Implemented

- [x] Native desktop window
- [x] Webcam capture
- [x] Mirrored live preview
- [x] Face detection box
- [x] WAITING overlay
- [x] Rolling camera buffer
- [x] Keyboard trigger
- [x] Picture-in-picture replay
- [x] Wide replay
- [x] Text overlay
- [x] Multi-frame montage
- [x] External video support
- [x] Optional WAV sound support
- [x] JSON timeline configuration
- [x] PowerShell launcher

## 🛣️ Next phases

### Phase A — Reference matching

- Add the actual meme clips
- Add pre-edit and post-edit sounds
- Tune stage timing against the reference
- Tune overlay positions and sizes
- Reproduce the exact WAITING HUD

### Phase B — Trigger intelligence

- Trigger from a timer, gesture, or detected action
- Add cooldown and armed states
- Add visible trigger feedback

### Phase C — Recording and export

- Record the composed monitor output
- Preserve audio synchronization
- Save MP4 sessions
- Add automatic file naming

### Phase D — Production polish

- Improve face tracking stability
- Add camera selection
- Add fullscreen mode
- Validate configuration errors
- Package as a standalone Windows executable

---

_Status: Python desktop foundation implemented. Asset and timing matching remains._

