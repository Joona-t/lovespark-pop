"""Live Strudel stream: serves the page and pushes patterns/live.strudel.js on every save.

Run: python3 tools/live/server.py [--port 4321] [--file patterns/live.strudel.js]
Open http://127.0.0.1:4321, click Start once (browsers need a click before audio).
Stdlib only. Binds to 127.0.0.1.
"""
import argparse, json, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAGE = Path(__file__).with_name("index.html")
SAMPLES = (ROOT / "samples").resolve()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=4321)
    ap.add_argument("--file", default="patterns/live.strudel.js")
    args = ap.parse_args()
    live = (ROOT / args.file).resolve()

    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_POST(self):
            # stills and audio takes made in the club page are saved to renders/ (local only, git-ignored)
            import re
            m = re.fullmatch(r"/save/([a-z0-9_-]{1,60}\.(?:png|webm|wav))", self.path)
            n = int(self.headers.get("Content-Length", 0))
            # only the club page itself may save: same-origin, plus a custom header a cross-site form cannot send
            ok_origin = self.headers.get("Origin", "") in (f"http://127.0.0.1:{args.port}", f"http://localhost:{args.port}")
            if not ok_origin or self.headers.get("X-Club-Save") != "1":
                self.send_error(403); return
            if not m or n <= 0 or n > 250_000_000:
                self.send_error(400); return
            out = ROOT / "renders"; out.mkdir(exist_ok=True)
            with open(out / m.group(1), "wb") as fh:                      # streamed, not held in memory
                left = n
                while left > 0:
                    chunk = self.rfile.read(min(left, 1 << 20))
                    if not chunk:
                        break
                    fh.write(chunk); left -= len(chunk)
            self.send_response(200); self.send_header("Content-Length", "2"); self.end_headers(); self.wfile.write(b"ok")
            print(f"saved renders/{m.group(1)} ({n} bytes)", flush=True)

        def do_GET(self):
            if self.path == "/":
                body = PAGE.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif self.path == "/events":
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                last = None
                try:
                    while True:
                        m = live.stat().st_mtime_ns if live.exists() else 0
                        if m != last:
                            last = m
                            code = live.read_text() if live.exists() else ""
                            msg = json.dumps({"code": code, "file": live.name, "t": time.time()})
                            self.wfile.write(f"data: {msg}\n\n".encode())
                            self.wfile.flush()
                            print(f"pushed {live.name} ({len(code)} chars)", flush=True)
                        else:
                            self.wfile.write(b": ping\n\n")
                            self.wfile.flush()
                        time.sleep(0.25)
                except (BrokenPipeError, ConnectionResetError):
                    return
            elif self.path.split("?")[0].rstrip("/") == "/club" or self.path.startswith(("/club/", "/patterns/", "/models/")):
                # the club stage page, the pattern files it plays, and local character models
                rel = self.path.split("?")[0].lstrip("/")
                if rel.rstrip("/") == "club":
                    rel = "tools/club/index.html"
                elif rel.startswith("club/"):
                    rel = "tools/" + rel
                f = (ROOT / rel).resolve()
                types = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".vrm": "model/gltf-binary", ".glb": "model/gltf-binary"}
                allowed = any(d in f.parents for d in ((ROOT / "tools" / "club").resolve(), (ROOT / "patterns").resolve(), (ROOT / "models").resolve()))
                if allowed and f.is_file() and f.suffix in types:
                    body = f.read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", types[f.suffix])
                    self.send_header("Content-Length", str(len(body)))
                    self.send_header("Cache-Control", "no-cache")
                    self.end_headers()
                    self.wfile.write(body)
                else:
                    self.send_error(404)
            elif self.path.startswith("/samples/"):
                # our own sample packs, served to the page only (same origin)
                f = (ROOT / self.path.lstrip("/").split("?")[0]).resolve()
                if SAMPLES in f.parents and f.is_file() and f.suffix in (".wav", ".json"):
                    body = f.read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", "audio/wav" if f.suffix == ".wav" else "application/json")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                else:
                    self.send_error(404)
            else:
                self.send_error(404)

    print(f"live stream on http://127.0.0.1:{args.port} watching {live}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), H).serve_forever()


if __name__ == "__main__":
    main()
