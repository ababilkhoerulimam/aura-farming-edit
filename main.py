from __future__ import annotations

import argparse
import json
from pathlib import Path

from aura_app.app import AuraMonitorApp


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Aura Farming live instant-edit monitor")
    parser.add_argument("--config", type=Path, default=Path("config/edit_timeline.json"))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config_path = args.config.resolve()
    if not config_path.exists():
        raise SystemExit(f"Configuration file not found: {config_path}")
    with config_path.open("r", encoding="utf-8") as config_file:
        config = json.load(config_file)
    AuraMonitorApp(config=config, project_root=Path(__file__).resolve().parent).run()


if __name__ == "__main__":
    main()
