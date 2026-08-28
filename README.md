# Aura Farming Instant Edit

Python desktop application that opens a live camera monitor, keeps a rolling frame buffer, and plays instant meme edits as overlays. It does not use a browser or localhost.

## Run

Install Python 3.11 or newer, then run:

```powershell
.\run.ps1
```

After the first dependency installation, the application opens a desktop window named `MONITOR`.

## Controls

| Key | Action |
| --- | --- |
| Space or S | Trigger instant edit |
| R | Cancel edit and return to waiting |
| Q or Escape | Close application |

## How it works

1. Webcam frames are stored in a rolling 12-second buffer.
2. Face detection draws a live subject box.
3. Pressing Space or S snapshots the rolling buffer.
4. The configured timeline replays recent moments as picture-in-picture, wide overlays, text shots, and a montage.
5. Optional external meme clips and WAV sounds are loaded from `assets/`.

Edit the sequence in [config/edit_timeline.json](config/edit_timeline.json).

## Project status

The Python desktop implementation is the active product. The existing React files are an earlier prototype and are retained temporarily for reference.
