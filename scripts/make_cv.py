"""Build a one-click English CV PDF. Replace the output file if you have your own."""

from pathlib import Path


PAGE_W, PAGE_H = 595, 842


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Pdf:
    def __init__(self) -> None:
        self.objects: list[bytes] = []

    def add(self, body: bytes) -> int:
        self.objects.append(body)
        return len(self.objects)

    def build(self) -> bytes:
        out = bytearray(b"%PDF-1.4\n")
        offsets = []
        for index, body in enumerate(self.objects, start=1):
            offsets.append(len(out))
            out += f"{index} 0 obj\n".encode("ascii")
            out += body
            out += b"\nendobj\n"
        xref = len(out)
        out += f"xref\n0 {len(self.objects) + 1}\n".encode("ascii")
        out += b"0000000000 65535 f \n"
        for offset in offsets:
            out += f"{offset:010d} 00000 n \n".encode("ascii")
        out += (
            f"trailer<< /Size {len(self.objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref}\n%%EOF"
        ).encode("ascii")
        return bytes(out)


def text(size: int, x: int, y: int, line: str, font: str = "F1", color: tuple[float, float, float] = (0.1, 0.08, 0.06)) -> str:
    r, g, b = color
    return f"{r:.3f} {g:.3f} {b:.3f} rg BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({esc(line)}) Tj ET"

def main() -> None:
    brass = (0.55, 0.39, 0.19)
    muted = (0.38, 0.34, 0.30)
    ink = (0.1, 0.08, 0.06)

    commands = [
        "0.831 0.651 0.337 rg",
        "0 818 595 24 re f",
        "0.965 0.945 0.906 rg",
        "48 790 120 8 re f",
        text(26, 48, 748, "AHMAD ELIWI", "F2"),
        text(12, 48, 726, "Software Engineer", "F1", brass),
        text(11, 48, 708, "Damascus University  ·  Damascus, Syria", "F1", muted),
        text(10, 48, 684, "ahmadadd619@gmail.com", "F1"),
        text(10, 230, 684, "+963 943 893 722", "F1"),
        text(10, 380, 684, "github.com/Eliwi234", "F1"),
        "0.10 0.08 0.06 RG",
        "48 668 m 547 668 l S",
        text(9, 48, 646, "PROFILE", "F2", brass),
        text(11, 48, 626, "Software engineer and a graduate of Damascus University. Builds complete", "F1", ink),
        text(11, 48, 610, "web products: Arabic interfaces, Laravel and FastAPI servers, and an", "F1", ink),
        text(11, 48, 594, "information-retrieval system that measures ranking quality.", "F1", ink),
        text(9, 48, 566, "SELECTED WORK", "F2", brass),
    ]

    blocks = [
        ("KitchenX  ·  2026", "Home-chef platform: meals, orders, drivers, coupons, settlements, reports, realtime notices. React, TypeScript."),
        ("Information Retrieval  ·  2026", "BM25, TF-IDF, Sentence-BERT, rank fusion, MAP and nDCG, answers grounded in retrieved documents. FastAPI, Streamlit."),
        ("Python Curriculum  ·  2026", "Arabic four-level curriculum for technical institutes, from language basics toward broader topics."),
        ("Python Adventure  ·  2026", "Interactive first steps in Python: short missions, sessions, and a progress trail. React."),
        ("Banking System  ·  2025", "Accounts, transactions, scheduled transfers, approvals, reports, support tickets. React and Laravel."),
        ("Complaints System  ·  2025", "Admin, agency, and employee flow with types, departments, attachments, and a handling history."),
        ("Compiler Front End  ·  2025", "Java and ANTLR: lexer, parser, abstract syntax tree, symbol table, semantic checks."),
        ("HyperWifi  ·  2026", "Arabic landing page that collects an internet subscription and hands it to WhatsApp."),
    ]

    y = 544
    for title, body in blocks:
        commands.append(text(11, 48, y, title, "F2"))
        commands.append(text(10, 48, y - 16, body, "F1", muted))
        y -= 40

    commands += [
        text(9, 48, y - 4, "SKILLS", "F2", brass),
        text(10, 48, y - 22, "React, TypeScript, JavaScript, Tailwind, PHP, Laravel, Python, FastAPI,", "F1"),
        text(10, 48, y - 36, "BM25, Sentence-BERT, SQLite, Java, ANTLR, Git.", "F1"),
        text(9, 48, y - 60, "EDUCATION", "F2", brass),
        text(11, 48, y - 78, "Damascus University - Software Engineering", "F2"),
        text(9, 48, 46, "Portfolio CV  ·  Ahmad Eliwi  ·  ahmadadd619@gmail.com", "F1", muted),
    ]

    stream = "\n".join(commands).encode("latin-1", "replace")
    pdf = Pdf()
    # 1 catalog, 2 pages, 3 page, 4 contents, 5 font, 6 font bold, 7 annots live inside page
    font = pdf.add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold = pdf.add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    contents = pdf.add(f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream")

    def link(x1, y1, x2, y2, uri: str) -> str:
        return (
            f"<< /Type /Annot /Subtype /Link /Rect [{x1} {y1} {x2} {y2}] /Border [0 0 0] "
            f"/A << /Type /Action /S /URI /URI ({esc(uri)}) >> >>"
        )

    annots = " ".join(
        [
            link(48, 678, 210, 696, "mailto:ahmadadd619@gmail.com"),
            link(230, 678, 360, 696, "tel:+963943893722"),
            link(380, 678, 530, 696, "https://github.com/Eliwi234"),
        ]
    )
    page = pdf.add(
        (
            f"<< /Type /Page /Parent 5 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Contents {contents} 0 R /Resources << /Font << /F1 {font} 0 R /F2 {font_bold} 0 R >> >> "
            f"/Annots [{annots}] >>"
        ).encode("ascii")
    )
    pages = pdf.add(f"<< /Type /Pages /Kids [{page} 0 R] /Count 1 >>".encode("ascii"))
    catalog = pdf.add(b"<< /Type /Catalog /Pages 5 0 R >>")

    # Object numbers were assigned before catalog/pages. Rebuild in a stable order instead.
    # The IDs above depend on insertion order. Re-create explicitly to avoid a broken tree.
    del catalog, pages
    ordered = Pdf()
    # We will ignore the first builder and emit a known layout.
    font_body = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    bold_body = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
    content_body = f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream"
    page_body = (
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
        f"/Contents 5 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
        f"/Annots [{annots}] >>"
    ).encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [6 0 R] /Count 1 >>",
        font_body,
        bold_body,
        content_body,
        page_body,
    ]
    for body in objects:
        ordered.add(body)
    target = Path(__file__).resolve().parents[1] / "assets" / "cv" / "Ahmad-Eliwi-CV.pdf"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(ordered.build())
    print(target, target.stat().st_size)


if __name__ == "__main__":
    main()
