#!/usr/bin/env python3
"""
OCR for 《乡村造梦记》 scanned PDF.
Renders pages (PyMuPDF or pdf2image+Poppler) then runs PaddleOCR.

Usage (from vault/scripts/ocr, with venv activated):
  python ocr_book_sample.py --pages 1-10
  python ocr_book_sample.py --all --resume
  python ocr_book_sample.py --all --mobile --dpi 200
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("PADDLE_PDX_MODEL_SOURCE", "BOS")
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

SCRIPT_DIR = Path(__file__).resolve().parent
VAULT_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_RAW_DIR = VAULT_ROOT / "raw" / "longxun"
DEFAULT_SAMPLE_OUT = DEFAULT_RAW_DIR / "ocr-sample"
DEFAULT_FULL_OUT = DEFAULT_RAW_DIR / "ocr-full"
DEFAULT_COMBINED = DEFAULT_RAW_DIR / "zaomengji.txt"
REPO_TOOLS = VAULT_ROOT.parent / "tools" / "poppler"


def find_pdf(raw_dir: Path) -> Path:
    pdfs = sorted(raw_dir.glob("*.pdf"))
    if not pdfs:
        raise FileNotFoundError(f"No PDF in {raw_dir}")
    if len(pdfs) > 1:
        print(f"[warn] Multiple PDFs, using: {pdfs[0].name}", file=sys.stderr)
    return pdfs[0]


def parse_page_spec(spec: str, max_page: int | None) -> list[int]:
    """Parse '1-10' or '1,3,5' into 0-based page indices."""
    indices: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            start = int(a)
            end = int(b)
            if start < 1 or end < start:
                raise ValueError(f"Invalid range: {part}")
            for p in range(start, end + 1):
                indices.append(p - 1)
        else:
            p = int(part)
            if p < 1:
                raise ValueError(f"Page must be >= 1: {p}")
            indices.append(p - 1)
    if max_page is not None:
        indices = [i for i in indices if i < max_page]
    return sorted(set(indices))


def resolve_poppler_path(explicit: str | None) -> str | None:
    if explicit:
        p = Path(explicit)
        if (p / "pdftoppm.exe").exists() or p.name == "pdftoppm.exe":
            return str(p.parent if p.name == "pdftoppm.exe" else p)
        raise FileNotFoundError(f"Poppler not found at {explicit}")
    env = os.environ.get("POPPLER_PATH")
    if env and Path(env).exists():
        return env
    for candidate in (
        REPO_TOOLS / "Library" / "bin",
        REPO_TOOLS / "bin",
        Path(r"C:\Program Files\poppler\Library\bin"),
    ):
        if (candidate / "pdftoppm.exe").exists():
            return str(candidate)
    return None


def extract_text_from_result(result) -> str:
    """PaddleOCR 3.x predict() result -> plain text."""
    lines: list[str] = []
    for res in result:
        data = None
        if hasattr(res, "json"):
            data = res.json
            if callable(data):
                data = data()
        if data is None and hasattr(res, "res"):
            data = res.res
        if isinstance(data, dict):
            inner = data.get("res", data)
            texts = inner.get("rec_texts") or inner.get("rec_text") or []
            if isinstance(texts, list):
                lines.extend(str(t) for t in texts if str(t).strip())
    return "\n".join(lines)


def build_ocr(use_mobile: bool):
    from paddleocr import PaddleOCR

    kwargs = dict(
        lang="ch",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        device="cpu",
    )
    if use_mobile:
        kwargs.update(
            ocr_version="PP-OCRv4",
            text_detection_model_name="PP-OCRv4_mobile_det",
            text_recognition_model_name="PP-OCRv4_mobile_rec",
        )
    else:
        kwargs.update(
            ocr_version="PP-OCRv4",
            text_detection_model_name="PP-OCRv4_mobile_det",
            text_recognition_model_name="PP-OCRv4_server_rec_doc",
        )
    print("[ocr] loading PaddleOCR...")
    return PaddleOCR(**kwargs)


def _atomic_replace(src: Path, dest: Path) -> None:
    """Windows-safe replace (avoids Permission denied on overwrite)."""
    import os

    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(5):
        try:
            os.replace(str(src), str(dest))
            return
        except OSError:
            if attempt == 4:
                raise
            time.sleep(0.3)


def render_one_page_pymupdf(doc, idx: int, dpi: int, img_path: Path) -> None:
    import fitz

    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    page = doc.load_page(idx)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = img_path.with_suffix(".tmp.png")
    if tmp_path.exists():
        try:
            tmp_path.unlink()
        except OSError:
            pass
    pix.save(str(tmp_path))
    _atomic_replace(tmp_path, img_path)
    if not img_path.exists() or img_path.stat().st_size < 1024:
        raise RuntimeError(f"Invalid render for page {idx + 1}: {img_path}")


def render_one_page_pdf2image(
    pdf_path: Path, idx: int, dpi: int, poppler_path: str, img_path: Path
) -> None:
    from pdf2image import convert_from_path

    images = convert_from_path(
        str(pdf_path),
        dpi=dpi,
        first_page=idx + 1,
        last_page=idx + 1,
        poppler_path=poppler_path,
    )
    if not images:
        raise RuntimeError(f"pdf2image returned no image for page {idx + 1}")
    images[0].save(img_path, "JPEG", quality=92)


def page_txt_path(out_dir: Path, page_num: int) -> Path:
    return out_dir / f"page-{page_num:04d}.txt"


def combine_pages(out_dir: Path, page_count: int, combined_path: Path) -> int:
    parts: list[str] = []
    total_chars = 0
    for n in range(1, page_count + 1):
        p = page_txt_path(out_dir, n)
        text = p.read_text(encoding="utf-8").strip() if p.exists() else ""
        total_chars += len(text)
        parts.append(f"\n\n===== 第 {n} 页 =====\n\n{text}")
    combined_path.write_text("".join(parts).strip() + "\n", encoding="utf-8")
    return total_chars


def save_progress(out_dir: Path, data: dict) -> None:
    (out_dir / "progress.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def process_pages(
    pdf_path: Path,
    page_indices: list[int],
    out_dir: Path,
    dpi: int,
    use_mobile: bool,
    resume: bool,
    force_pymupdf: bool,
    poppler_path: str | None,
    combined_path: Path | None,
) -> int:
    import fitz

    out_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = out_dir / "_pages"
    cache_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    page_count = doc.page_count
    try:
        ocr = build_ocr(use_mobile)
        use_poppler = not force_pymupdf and poppler_path is not None

        meta_pages: list[dict] = []
        skipped = 0
        t_start = time.time()

        for i, idx in enumerate(page_indices):
            page_num = idx + 1
            txt_path = page_txt_path(out_dir, page_num)
            img_path = cache_dir / f"page-{page_num:04d}.png"

            if resume and txt_path.exists():
                text = txt_path.read_text(encoding="utf-8").strip()
                skipped += 1
                if (i + 1) % 20 == 0 or i == 0:
                    print(f"[skip] page {page_num}/{page_count} ({len(text)} chars, cached)")
                continue

            t0 = time.time()
            # Re-render whenever txt missing (retry after OCR failure)
            need_render = (
                not img_path.exists()
                or img_path.stat().st_size < 1024
            )
            legacy_jpg = cache_dir / f"page-{page_num:04d}.jpg"
            if legacy_jpg.exists():
                try:
                    legacy_jpg.unlink()
                except OSError:
                    pass

            text = ""
            ocr_ok = False
            for attempt in range(2):
                if need_render or attempt > 0:
                    for stale in (
                        img_path,
                        img_path.with_suffix(".tmp.png"),
                        cache_dir / f"page-{page_num:04d}.jpg",
                    ):
                        if stale.exists():
                            try:
                                stale.unlink()
                            except OSError:
                                pass
                    if use_poppler:
                        jpg_path = cache_dir / f"page-{page_num:04d}.jpg"
                        render_one_page_pdf2image(
                            pdf_path, idx, dpi, poppler_path, jpg_path
                        )
                        img_path = jpg_path
                    else:
                        render_one_page_pymupdf(doc, idx, dpi, img_path)

                try:
                    result = ocr.predict(str(img_path))
                    text = extract_text_from_result(result)
                    ocr_ok = True
                    break
                except Exception as exc:
                    print(
                        f"[error] page {page_num} attempt {attempt + 1}: {exc}",
                        file=sys.stderr,
                    )
                    err_log = out_dir / "errors.log"
                    with err_log.open("a", encoding="utf-8") as f:
                        f.write(f"page {page_num} attempt {attempt + 1}: {exc}\n")
                    need_render = True
                    time.sleep(0.5)

            elapsed = time.time() - t0

            if not ocr_ok:
                continue

            txt_path.write_text(text + "\n", encoding="utf-8")
            meta_pages.append(
                {
                    "page": page_num,
                    "chars": len(text),
                    "seconds": round(elapsed, 2),
                }
            )

            done = i + 1 - skipped
            total_done = sum(
                1 for n in range(1, page_count + 1) if page_txt_path(out_dir, n).exists()
            )
            eta = ""
            if done > 0:
                avg = (time.time() - t_start) / done
                remaining = len(page_indices) - (i + 1)
                eta = f", ETA ~{int(avg * remaining / 60)}m"

            preview = text[:50].replace("\n", " ")
            print(
                f"[{total_done}/{page_count}] page {page_num}: "
                f"{len(text)} chars, {elapsed:.1f}s{eta} | {preview}..."
            )

            if (i + 1) % 10 == 0:
                save_progress(
                    out_dir,
                    {
                        "updated": datetime.now(timezone.utc).isoformat(),
                        "completed_pages": total_done,
                        "total_pages": page_count,
                        "skipped_this_run": skipped,
                        "model": "mobile" if use_mobile else "server_rec_doc",
                    },
                )
    finally:
        doc.close()

    if combined_path:
        print("[combine] writing full text...")
        total_chars = combine_pages(out_dir, page_count, combined_path)
        print(f"[combine] {combined_path} ({total_chars} chars)")

    save_progress(
        out_dir,
        {
            "finished": datetime.now(timezone.utc).isoformat(),
            "completed_pages": sum(
                1 for n in range(1, page_count + 1) if page_txt_path(out_dir, n).exists()
            ),
            "total_pages": page_count,
            "total_chars": sum(
                len(page_txt_path(out_dir, n).read_text(encoding="utf-8"))
                for n in range(1, page_count + 1)
                if page_txt_path(out_dir, n).exists()
            ),
            "model": "mobile" if use_mobile else "server_rec_doc",
            "elapsed_minutes": round((time.time() - t_start) / 60, 1),
        },
    )

    meta = {
        "pages_processed_this_run": meta_pages,
        "skipped_cached": skipped,
        "model": "mobile" if use_mobile else "server_rec_doc",
    }
    (out_dir / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="OCR 乡村造梦记 PDF")
    parser.add_argument("--pdf", type=Path, default=None)
    parser.add_argument("--pages", default=None, help="e.g. 1-10; default 1-10 or all pages with --all")
    parser.add_argument("--all", action="store_true", help="Process entire PDF")
    parser.add_argument("--dpi", type=int, default=None, help="200 sample / 200 full mobile")
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument("--combined", type=Path, default=None, help="Merged output txt path")
    parser.add_argument("--poppler-path", default=None)
    parser.add_argument("--mobile", action="store_true", help="Faster mobile models (default for --all)")
    parser.add_argument("--server", action="store_true", help="Use PP-OCRv4_server_rec_doc (slower)")
    parser.add_argument("--resume", action="store_true", help="Skip pages with existing page-NNNN.txt")
    parser.add_argument("--force-pymupdf", action="store_true")
    args = parser.parse_args()

    if args.all:
        default_out = DEFAULT_FULL_OUT
        default_combined = DEFAULT_COMBINED
        default_pages = None
        default_dpi = 200 if args.mobile or not args.server else 250
        use_mobile = not args.server
    else:
        default_out = DEFAULT_SAMPLE_OUT
        default_combined = None
        default_pages = args.pages or "1-10"
        default_dpi = 200
        use_mobile = args.mobile

    if args.server:
        use_mobile = False
    elif args.mobile:
        use_mobile = True

    out_dir = args.out or default_out
    combined_path = args.combined if args.combined is not None else default_combined
    dpi = args.dpi if args.dpi is not None else default_dpi

    pdf_path = args.pdf or find_pdf(DEFAULT_RAW_DIR)
    if not pdf_path.exists():
        print(f"Error: PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    import fitz

    doc = fitz.open(pdf_path)
    page_count = doc.page_count
    doc.close()

    print(f"[info] PDF: {pdf_path}")
    print(f"[info] size: {pdf_path.stat().st_size / (1024**2):.1f} MB, pages: {page_count}")
    print(f"[info] out: {out_dir}, dpi: {dpi}, model: {'mobile' if use_mobile else 'server_rec_doc'}")

    if args.all:
        page_indices = list(range(page_count))
    else:
        page_indices = parse_page_spec(default_pages, page_count)

    if not page_indices:
        print("Error: no pages to process", file=sys.stderr)
        return 1

    print(f"[info] processing {len(page_indices)} pages (resume={args.resume})")

    poppler = None if args.force_pymupdf else resolve_poppler_path(args.poppler_path)
    if poppler:
        print(f"[info] render: pdf2image + poppler")
    else:
        print("[info] render: PyMuPDF")

    return process_pages(
        pdf_path,
        page_indices,
        out_dir,
        dpi,
        use_mobile,
        args.resume,
        args.force_pymupdf,
        poppler,
        combined_path,
    )


if __name__ == "__main__":
    sys.exit(main())
