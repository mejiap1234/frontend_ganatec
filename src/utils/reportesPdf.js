// PDF A4 horizontal real, sin ventanas emergentes ni dependencias.
const W = 842, H = 595, M = 36, BOTTOM = 43;
const COLORS = {
  main: '0.13 0.32 0.20', muted: '0.36 0.44 0.38',
  light: '0.91 0.96 0.93', stripe: '0.96 0.98 0.96', border: '0.81 0.87 0.82',
};
const WINANSI = new Map([[8364,128],[8216,145],[8217,146],[8220,147],[8221,148],
  [8226,149],[8211,150],[8212,151],[8230,133],[8482,153]]);
function latin(text) {
  return Array.from(String(text == null ? '' : text)).map(c => {
    const n = c.codePointAt(0);
    if (n === 10 || n === 13 || n === 9) return ' ';
    if (n >= 32 && n <= 255 && !(n >= 127 && n <= 159)) return c;
    return WINANSI.has(n) ? String.fromCharCode(WINANSI.get(n)) : '?';
  }).join('');
}
function pdfString(s) {return latin(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
function wrap(v,w,size) {
  const max = Math.max(1,Math.floor((w-8)/(size*0.6)));
  const words = latin(v).replace(/\s+/g,' ').trim().split(' ');
  const out=[]; let line='';
  for (let word of words) {
    if (!word) continue;
    while (word.length > max) {
      if (line) {out.push(line);line='';}
      out.push(word.slice(0,max));word=word.slice(max);
    }
    if (!word) continue;
    if (!line) line=word;
    else if (line.length+1+word.length<=max) line+=' '+word;
    else {out.push(line);line=word;}
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}
const fmt = n => new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(Number(n)||0);
const cop = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(n)||0);
function show(v,key) {
  if (v === null || v === undefined || v === '') return 'Sin dato';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(String(v))) {
    const p=String(v).slice(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];
  }
  if (typeof v === 'number' || /^-?\d+(?:\.\d+)?$/.test(String(v))) return key==='monto'?cop(v):fmt(v);
  return String(v);
}
function widths(cols) {
  const hints={descripcion:210,titulo:145,nombre:120,animal:110,responsable:110,
    identificacion:90,tipo_evento:105,tipo_servicio:105,categoria:85,diagnostico:100};
  const weights=cols.map(c=>hints[c.key] || Math.max(60,Math.min(115,String(c.label).length*6+12)));
  const sum=weights.reduce((a,b)=>a+b,0)||1;
  return weights.map(w=>(W-2*M)*w/sum);
}
export function crearPdfReporte(tipo,filtros,data,filas,when=new Date()) {
  const titles={operativo:'Estado actual',leche:'Producción de leche',reproduccion:'Reproducción',salud:'Salud animal',finanzas:'Finanzas'};
  const title=titles[tipo]||'Reporte';
  const farm=data.finca?.nombre || 'Finca';
  const cols=data.columnas||[];
  const colW=widths(cols);
  const pages=[];let current=[];let y=0;let headers=false;
  const cmd=s=>current.push(s);
  const rect=(x,y0,w,h,c)=>cmd(c+' rg '+x.toFixed(2)+' '+y0.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re f');
  const line=(x1,y1,x2,y2,c)=>cmd(c+' RG 0.5 w '+x1+' '+y1+' m '+x2+' '+y2+' l S');
  const txt=(s,x,y0,sz=9,b=false,c=COLORS.main)=>cmd(c+' rg BT /'+(b?'F2':'F1')+' '+sz+' Tf 1 0 0 1 '+x.toFixed(2)+' '+y0.toFixed(2)+' Tm ('+pdfString(s)+') Tj ET');
  function page() {
    current=[];pages.push(current);
    rect(0,H-7,W,7,COLORS.main);
    txt('GANATEC  /  GESTIÓN GANADERA',M,H-34,10,true);
    txt(title,M,H-57,20,true);
    const range=tipo==='operativo'?'Estado actual':filtros.desde+' a '+filtros.hasta;
    wrap(farm+'  |  '+range,W-2*M,9).slice(0,2).forEach((s,i)=>txt(s,M,H-75-i*12,9,false,COLORS.muted));
    line(M,H-96,W-M,H-96,COLORS.border);
    y=H-110;headers=false;
    if (pages.length>1) {txt('Continuación del detalle',M,y,9,true,COLORS.muted);y-=16;}
  }
  function head() {
    if(headers || !cols.length)return;
    if(y<BOTTOM+55)page();
    rect(M,y-26,W-2*M,26,COLORS.light);
    let x=M;
    cols.forEach((c,i)=>{
      wrap(c.label,colW[i],7.2).slice(0,2).forEach((s,j)=>txt(s,x+4,y-10-9*j,7.2,true));
      x+=colW[i];
    });
    y-=26;headers=true;
  }
  page();
  const indicators=data.resumen||[];
  const cardW=(W-2*M-27)/4;
  indicators.forEach((v,i)=>{
    if(i>0 && i%4===0)y-=45;
    const x=M+(i%4)*(cardW+9);
    rect(x,y-41,cardW,39,COLORS.light);
    txt(wrap(v.nombre,cardW-10,7.5)[0],x+6,y-14,7.5,false,COLORS.muted);
    txt(v.moneda?cop(v.valor):fmt(v.valor),x+6,y-30,12,true);
  });
  if(indicators.length)y-=51;
  for(const note of data.avisos||[]) {
    for (const s of wrap('Nota: '+note,W-2*M-12,8)) {
      if (y<BOTTOM+30)page();
      txt(s,M+4,y-4,8,false,COLORS.muted);y-=12;
    }
  }
  y-=9;
  if(y<BOTTOM+48)page();
  txt('DETALLE DEL REPORTE  -  '+filas.length+' registros',M,y,10,true);y-=15;
  if (!cols.length || !filas.length) txt('No hay registros para mostrar.',M,Math.max(y-22,65),10);
  else {
    head();
    filas.forEach((row,index)=>{
      const cells=cols.map((c,i)=>wrap(show(row[c.key],c.key),colW[i],7));
      const lines=Math.max(1,...cells.map(c=>c.length));
      let offset=0;
      while(offset<lines) {
        head();
        const available=Math.floor((y-BOTTOM-8)/10);
        if(available<1){page();head();continue;}
        const use=Math.min(available,lines-offset),rowH=use*10+8;
        if(index%2)rect(M,y-rowH,W-2*M,rowH,COLORS.stripe);
        let x=M;
        cells.forEach((parts,i)=>{
          parts.slice(offset,offset+use).forEach((s,j)=>txt(s,x+4,y-11-j*10,7));x+=colW[i];
        });
        line(M,(y-rowH).toFixed(2),W-M,(y-rowH).toFixed(2),COLORS.border);
        y-=rowH;offset+=use;
        if(offset<lines)page();
      }
      if(y<BOTTOM+38 && index<filas.length-1)page();
    });
  }
  pages.forEach((p,i)=>{
    current=p;
    line(M,31,W-M,31,COLORS.border);
    txt('Generado: '+when.toLocaleString('es-CO',{timeZone:'America/Bogota'}),M,19,7.5,false,COLORS.muted);
    txt('Página '+(i+1)+' de '+pages.length,W-M-93,19,7.5,false,COLORS.muted);
  });
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const refs=[];
  pages.forEach(p=>{
    const stream=p.join('\n')+'\n';
    const streamId=objects.length+1;
    objects.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
    const pageId=objects.length+1;
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+streamId+' 0 R >>');
    refs.push(pageId+' 0 R');
  });
  objects[1]='<< /Type /Pages /Kids ['+refs.join(' ')+'] /Count '+pages.length+' >>';
  let bytes='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const pos=[0];
  objects.forEach((body,i)=>{pos.push(bytes.length);bytes+=(i+1)+' 0 obj\n'+body+'\nendobj\n';});
  const xref=bytes.length;
  bytes+='xref\n0 '+pos.length+'\n0000000000 65535 f \n';
  pos.slice(1).forEach(n=>{bytes+=String(n).padStart(10,'0')+' 00000 n \n';});
  bytes+='trailer\n<< /Size '+pos.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
  return Uint8Array.from(bytes,c=>c.charCodeAt(0)&255);
}
