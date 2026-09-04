#!/usr/bin/env python3
"""Bundle 手机训练多文件版为单文件 HTML。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

SCRIPTS = [
    "lib/cubejs.js",
    "lib/cube.js",
    "lib/cube-draw.js",
    "lib/scramble.js",
    "lib/cross-solver.js",
    "lib/storage.js",
    "data/f2l-cases.js",
    "data/pll-cases.js",
    "data/plans.js",
    "app.js",
]


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def main():
    html = read(ROOT / "index.html")
    css = read(ROOT / "styles.css")

    html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
    html = html.replace(
        '  <link rel="manifest" href="manifest.webmanifest" />\n'
        '  <link rel="apple-touch-icon" href="icons/icon-192.png" />\n'
        '  <link rel="icon" href="icons/icon-192.png" />\n',
        "",
    )
    html = html.replace(
        '  <div id="app">',
        '  <div class="card" style="margin:12px 16px 0;border-color:#4ecdc4"><p class="muted">这是<strong>单文件版</strong>，可拷到手机用浏览器直接打开。进度仍存本机。</p></div>\n  <div id="app">',
    )

    start_marker = '  <script src="lib/cubejs.js"></script>'
    end_marker = '  <script src="app.js"></script>'
    i0 = html.find(start_marker)
    i1 = html.find(end_marker)
    if i0 < 0 or i1 < 0:
        raise SystemExit("Could not find script markers in index.html")
    i1 = html.find("\n", i1) + 1

    js_parts = []
    for rel in SCRIPTS:
        js_parts.append(f"/* ===== {rel} ===== */\n{read(ROOT / rel)}")
    script_block = "\n".join(f"<script>\n{part}\n</script>" for part in js_parts) + "\n"

    sw_start = html.find('  <script>\n    if ("serviceWorker"')
    if sw_start >= 0:
        sw_end = html.find("</script>", sw_start) + len("</script>")
        html = html[:sw_start] + html[sw_end:]

    html = html[:i0] + script_block + html[i1:]

    out = ROOT / "手机训练-单文件.html"
    out.write_text(html, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
