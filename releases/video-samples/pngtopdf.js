// Minimal PNG(RGB,8bit) -> image-only PDF. Pure node, no deps.
const fs = require('fs'), zlib = require('zlib');
const [,, inPng, outPdf] = process.argv;
const buf = fs.readFileSync(inPng);
if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');

let p = 8, width=0, height=0, bitDepth=0, colorType=0;
const idat = [];
while (p < buf.length) {
  const len = buf.readUInt32BE(p);
  const type = buf.toString('ascii', p+4, p+8);
  const data = buf.slice(p+8, p+8+len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0); height = data.readUInt32BE(4);
    bitDepth = data[8]; colorType = data[9];
  } else if (type === 'IDAT') idat.push(data);
  else if (type === 'IEND') break;
  p += 12 + len;
}
if (bitDepth !== 8 || colorType !== 2) throw new Error('need 8-bit RGB png, got depth='+bitDepth+' color='+colorType);

const raw = zlib.inflateSync(Buffer.concat(idat));
const bpp = 3, stride = width*bpp;
const out = Buffer.alloc(height*stride);
const paeth = (a,b,c)=>{const pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
let sp = 0;
for (let y=0; y<height; y++) {
  const ft = raw[sp++];
  const row = out.subarray(y*stride, y*stride+stride);
  const prev = y>0 ? out.subarray((y-1)*stride, (y-1)*stride+stride) : null;
  for (let x=0; x<stride; x++) {
    const cur = raw[sp++];
    const a = x>=bpp ? row[x-bpp] : 0;
    const b = prev ? prev[x] : 0;
    const c = (prev && x>=bpp) ? prev[x-bpp] : 0;
    let v;
    switch(ft){
      case 0: v=cur; break;
      case 1: v=cur+a; break;
      case 2: v=cur+b; break;
      case 3: v=cur+((a+b)>>1); break;
      case 4: v=cur+paeth(a,b,c); break;
      default: throw new Error('bad filter '+ft);
    }
    row[x]=v & 0xff;
  }
}

const img = zlib.deflateSync(out);
// page fit: A4 width 595.28pt
const pw = 595.28, ph = pw * height / width;
const objs = [];
const P = s => objs.push(Buffer.from(s,'latin1'));
const Pb = b => objs.push(b);
// 1 catalog, 2 pages, 3 page, 4 content, 5 image
P(`1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n`);
P(`2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n`);
P(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}]/Resources<</XObject<</Im0 5 0 R>>>>/Contents 4 0 R>>endobj\n`);
const content = `q ${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm /Im0 Do Q`;
P(`4 0 obj<</Length ${content.length}>>stream\n${content}\nendstream endobj\n`);
const imgHead = Buffer.from(`5 0 obj<</Type/XObject/Subtype/Image/Width ${width}/Height ${height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/FlateDecode/Length ${img.length}>>stream\n`,'latin1');
Pb(Buffer.concat([imgHead, img, Buffer.from('\nendstream endobj\n','latin1')]));

// assemble with xref
let pdf = Buffer.from('%PDF-1.4\n%\xff\xff\xff\xff\n','latin1');
const offsets = [];
for (const o of objs){ offsets.push(pdf.length); pdf = Buffer.concat([pdf,o]); }
const xrefPos = pdf.length;
let xref = `xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
for (const off of offsets) xref += String(off).padStart(10,'0')+' 00000 n \n';
xref += `trailer<</Size ${objs.length+1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
pdf = Buffer.concat([pdf, Buffer.from(xref,'latin1')]);
fs.writeFileSync(outPdf, pdf);
console.log(`wrote ${outPdf} ${width}x${height} -> ${pdf.length} bytes`);
