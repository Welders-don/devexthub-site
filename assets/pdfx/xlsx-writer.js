// Minimal xlsx writer for browser. Uses global JSZip.
// Input: array of sheets [{ name, grid: [[cell, cell], ...], merges?: ['A1:B1'] }]
// Output: Blob (xlsx file)

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colLetter(n) {
  let s = '';
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function sanitizeSheetName(name) {
  return String(name).slice(0, 31).replace(/[/\\?*\[\]:]/g, '_');
}

// До 1.1.1 все ячейки писались текстом: SUM по колонке сумм в Excel давал 0.
// Сумму из выписки пишем числом; даты, счета с ведущими нулями и длинные ID
// остаются текстом. Возвращает { n, decimals } или null.
const CURRENCY = /^[$€£¥₹₽]|[$€£¥₹₽]$/g;
function parseAmount(raw) {
  let s = String(raw).trim().replace(CURRENCY, '').trim();
  let neg = false;
  if (/^\(.+\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1); } else if (/-$/.test(s)) { neg = !neg; s = s.slice(0, -1); }
  let intPart, dec = '';
  let m;
  if ((m = s.match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/))) {
    intPart = m[1].replace(/,/g, ''); dec = m[2] || '';
  } else if ((m = s.match(/^(\d{1,3}(?:[.\s ]\d{3})+|\d+),(\d{2})$/))) {
    intPart = m[1].replace(/[.\s ]/g, ''); dec = m[2];
  } else {
    return null;
  }
  if (/^0\d/.test(intPart)) return null;                   // 00123: номер, не сумма
  if (intPart.length + dec.length > 15) return null;       // длиннее точности Excel
  if (!dec && s === intPart && intPart.length >= 8) return null; // голый длинный ID
  const n = Number(`${intPart}.${dec || 0}`);
  return { n: neg ? -n : n, decimals: dec.length };
}

// Колонку дат не трогаем: «12.03» там 12 марта, а не 12,03.
const DATE_HEADER = /date|datum|fecha|data|дата|日期|日付|tarih/i;
const FULL_DATE = /^\d{1,4}[./-]\d{1,2}[./-]\d{1,4}$/;
function dateColumns(grid) {
  const cols = new Set();
  for (const row of grid) {
    (row || []).forEach((v, c) => {
      const s = String(v ?? '').trim();
      if (DATE_HEADER.test(s) || FULL_DATE.test(s)) cols.add(c);
    });
  }
  return cols;
}

function buildSheetXml(grid, merges = [], sectionRows = new Set()) {
  const nRows = grid.length;
  const maxCols = Math.max(1, ...grid.map((r) => r.length));
  const skipNumeric = dateColumns(grid);

  const widths = new Array(maxCols).fill(12);
  for (const row of grid) {
    for (let i = 0; i < row.length; i++) {
      const len = String(row[i] ?? '').length;
      widths[i] = Math.max(widths[i], Math.min(len + 3, 60));
    }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  xml += `<dimension ref="A1:${colLetter(maxCols - 1)}${Math.max(nRows, 1)}"/>`;
  xml += '<sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>';
  xml += '<sheetFormatPr defaultRowHeight="15"/>';

  xml += '<cols>';
  for (let i = 0; i < maxCols; i++) {
    xml += `<col min="${i + 1}" max="${i + 1}" width="${widths[i]}" customWidth="1"/>`;
  }
  xml += '</cols>';

  xml += '<sheetData>';
  for (let r = 0; r < nRows; r++) {
    const row = grid[r];
    if (!row || row.length === 0) {
      xml += `<row r="${r + 1}"/>`;
      continue;
    }
    const isSection = sectionRows.has(r);
    // Style indices: 0 = default, 1 = section header (bold)
    const cellStyle = isSection ? '1' : '0';
    xml += `<row r="${r + 1}">`;
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (v === '' || v == null) continue;
      const ref = `${colLetter(c)}${r + 1}`;
      const num = isSection || skipNumeric.has(c) ? null : parseAmount(v);
      if (num) {
        // 2 = #,##0.00 (суммы с копейками), 0 = общий формат
        xml += `<c r="${ref}" s="${num.decimals === 2 ? 2 : 0}"><v>${num.n}</v></c>`;
        continue;
      }
      xml += `<c r="${ref}" t="inlineStr" s="${cellStyle}"><is><t xml:space="preserve">${escapeXml(v)}</t></is></c>`;
    }
    xml += '</row>';
  }
  xml += '</sheetData>';

  if (merges.length > 0) {
    xml += `<mergeCells count="${merges.length}">`;
    for (const m of merges) {
      xml += `<mergeCell ref="${m}"/>`;
    }
    xml += '</mergeCells>';
  }

  xml += '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>';
  xml += '</worksheet>';
  return xml;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="12"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF3B82F6"/></patternFill></fill>
  </fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="3">
    <xf fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
  </cellXfs>
</styleSheet>`;

export async function buildXlsxBlob(sheets) {
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip is not loaded');
  }
  const zip = new JSZip();

  // Content types
  let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  ct += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
  ct += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>';
  ct += '<Default Extension="xml" ContentType="application/xml"/>';
  ct += '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  for (let i = 0; i < sheets.length; i++) {
    ct += `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  }
  ct += '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
  ct += '</Types>';

  // Top-level rels
  let rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  rels += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  rels += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>';
  rels += '</Relationships>';

  // Workbook
  let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  wb += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ';
  wb += 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  wb += '<sheets>';
  const usedNames = new Set();
  for (let i = 0; i < sheets.length; i++) {
    let name = sanitizeSheetName(sheets[i].name || `Sheet${i + 1}`);
    // Excel запрещает дубли имён листов — добавляем суффикс, держим ≤31 символ
    if (usedNames.has(name.toLowerCase())) {
      let n = 2;
      let candidate;
      do {
        const suffix = ` (${n})`;
        candidate = name.slice(0, 31 - suffix.length) + suffix;
        n++;
      } while (usedNames.has(candidate.toLowerCase()));
      name = candidate;
    }
    usedNames.add(name.toLowerCase());
    wb += `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`;
  }
  wb += '</sheets></workbook>';

  // Workbook rels
  let wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  wbRels += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  for (let i = 0; i < sheets.length; i++) {
    wbRels += `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`;
  }
  const stylesRid = sheets.length + 1;
  wbRels += `<Relationship Id="rId${stylesRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  wbRels += '</Relationships>';

  zip.file('[Content_Types].xml', ct);
  zip.file('_rels/.rels', rels);
  zip.file('xl/workbook.xml', wb);
  zip.file('xl/_rels/workbook.xml.rels', wbRels);
  zip.file('xl/styles.xml', STYLES_XML);
  for (let i = 0; i < sheets.length; i++) {
    const sh = sheets[i];
    const sectionRows = new Set(sh.sectionHeaderRows || []);
    zip.file(`xl/worksheets/sheet${i + 1}.xml`, buildSheetXml(sh.grid || [], sh.merges || [], sectionRows));
  }

  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
