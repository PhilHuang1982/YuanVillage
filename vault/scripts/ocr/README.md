# 《乡村造梦记》OCR 试跑

CPU 环境（无 NVIDIA GPU）：PaddleOCR + PDF 转图（优先 pdf2image+Poppler，否则 PyMuPDF）。

## 一次性安装

```powershell
cd h:\myProject\XianJian\vault\scripts\ocr
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple
```

可选 Poppler（供 pdf2image）：

- 下载 [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases)，解压到 `h:\myProject\XianJian\tools\poppler`
- 或设置 `$env:POPPLER_PATH = "C:\path\to\poppler\Library\bin"`

未安装 Poppler 时脚本会自动用 **PyMuPDF** 渲染，效果相同。

## 试跑前 10 页

```powershell
.\.venv\Scripts\Activate.ps1
python ocr_book_sample.py --pages 1-10 --dpi 200
```

输出目录：`vault/raw/longxun/ocr-sample/`

- `sample-pages.txt` — 合并文本
- `page-0001.txt` … — 单页
- `meta.json` — 耗时与预览
- `_pages/` — 渲染 JPG（可删）

更快试跑（mobile 模型）：

```powershell
python ocr_book_sample.py --pages 1-10 --mobile
```

## 全书 OCR（390 页，支持断点续跑）

```powershell
python ocr_book_sample.py --all --mobile --resume 2>&1 | Tee-Object -FilePath ..\..\raw\longxun\ocr-full\run.log
```

输出：

- `vault/raw/longxun/ocr-full/page-0001.txt` … — 单页
- `vault/raw/longxun/zaomengji.txt` — 全书合并（跑完后生成）
- `vault/raw/longxun/ocr-full/progress.json` — 进度

中断后重新执行同一条命令即可续跑（`--resume`）。
