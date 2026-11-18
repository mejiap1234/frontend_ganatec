// Exportación completa con paginación para no sobrecargar Neon.
const LIMITE = 100;
const csvCelda = value => {
  let v = value == null ? "" : String(value);
  if (/^[\s]*[=+\-@]/.test(v)) v = "'" + v;
  return '"' + v.replaceAll('"','""') + '"';
};
const html = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[c]);

async function todasLasFilas(tipo, filtros, consultar, inicial) {
  const total = Number(inicial.paginacion?.totalItems || 0);
  const paginas = Math.ceil(total / LIMITE);
  const filas = [];
  for (let page=1; page<=paginas; page++) {
    const respuesta = await consultar(tipo,{...filtros,page,pageSize:LIMITE});
    if (Number(respuesta.paginacion?.totalItems) !== total)
      throw new Error("Los registros cambiaron durante la exportación. Actualiza e inténtalo nuevamente.");
    filas.push(...(respuesta.filas || []));
  }
  return filas;
}

function descargar(blob, nombre) {
  const enlace = document.createElement("a");
  const url = URL.createObjectURL(blob);
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function descargarCSVCompleto(tipo,filtros,consultar,inicial) {
  const filas = await todasLasFilas(tipo,filtros,consultar,inicial);
  const columnas = inicial.columnas || [];
  const csv = [columnas.map(c=>csvCelda(c.label)).join(";"),
    ...filas.map(f=>columnas.map(c=>csvCelda(f[c.key])).join(";"))].join("\r\n");
  descargar(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"}),
    `ganatec-${tipo}-${filtros.desde}-${filtros.hasta}.csv`);
}

export async function imprimirReporteCompleto(tipo,filtros,consultar,inicial,ventana) {
  if (!ventana || ventana.closed) throw new Error("La ventana de impresión está cerrada.");
  const filas = await todasLasFilas(tipo,filtros,consultar,inicial);
  if (ventana.closed) return;
  const titulo = {operativo:"Estado actual",leche:"Producción de leche",
    reproduccion:"Reproducción",salud:"Salud animal",finanzas:"Finanzas"}[tipo] || tipo;
  const nombre = inicial.finca?.nombre || "Finca";
  const moneda = x => new Intl.NumberFormat("es-CO",x.moneda
    ? {style:"currency",currency:"COP",maximumFractionDigits:0}
    : {maximumFractionDigits:2}).format(Number(x.valor||0));
  const kpis = (inicial.resumen||[]).map(x=>`<div class="kpi"><small>${html(x.nombre)}</small><b>${html(moneda(x))}</b></div>`).join("");
  const cabecera = (inicial.columnas||[]).map(c=>`<th>${html(c.label)}</th>`).join("");
  const cuerpo = filas.map(f=>`<tr>${(inicial.columnas||[]).map(c=>`<td>${html(f[c.key])}</td>`).join("")}</tr>`).join("");
  const observaciones = (inicial.avisos||[]).map(a=>`<p>${html(a)}</p>`).join("");
  const periodo = tipo==="operativo" ? "Estado actual; el período solo filtra los pesajes."
    : `Del ${html(filtros.desde)} al ${html(filtros.hasta)}`;
  ventana.document.open();
  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ganatec - ${html(titulo)}</title>
  <style>@page{size:A4 landscape;margin:14mm}body{font-family:Arial,sans-serif;color:#1c3525;font-size:10px}
  h1{font-size:21px;margin:4px 0}h2{font-size:13px}header{border-bottom:2px solid #245b38;padding-bottom:12px;margin-bottom:14px}
  .intro{color:#56665b}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}
  .kpi{border:1px solid #dbe8de;padding:9px}.kpi small{display:block;color:#596f61;margin-bottom:5px}.kpi b{font-size:14px}
  table{border-collapse:collapse;width:100%;font-size:9px}th,td{border:1px solid #dce5df;padding:6px;text-align:left;overflow-wrap:anywhere}
  th{background:#eaf4ed}tr{break-inside:avoid}thead{display:table-header-group}
  .avisos{color:#56665b}.acciones{padding:10px 0}@media print{.acciones{display:none}}</style></head>
  <body><div class="acciones"><button onclick="window.print()">Imprimir / Guardar como PDF</button></div>
  <header><strong>GANATEC · Informe de gestión ganadera</strong><h1>${html(titulo)}</h1>
  <div class="intro">${html(nombre)} · ${periodo} · Generado ${html(new Date().toLocaleString("es-CO",{timeZone:"America/Bogota"}))}</div></header>
  <div class="kpis">${kpis}</div><div class="avisos">${observaciones}</div>
  <h2>Registros (${filas.length})</h2><table><thead><tr>${cabecera}</tr></thead><tbody>${cuerpo}</tbody></table>
  </body></html>`);
  ventana.document.close();
  ventana.focus();
}
