// Input: array of sheets [{ name, grid: [[cell, cell], ...] }]
// Output: Blob (csv file). Multiple sheets are joined with a name header and blank-line separator.

function csvEscape(v, sep = ',') {
  const s = String(v ?? '');
  if (/["\n\r]/.test(s) || s.includes(sep)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// sep (30.10, страница /pdf-to-csv/): ',' по умолчанию, ';' для Excel с запятой в дробях, '\t'.
export function buildCsvBlob(sheets, sep = ',') {
  const lines = [];
  const multi = sheets.length > 1;
  for (const sheet of sheets) {
    if (multi) {
      if (lines.length > 0) lines.push('');
      lines.push(csvEscape(sheet.name || 'Sheet', sep));
    }
    for (const row of sheet.grid) {
      lines.push(row.map((v) => csvEscape(v, sep)).join(sep));
    }
  }
  return new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
}
