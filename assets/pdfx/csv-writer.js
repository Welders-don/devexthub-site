// Input: array of sheets [{ name, grid: [[cell, cell], ...] }]
// Output: Blob (csv file). Multiple sheets are joined with a name header and blank-line separator.

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function buildCsvBlob(sheets) {
  const lines = [];
  const multi = sheets.length > 1;
  for (const sheet of sheets) {
    if (multi) {
      if (lines.length > 0) lines.push('');
      lines.push(csvEscape(sheet.name || 'Sheet'));
    }
    for (const row of sheet.grid) {
      lines.push(row.map(csvEscape).join(','));
    }
  }
  return new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
}
