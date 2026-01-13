import os
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT_DIR = os.path.join(os.path.dirname(__file__), "frontend")
PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        print(f"POST {self.path} ctype={self.headers.get('Content-Type','')}")
        if self.path.startswith("/backend/auth.php"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            ctype = self.headers.get("Content-Type", "")

            email = ""
            password = ""
            if "application/x-www-form-urlencoded" in ctype:
                data = urllib.parse.parse_qs(body)
                email = (data.get("email") or [""])[0]
                password = (data.get("password") or [""])[0]
            elif "application/json" in ctype:
                try:
                    import json
                    payload = json.loads(body)
                    email = payload.get("email", "")
                    password = payload.get("password", "")
                except Exception:
                    pass

            if email and password:
                # Simulate role selection; default to 'agent'
                role = "agent"
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.end_headers()
                self.wfile.write(role.encode("utf-8"))
            else:
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.end_headers()
                self.wfile.write(b"Denied")
            return
        if "/backend/buy.php" in self.path:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            ctype = self.headers.get("Content-Type", "")
            network = volume = number = ""
            externalref = ""
            if "application/json" in ctype:
                import json
                try:
                    payload = json.loads(body)
                    network = payload.get("network","")
                    volume = str(payload.get("volume",""))
                    number = payload.get("customer_number","")
                    externalref = payload.get("externalref","")
                except Exception:
                    pass
            else:
                data = urllib.parse.parse_qs(body)
                network = (data.get("network") or [""])[0]
                volume = (data.get("volume") or [""])[0]
                number = (data.get("customer_number") or [""])[0]
                externalref = (data.get("externalref") or [""])[0]
            if not externalref:
                externalref = f"api_{int(__import__('time').time())}"
            if not network or not volume or not number:
                self.send_response(200)
                self.send_header("Content-Type","application/json")
                self.end_headers()
                self.wfile.write(b'{"status":0,"message":"Missing fields"}')
                return
            # If API key exists, forward to live Datawax API; otherwise mock
            api_key = os.environ.get("DATAWAX_API_KEY", "")
            if api_key:
                import json, urllib.request
                payload = {
                    "network": network,
                    "volume": str(volume),
                    "customer_number": number,
                    "externalref": externalref
                }
                data_bytes = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    "https://datawax.site/wp-json/api/v1/place",
                    data=data_bytes,
                    headers={
                        "X-API-KEY": api_key,
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                try:
                    with urllib.request.urlopen(req, timeout=20) as resp:
                        status = resp.status
                        body = resp.read()
                        self.send_response(status)
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(body)
                except Exception as e:
                    msg = {"status": 0, "message": f"Request error: {e}"}
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(msg).encode("utf-8"))
                return
            else:
                # Simulated success payload
                resp = {
                    "status": 1,
                    "message": "Order created",
                    "order_id": 3124,
                    "amount": "6.00",
                    "network": network,
                    "volume": volume,
                    "number": number,
                    "txref": externalref,
                    "wc_status": "processing"
                }
                import json
                self.send_response(200)
                self.send_header("Content-Type","application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

        # Fallback: 501 for unsupported POST targets
        self.send_response(501)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Unsupported method ('POST')")

    def do_GET(self):
        if self.path.startswith("/backend/logout.php"):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Logged out")
            return
        return super().do_GET()

def main():
    os.chdir(ROOT_DIR)
    server = ThreadingHTTPServer(("", PORT), Handler)
    print(f"Serving frontend and mock backend on http://localhost:{PORT}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
