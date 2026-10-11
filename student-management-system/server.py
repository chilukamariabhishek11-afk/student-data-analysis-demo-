#!/usr/bin/env python3
"""
server.py - Lightweight local web server for EduFlow Student Management System.
Uses Python's standard library http.server (no external dependencies required).
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Format clean console logs
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

def start_server(port=PORT):
    for p in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                url = f"http://localhost:{p}"
                print("=" * 60)
                print(f"🚀 EduFlow Student Management System is running!")
                print(f"👉 Local URL: {url}")
                print(f"📁 Serving from: {DIRECTORY}")
                print("Press Ctrl+C to stop the server.")
                print("=" * 60)
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 98 or e.errno == 10048:
                continue
            else:
                raise e

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully.")
