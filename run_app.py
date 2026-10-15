"""
TaskMate AI - Launcher Script
Starts both the FastAPI backend and Vite frontend concurrently.
"""

import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("==================================================")
    print("      TaskMate AI - Freelancer Assistant          ")
    print("==================================================")
    print(f"Working Directory: {root_dir}")
    print("Starting FastAPI Backend on http://127.0.0.1:8000 ...")

    # Start FastAPI backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=root_dir
    )

    time.sleep(2)

    print("Starting Vite Frontend on http://127.0.0.1:5173 ...")
    # Start Vite frontend
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("\n[OK] TaskMate AI is up and running!")
    print("-> Frontend Application: http://127.0.0.1:5173")
    print("-> Backend API & Docs:   http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping TaskMate AI servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
