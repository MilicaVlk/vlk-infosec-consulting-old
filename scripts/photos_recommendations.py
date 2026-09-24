"""Legacy photo migration helper intentionally disabled."""

from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
APPROVED_ASSET = PROJECT / "public" / "assets" / "milica-vlk-portrait.webp"

if __name__ == "__main__":
    if not APPROVED_ASSET.exists():
        raise SystemExit("Approved portrait asset is missing")
    print("No photo migration performed; approved portrait retained.")
