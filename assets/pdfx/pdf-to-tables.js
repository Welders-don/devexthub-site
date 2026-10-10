// Convert pdfjs text items into a grid (rows × cols) using coordinate clustering.

function clusterIntoRows(items, yTolerance) {
  if (items.length === 0) return [];
  // Sort top-to-bottom (Y increases downward in our normalized coords)
  const sorted = items.slice().sort((a, b) => a.y - b.y);

  const rows = [];
  let current = [sorted[0]];
  let currentY = sorted[0].y;

  for (let i = 1; i < sorted.length; i++) {
    const it = sorted[i];
    if (Math.abs(it.y - currentY) <= yTolerance) {
      current.push(it);
      currentY = (currentY * (current.length - 1) + it.y) / current.length;
    } else {
      rows.push(current);
      current = [it];
      currentY = it.y;
    }
  }
  if (current.length > 0) rows.push(current);

  // Sort each row left-to-right
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
  }
  return rows;
}

function detectColumnAnchors(rows, xTolerance) {
  // Collect all left-edge X coordinates
  const xs = [];
  for (const row of rows) {
    for (const it of row) {
      xs.push(it.x);
    }
  }
  if (xs.length === 0) return [];
  xs.sort((a, b) => a - b);

  const anchors = [];
  let cluster = [xs[0]];
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] - cluster[cluster.length - 1] <= xTolerance) {
      cluster.push(xs[i]);
    } else {
      anchors.push(cluster.reduce((a, b) => a + b, 0) / cluster.length);
      cluster = [xs[i]];
    }
  }
  if (cluster.length > 0) {
    anchors.push(cluster.reduce((a, b) => a + b, 0) / cluster.length);
  }
  return anchors;
}

// Суммы в выписках выровнены по ПРАВОМУ краю: у 7.85 и 1,450.00 левые края
// разные, и кластеризация по левому краю плодила ложные колонки, которые потом
// сливались (дебет и кредит в одну ячейку). Числовые колонки ищем по правому краю.
const NUMERIC_RE = /^[-+(]?[$€£¥₽]?\s?\d[\d,.\s]*\)?%?$/;

function isNumericItem(it) {
  return it.width > 0 && NUMERIC_RE.test(it.text.trim());
}

// Кластеры правых краёв числовых элементов, где не меньше minSupport значений
// и левые края разъезжаются. Числа одной ширины (2.5 / 5.0 / 8.0) и
// левовыровненные числа остаются на обычных левых якорях: лишняя колонка
// упёрлась бы в capColumnCount и склеила соседей.
function detectRightColumns(rows, xTolerance, minSupport = 3) {
  // pdf.js рвёт число на куски («3» + «0,000»): у куска правый край не конец
  // значения, следующий фрагмент стоит вплотную. Такие куски не считаем.
  const pieces = new Set();
  for (const row of rows) {
    for (let i = 0; i + 1 < row.length; i++) {
      if (row[i + 1].x - (row[i].x + row[i].width) < 1) pieces.add(row[i]);
    }
  }
  const nums = rows.flat().filter((it) => isNumericItem(it) && !pieces.has(it))
    .sort((a, b) => (a.x + a.width) - (b.x + b.width));
  const cols = [];
  let cluster = [];
  const flush = () => {
    if (cluster.length < minSupport) return;
    const lefts = cluster.map((it) => it.x);
    if (Math.max(...lefts) - Math.min(...lefts) <= xTolerance) return;
    cols.push({
      right: cluster.reduce((s, it) => s + it.x + it.width, 0) / cluster.length,
      left: Math.min(...cluster.map((it) => it.x)),
      top: Math.min(...cluster.map((it) => it.y)),
      bottom: Math.max(...cluster.map((it) => it.y)),
      members: new Set(cluster),
    });
  };
  for (const it of nums) {
    const last = cluster[cluster.length - 1];
    if (last && (it.x + it.width) - (last.x + last.width) > xTolerance) {
      flush();
      cluster = [];
    }
    cluster.push(it);
  }
  flush();
  return cols;
}

// Индекс правой колонки элемента: член кластера либо текст (заголовок DEBIT
// над суммами), который лежит в пролёте колонки и прижат к её правому краю.
function rightColumnOf(it, rightCols, xTolerance) {
  const i = rightCols.findIndex((c) => c.members.has(it));
  if (i >= 0) return i;
  const right = it.x + (it.width || 0);
  const center = it.x + (it.width || 0) / 2;
  return rightCols.findIndex((c) => center >= c.left - xTolerance
    && center <= c.right + xTolerance
    && Math.abs(right - c.right) <= xTolerance * 2
    // только своя таблица: высота колонки чисел плюс ~9 строк над ней (заголовок
    // может стоять над пустыми строками вроде OPENING BALANCE)
    && it.y >= c.top - xTolerance * 15 && it.y <= c.bottom + xTolerance);
}

// Числа правой колонки сдвигаем к её общему левому краю: дальше обычная
// кластеризация по левому краю видит их одной колонкой. Новых колонок не
// добавляем, иначе capColumnCount склеивает соседей сильнее.
function alignRightColumns(rows, xTolerance) {
  const rightCols = detectRightColumns(rows, xTolerance);
  if (rightCols.length === 0) return rows;
  return rows.map((row) => {
    const out = row.slice();
    for (let i = 0; i < row.length; i++) {
      const rc = rightColumnOf(row[i], rightCols, xTolerance);
      if (rc < 0) continue;
      const dx = rightCols[rc].left - row[i].x;
      // куски того же числа слева («3» перед «0,000») едут вместе с ним
      for (let j = i; j >= 0 && (j === i || row[j + 1].x - (row[j].x + row[j].width) < 1); j--) {
        out[j] = { ...row[j], x: row[j].x + dx };
      }
    }
    return out;
  });
}

function assignToColumns(rows, anchors) {
  const grid = [];
  for (const row of rows) {
    const cells = new Array(anchors.length).fill('');
    for (const it of row) {
      // Find nearest column anchor
      let best = 0;
      let bestDist = Math.abs(it.x - anchors[0]);
      for (let i = 1; i < anchors.length; i++) {
        const d = Math.abs(it.x - anchors[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      cells[best] = cells[best]
        ? cells[best] + ' ' + it.text.trim()
        : it.text.trim();
    }
    grid.push(cells);
  }
  return grid;
}

function trimEmptyRows(grid) {
  return grid.filter((row) => row.some((c) => c && c.trim().length > 0));
}

// Remove columns that are fully empty across all rows
function trimEmptyColumns(grid) {
  if (grid.length === 0) return grid;
  const nCols = Math.max(...grid.map((r) => r.length));
  const keep = new Array(nCols).fill(false);
  for (const row of grid) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] && row[i].trim().length > 0) keep[i] = true;
    }
  }
  return grid.map((row) => row.filter((_, i) => keep[i]));
}

// Hard cap on column count — merge least-filled columns into neighbors.
// Useful for chaotic PDFs where coordinate clustering finds 12+ "columns"
// that are really just scattered text.
function capColumnCount(grid, maxCols = 6) {
  if (grid.length === 0) return grid;
  let result = grid.map((r) => r.slice());
  let nCols = Math.max(...result.map((r) => r.length));

  while (nCols > maxCols) {
    const fill = new Array(nCols).fill(0);
    for (const row of result) {
      for (let i = 0; i < row.length; i++) {
        if (row[i] && row[i].trim().length > 0) fill[i]++;
      }
    }
    let minIdx = 0;
    for (let i = 1; i < nCols; i++) {
      if (fill[i] < fill[minIdx]) minIdx = i;
    }
    // Merge into left neighbor (or right if first)
    const target = minIdx > 0 ? minIdx - 1 : 1;
    result = result.map((row) => {
      const out = row.slice();
      while (out.length < nCols) out.push('');
      const val = (out[minIdx] || '').trim();
      if (val) {
        const tgt = (out[target] || '').trim();
        out[target] = tgt ? `${tgt} ${val}` : val;
      }
      out.splice(minIdx, 1);
      return out;
    });
    nCols--;
  }
  return result;
}

function medianItemHeight(items) {
  if (items.length === 0) return 10;
  const heights = items.map((it) => it.height || 0).filter((h) => h > 0).sort((a, b) => a - b);
  if (heights.length === 0) return 10;
  return heights[Math.floor(heights.length / 2)];
}

// Merge sparse columns (less than threshold ratio of non-empty rows)
// into nearest neighbor column
function mergeSparseColumns(grid, minFillRatio = 0.15) {
  if (grid.length < 4) return grid; // too few rows — skip
  const nCols = Math.max(...grid.map((r) => r.length));
  if (nCols < 3) return grid;

  const fillCount = new Array(nCols).fill(0);
  for (const row of grid) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] && row[i].trim().length > 0) fillCount[i]++;
    }
  }
  const minRows = Math.max(2, Math.ceil(grid.length * minFillRatio));
  const sparseIdx = new Set();
  for (let i = 0; i < nCols; i++) {
    if (fillCount[i] < minRows) sparseIdx.add(i);
  }
  if (sparseIdx.size === 0) return grid;

  return grid.map((row) => {
    const out = [];
    for (let i = 0; i < row.length; i++) {
      const v = (row[i] || '').trim();
      if (!sparseIdx.has(i)) {
        out.push(v);
      } else if (v) {
        // Merge into last non-sparse cell, or push as new if no previous
        if (out.length > 0) {
          out[out.length - 1] = out[out.length - 1]
            ? out[out.length - 1] + ' ' + v
            : v;
        } else {
          out.push(v);
        }
      }
    }
    return out;
  });
}

// Detect section headers (rows with single non-empty cell) and ensure they
// are placed in the first column with the rest of the row empty — so they
// span visually when merged later
function normalizeHeaderRows(grid) {
  return grid.map((row) => {
    const filled = row.filter((c) => c && c.trim().length > 0);
    if (filled.length === 1 && row.length > 1) {
      // Move single value to column 0
      const out = new Array(row.length).fill('');
      out[0] = filled[0].trim();
      return out;
    }
    return row;
  });
}

// "(First name)" / "(Last name)" / "(Adults)" — meta annotations, not data
function isAnnotation(text) {
  const t = text.trim();
  if (t.length === 0 || t.length > 40) return false;
  return /^\([^()]+\)$/.test(t);
}

// Strip known metadata annotations from cell text (works even if pdfjs split
// "(First name)" into separate items that got rejoined during clustering).
const ANNOTATION_PATTERNS = [
  /\(\s*First\s+name\s*\)/gi,
  /\(\s*Last\s+name\s*\)/gi,
  /\(\s*Middle\s+name\s*\)/gi,
  /\(\s*Family\s+name\s*\)/gi,
  /\(\s*Given\s+name\s*\)/gi,
  /\(\s*Adults?\s*\)/gi,
  /\(\s*Children?\s*\)/gi,
  /\(\s*Infants?\s*\)/gi,
  /\(\s*stamp\s*\)/gi,
];

// Orphan fragments left after pdfjs splits "(First name)" across visual lines
const ORPHAN_OPENING_SUFFIX = /\s*\(\s*(?:First|Last|Middle|Family|Given|Adults?|Children?|Infants?)\s*\)?\s*$/i;
const ORPHAN_CLOSING_PREFIX = /^\s*(?:First|Last|Middle|Family|Given)?\s*name\)\s*/i;
const ORPHAN_STANDALONE = /^\s*(?:name\)|\(\s*(?:First|Last|Middle|Family|Given|Adults?|Children?|Infants?)\s*\)?)\s*$/i;

function cleanAnnotations(text) {
  let out = text;
  for (const pat of ANNOTATION_PATTERNS) {
    out = out.replace(pat, '');
  }
  // Strip orphan opening "(First" at end of cell: "TOROPOVA (Last" → "TOROPOVA"
  out = out.replace(ORPHAN_OPENING_SUFFIX, '');
  // Strip orphan closing "name)" at start of cell: "name) TOROPOV" → "TOROPOV"
  out = out.replace(ORPHAN_CLOSING_PREFIX, '');
  // Standalone orphan cell: "(First" or "name)" alone
  if (ORPHAN_STANDALONE.test(out)) out = '';
  return out.replace(/\s+/g, ' ').trim();
}

function cleanGridCells(grid) {
  return grid.map((row) => row.map((c) => (c ? cleanAnnotations(c) : c)));
}

// Merge orphan single-cell rows into the previous row.
// Common case: PDF has "DENIS\n(First name)\nTOROPOV\n(Last name)" laid out
// across 4 visual lines. After annotation cleanup, we get:
//   row N: B="DENIS" | C="Economy K" | D="..." | E="..."
//   row N+1: A="TOROPOV"   <-- orphan, belongs with DENIS
// Heuristic: if row has exactly one non-empty cell in col 0, AND previous
// row has data beyond col 0 (i.e. it's a table row, not a section header),
// fold orphan text into previous row's first non-empty cell.
function mergeOrphanRows(grid) {
  if (grid.length < 2) return grid;
  const result = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    const filled = row.map((c, idx) => ({ c: (c || '').trim(), idx })).filter((x) => x.c);

    // orphan = exactly one cell, in col 0, short text
    const isOrphan = filled.length === 1 && filled[0].idx === 0 && filled[0].c.length <= 50;

    if (isOrphan && result.length > 0) {
      const prev = result[result.length - 1];
      const prevFilled = prev.map((c, idx) => ({ c: (c || '').trim(), idx })).filter((x) => x.c);
      // Previous must be a real table row (data beyond col 0)
      const prevHasDataBeyondA = prevFilled.some((x) => x.idx > 0);
      if (prevHasDataBeyondA) {
        // Append orphan text to the LAST filled cell in column 0..N closest to 0
        const targetIdx = prevFilled[0].idx;
        const newPrev = prev.slice();
        newPrev[targetIdx] = newPrev[targetIdx]
          ? `${newPrev[targetIdx]} ${filled[0].c}`
          : filled[0].c;
        result[result.length - 1] = newPrev;
        continue;
      }
    }
    result.push(row);
  }
  return result;
}

// Detect which rows look like section headers (single-cell rows after blank
// or at top). These get a darker visual style in the xlsx.
function detectHeaderRows(grid) {
  const sectionRows = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    const filled = row.filter((c) => c && String(c).trim().length > 0);
    if (filled.length !== 1) continue;
    // Heuristic: short text, no commas/colons/digits-only (likely header word)
    const text = String(filled[0]).trim();
    if (text.length > 60) continue;
    if (/^\d+$/.test(text)) continue; // page number etc
    sectionRows.push(i);
  }
  return sectionRows;
}

// Main: page -> grid
export function pageToGrid(page, opts = {}) {
  const items = (page.items || [])
    .filter((it) => it.text && it.text.trim().length > 0)
    .filter((it) => !isAnnotation(it.text));
  if (items.length === 0) {
    return { grid: [], anchors: [], rowCount: 0 };
  }

  const medH = medianItemHeight(items);
  // yTolerance: ~50% of median text height. Floor 2, cap 6.
  const yTolerance = opts.yTolerance ?? Math.max(2, Math.min(6, medH * 0.5));
  const xTolerance = opts.xTolerance ?? Math.max(3, Math.min(8, medH * 0.6));

  const rows = alignRightColumns(clusterIntoRows(items, yTolerance), xTolerance);
  const anchors = detectColumnAnchors(rows, xTolerance);
  const maxCols = opts.maxCols ?? 6;

  let grid = assignToColumns(rows, anchors);
  grid = cleanGridCells(grid);
  grid = mergeSparseColumns(grid, 0.15);
  grid = trimEmptyColumns(grid);
  grid = capColumnCount(grid, maxCols);
  grid = trimEmptyRows(grid);
  grid = mergeOrphanRows(grid);
  grid = normalizeHeaderRows(grid);
  grid = trimEmptyRows(grid);

  const sectionHeaderRows = detectHeaderRows(grid);
  return { grid, anchors, rowCount: rows.length, sectionHeaderRows };
}

// Build sheets array (one sheet per PDF page) for xlsx-writer.
// Coordinate clustering is the default; line-based extraction is kept in
// pdf-from-lines.js but disabled here until tuned for diverse PDFs.
export async function analysisToSheets(analysis, { useLines = false } = {}) {
  let pageToGridViaLines = null;
  if (useLines) {
    ({ pageToGridViaLines } = await import('./pdf-from-lines.js'));
  }

  const sheets = [];
  for (const page of analysis.pages) {
    let result = null;
    let method = 'clustering';
    if (useLines && page._pageRef && pageToGridViaLines) {
      try {
        result = await pageToGridViaLines(page._pageRef, page.items, page.width, page.height);
        if (result) method = 'lines';
      } catch (e) {
        console.warn('Line extraction failed, falling back:', e.message);
      }
    }
    let grid, sectionHeaderRows = [];
    if (result) {
      grid = result.grid;
    } else {
      const pageResult = pageToGrid(page);
      grid = pageResult.grid;
      sectionHeaderRows = pageResult.sectionHeaderRows || [];
    }
    if (method === 'lines') {
      grid = cleanGridCells(grid);
      grid = trimEmptyColumns(grid);
      grid = trimEmptyRows(grid);
    }
    sheets.push({ name: `Page ${page.pageNum}`, grid, method, sectionHeaderRows });
  }
  return sheets;
}
