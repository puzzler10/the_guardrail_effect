"""Capture screenshot of running app for quality review.

Usage:
  python scripts/quality-screenshot.py [--port 5173] [--output /tmp/app-screenshot.png] [--wait 5]

Requires: pip install playwright && playwright install chromium
"""
import argparse
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description="Capture app screenshot for quality review")
    parser.add_argument("--port", default=5173, type=int, help="Dev server port")
    parser.add_argument("--output", default="/tmp/app-screenshot.png", help="Output path")
    parser.add_argument("--wait", default=5, type=int, help="Seconds to wait for particles to populate")
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"http://localhost:{args.port}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(args.wait * 1000)
        page.screenshot(path=args.output, full_page=False)
        browser.close()

    print(f"Screenshot saved: {args.output}")


if __name__ == "__main__":
    main()
