"""The CV PDF is exported from cv.html so the file matches the page.

Regenerate it with Chrome:

  chrome --headless --disable-gpu --no-pdf-header-footer ^
    --print-to-pdf=assets/cv/Ahmad-Eliwi-CV.pdf ^
    http://127.0.0.1:8765/cv.html
"""

print("Edit cv.html, then print that page to assets/cv/Ahmad-Eliwi-CV.pdf.")
