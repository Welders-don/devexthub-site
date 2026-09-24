#!/usr/bin/env python3
# Макеты нейтральной таблицы (без бренда Sheets/Excel) для захода PDF #4.
# paste = что получается при копипасте из PDF: вся строка в колонке A.
# csv   = наш .csv, открытый в таблице: каждое значение в своей ячейке.
import sys, html
sys.path.insert(0, "../../pdf-samples")
from gen_statement import rows

R = rows()
HEAD = ("DATE", "DESCRIPTION", "DEBIT", "CREDIT", "BALANCE")
N = 22  # строк в кадре

CSS = """
body{margin:0;font-family:'Liberation Sans',Arial,sans-serif;background:#e9ecef}
.win{margin:0;background:#fff;height:1080px;display:flex;flex-direction:column}
.bar{height:64px;background:#f6f8f7;border-bottom:1px solid #d5dbd8;display:flex;align-items:center;padding:0 28px;gap:18px}
.dot{width:14px;height:14px;border-radius:50%;background:#cfd6d2}
.name{font-size:24px;font-weight:700;color:#1f2a24;margin-left:10px}
.fx{height:46px;border-bottom:1px solid #d5dbd8;display:flex;align-items:center;padding:0 20px;font-size:19px;color:#555;gap:16px}
.fx b{color:#0F6B39;font-style:italic}
table{border-collapse:collapse;table-layout:fixed;font-size:19px}
td,th{border:1px solid #dde3e0;height:38px;padding:0 10px;white-space:nowrap;overflow:visible;color:#1b1b1b}
th{background:#f1f4f2;color:#5b6660;font-weight:400;text-align:center}
td.n{background:#f1f4f2;color:#5b6660;text-align:center;width:52px}
td.r{text-align:right;font-variant-numeric:tabular-nums}
td.h{font-weight:700;background:#eaf5ee}
td.sel{outline:3px solid #0F6B39;outline-offset:-2px}
"""

def page(name, cols, body):
    ths = "<th style='width:52px'></th>" + "".join(f"<th style='width:{w}px'>{c}</th>" for c, w in cols)
    return (f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head><body>"
            f"<div class=win><div class=bar><span class=dot></span><span class=dot></span><span class=dot></span>"
            f"<span class=name>{name}</span></div><div class=fx><b>fx</b></div>"
            f"<table><tr>{ths}</tr>{body}</table></div></body></html>")

def paste(empty=False):
    cols = [("A", 1500), ("B", 110), ("C", 110), ("D", 110)]
    lines = [" ".join(HEAD)] + [" ".join(x for x in r if x) for r in R]
    body = ""
    for i in range(N):
        t = "" if empty else html.escape(lines[i]) if i < len(lines) else ""
        cls = " class=sel" if i == 0 else ""
        body += f"<tr><td class=n>{i+1}</td><td{cls}>{t}</td><td></td><td></td><td></td></tr>"
    return page("Untitled spreadsheet", cols, body)

def csv():
    cols = [("A", 130), ("B", 700), ("C", 200), ("D", 200), ("E", 220), ("F", 80)]
    data = [HEAD] + R
    body = ""
    for i in range(N):
        r = data[i] if i < len(data) else ("",) * 5
        cells = ""
        for j, v in enumerate(r):
            c = "h" if i == 0 else ("r" if j >= 2 else "")
            cells += f"<td class='{c}'>{html.escape(v)}</td>"
        body += f"<tr><td class=n>{i+1}</td>{cells}<td></td></tr>"
    return page("bank-statement-sample.csv", cols, body)

open("paste-empty.html", "w").write(paste(True))
open("paste.html", "w").write(paste())
open("csv.html", "w").write(csv())
print("ok")
