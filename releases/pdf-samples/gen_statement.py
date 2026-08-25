#!/usr/bin/env python3
# Генератор демо-выписки (US, английский) для съёмки роликов PDF-to-Excel.
# Без внешних зависимостей: пишем PDF руками, шрифты Base14 (Helvetica/Courier).
# Данные вымышленные. Реальные банки/люди не используются.

import sys

W, H = 612, 792  # Letter

TX = [
    ("07/01", "OPENING BALANCE", None),
    ("07/02", "PAYROLL DEPOSIT ACME LOGISTICS INC", 3184.55),
    ("07/02", "RENT PAYMENT MAPLE COURT PROPERTIES", -1450.00),
    ("07/03", "POS PURCHASE WALMART SUPERCENTER #2317", -86.42),
    ("07/03", "SHELL OIL 574128 SPRINGFIELD IL", -48.10),
    ("07/05", "NETFLIX.COM SUBSCRIPTION", -15.49),
    ("07/05", "ATM WITHDRAWAL MAIN ST BRANCH", -120.00),
    ("07/06", "STARBUCKS STORE 08842", -7.85),
    ("07/07", "AMAZON MKTPL US*RT4KL92H3", -132.77),
    ("07/08", "VERIZON WIRELESS AUTOPAY", -94.20),
    ("07/09", "TRADER JOES #451", -78.63),
    ("07/10", "ZELLE TRANSFER TO D. PARKER", -200.00),
    ("07/11", "CHEVRON 0093471", -52.34),
    ("07/12", "SPOTIFY USA", -11.99),
    ("07/13", "POS PURCHASE TARGET T-1188", -164.08),
    ("07/14", "ELECTRIC CO AUTOPAY", -137.62),
    ("07/15", "PAYROLL DEPOSIT ACME LOGISTICS INC", 3184.55),
    ("07/16", "HOME DEPOT #6612", -219.40),
    ("07/17", "UBER TRIP HELP.UBER.COM", -24.15),
    ("07/18", "CVS PHARMACY #4402", -36.90),
    ("07/19", "INTEREST PAYMENT", 1.83),
    ("07/20", "POS PURCHASE COSTCO WHSE #0331", -287.55),
    ("07/21", "DELTA AIR LINES 0062418", -412.00),
    ("07/22", "MONTHLY SERVICE FEE", -12.00),
    ("07/23", "ZELLE TRANSFER FROM M. RUIZ", 150.00),
    ("07/24", "CHIPOTLE ONLINE 2274", -21.36),
    ("07/25", "GEICO AUTO INSURANCE", -128.44),
    ("07/26", "POS PURCHASE KROGER #0917", -95.21),
    ("07/27", "APPLE.COM/BILL", -2.99),
    ("07/28", "ATM WITHDRAWAL 5TH AVE", -80.00),
    ("07/29", "PAYROLL DEPOSIT ACME LOGISTICS INC", 3184.55),
    ("07/29", "CITY WATER DEPT AUTOPAY", -64.18),
    ("07/30", "POS PURCHASE BEST BUY #1104", -349.99),
    ("07/31", "OVERDRAFT PROTECTION FEE", -10.00),
    ("07/31", "CLOSING BALANCE", None),
]

OPENING = 2417.68


def rows():
    """(date, description, debit, credit, balance) с посчитанным балансом."""
    out, bal = [], OPENING
    for d, desc, amt in TX:
        if amt is None:
            out.append((d, desc, "", "", f"{bal:,.2f}"))
            continue
        bal += amt
        deb = f"{-amt:,.2f}" if amt < 0 else ""
        cre = f"{amt:,.2f}" if amt > 0 else ""
        out.append((d, desc, deb, cre, f"{bal:,.2f}"))
    return out


def esc(s):
    return s.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def txt(x, y, s, font="F1", size=9):
    return f"BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({esc(s)}) Tj ET\n"


def rtxt(x_right, y, s, font="F2", size=9):
    """Правое выравнивание для Courier (ширина глифа = 0.6 em)."""
    return txt(x_right - len(s) * size * 0.6, y, s, font, size)


def line(x1, y1, x2, y2, w=0.5, g=0.6):
    return f"{g} G {w} w {x1} {y1} m {x2} {y2} l S\n"


COLS = {"date": 45, "desc": 100, "debit": 400, "credit": 470, "bal": 560}


def header(page_no, pages):
    c = ""
    c += txt(45, 735, "UNION COAST BANK", "F3", 17)
    c += txt(45, 719, "Statement of Account", "F1", 10)
    c += txt(400, 735, "Statement period", "F1", 9)
    c += txt(400, 723, "July 1 - July 31, 2026", "F3", 10)
    c += line(45, 710, 567, 710, 1, 0.3)

    c += txt(45, 692, "JOHN A. MILLER", "F3", 9)
    c += txt(45, 680, "1420 MAPLE STREET APT 3B", "F1", 9)
    c += txt(45, 668, "SPRINGFIELD, IL 62704", "F1", 9)
    c += txt(400, 692, "Account number", "F1", 8)
    c += txt(400, 680, "****  ****  4821", "F2", 10)
    c += txt(400, 664, "Account type: Everyday Checking", "F1", 8)

    y = 636
    c += f"0.90 0.90 0.90 rg 45 {y - 5} 522 16 re f 0 g\n"
    c += txt(COLS["date"] + 3, y, "DATE", "F3", 8)
    c += txt(COLS["desc"], y, "DESCRIPTION", "F3", 8)
    c += rtxt(COLS["debit"] + 40, y, "DEBIT", "F3", 8)
    c += rtxt(COLS["credit"] + 40, y, "CREDIT", "F3", 8)
    c += rtxt(COLS["bal"] + 7, y, "BALANCE", "F3", 8)
    c += txt(45, 40, f"Page {page_no} of {pages}", "F1", 8)
    c += txt(45, 28, "Member FDIC. Questions about this statement: 1-800-555-0142", "F1", 7)
    return c


def body(chunk):
    c, y = "", 618
    for d, desc, deb, cre, bal in chunk:
        bold = "F3" if desc in ("OPENING BALANCE", "CLOSING BALANCE") else "F1"
        c += txt(COLS["date"] + 3, y, d, "F2", 9)
        c += txt(COLS["desc"], y, desc[:46], bold, 9)
        if deb:
            c += rtxt(COLS["debit"] + 40, y, deb)
        if cre:
            c += rtxt(COLS["credit"] + 40, y, cre)
        c += rtxt(COLS["bal"] + 7, y, bal, "F3" if bold == "F3" else "F2")
        c += line(45, y - 5, 567, y - 5, 0.3, 0.85)
        y -= 17
    return c


def summary(y, data):
    deb = sum(float(r[2].replace(",", "")) for r in data if r[2])
    cre = sum(float(r[3].replace(",", "")) for r in data if r[3])
    c = line(400, y + 12, 567, y + 12, 1, 0.3)
    c += txt(400, y, "Total deposits", "F1", 9)
    c += rtxt(567, y, f"{cre:,.2f}")
    c += txt(400, y - 15, "Total withdrawals", "F1", 9)
    c += rtxt(567, y - 15, f"{deb:,.2f}")
    c += txt(400, y - 32, "Ending balance", "F3", 10)
    c += rtxt(567, y - 32, data[-1][4], "F3", 10)
    return c


def build(path):
    data = rows()
    per = 25
    pages = [data[i:i + per] for i in range(0, len(data), per)]
    streams = []
    for i, chunk in enumerate(pages):
        c = header(i + 1, len(pages)) + body(chunk)
        if i == len(pages) - 1:
            c += summary(618 - len(chunk) * 17 - 20, data)
        streams.append(c)

    objs = []          # 1-based, заполняем по порядку
    n_pages = len(streams)
    page_ids = [4 + i * 2 for i in range(n_pages)]

    objs.append("<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{p} 0 R" for p in page_ids)
    objs.append(f"<< /Type /Pages /Count {n_pages} /Kids [{kids}] >>")
    objs.append("<< /Font << /F1 %d 0 R /F2 %d 0 R /F3 %d 0 R >> >>"
                % (4 + n_pages * 2, 5 + n_pages * 2, 6 + n_pages * 2))
    for i, c in enumerate(streams):
        objs.append(f"<< /Type /Page /Parent 2 0 R /Resources 3 0 R "
                    f"/MediaBox [0 0 {W} {H}] /Contents {5 + i * 2} 0 R >>")
        objs.append(f"<< /Length {len(c)} >>\nstream\n{c}endstream")
    for base in ("Helvetica", "Courier", "Helvetica-Bold"):
        objs.append(f"<< /Type /Font /Subtype /Type1 /BaseFont /{base} "
                    f"/Encoding /WinAnsiEncoding >>")

    out = "%PDF-1.4\n"
    offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n{o}\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n"
    for off in offsets:
        out += f"{off:010d} 00000 n \n"
    out += (f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n")

    with open(path, "wb") as f:
        f.write(out.encode("latin-1"))
    print(f"ok: {path} ({len(out)} bytes, {n_pages} pages, {len(data)} rows)")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "bank-statement-sample.pdf")
