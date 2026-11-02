import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileText, RefreshCw } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { obtenerReporte } from "../services/reportes.service";

const TIPOS = [
  { id:"operativo", nombre:"Estado general", descripcion:"Hato, inventario y potreros" },
  { id:"leche", nombre:"Producción de leche", descripcion:"Litros y ranking de vacas" },
  { id:"reproduccion", nombre:"Reproducción", descripcion:"Servicios, gestaciones, partos y crías" },
  { id:"salud", nombre:"Salud animal", descripcion:"Eventos, tratamientos y vacunaciones" },
  { id:"finanzas", nombre:"Finanzas", descripcion:"Ingresos, gastos y balance registrado" },
];
const fechaBogota = () => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone:"America/Bogota",year:"numeric",month:"2-digit",day:"2-digit",
  }).formatToParts(new Date());
  const fecha = Object.fromEntries(partes.map(({type,value})=>[type,value]));
  return fecha.year+"-"+fecha.month+"-"+fecha.day;
};
const formato = (valor,moneda=false) => {
  const numero=Number(valor ?? 0);
  return new Intl.NumberFormat("es-CO", moneda
    ? {style:"currency",currency:"COP",maximumFractionDigits:0}
    : {maximumFractionDigits:2}).format(numero);
};
const mostrar = (v) => {
  if(v===null||v===undefined||v==="")return "Sin dato";
  if(typeof v==="boolean")return v?"Sí":"No";
  if(typeof v==="number"||/^-?\d+(?:\.\d+)?$/.test(String(v)))return formato(v);
  const s=String(v);
  if(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(s)) {
    const date=s.slice(0,10);
    const [a,m,d]=date.split("-");
    return d+"/"+m+"/"+a;
  }
  return s;
};
const csvEscape = (valor) => {
  let text=valor===null||valor===undefined ? "" : String(valor);
  // Neutralizar fórmulas al abrir CSV en Excel o LibreOffice.
  if(/^[\s]*[=+\-@]/.test(text)) text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
};

export default function Reportes(){
  const {usuario}=useAuth();
  const esAdmin=usuario?.rol==="administrador";
  const [tipo,setTipo]=useState("operativo");
  const [vista,setVista]=useState("animales");
  const [desde,setDesde]=useState(fechaBogota().slice(0,4)+"-01-01");
  const [hasta,setHasta]=useState(fechaBogota());
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(25);
  const [actualizacion,setActualizacion]=useState(0);
  const [datos,setDatos]=useState(null);
  const [cargando,setCargando]=useState(true);
  const [error,setError]=useState("");
  const visibles=TIPOS.filter(x=>x.id!=="finanzas"||esAdmin);
  const titulo=TIPOS.find(x=>x.id===tipo)?.nombre||"Reportes";
  const filtros=useMemo(()=>({desde,hasta,page,pageSize,vista}),[desde,hasta,page,pageSize,vista]);
  useEffect(()=>{
    let activo=true;
    setCargando(true);
    setError("");
    obtenerReporte(tipo,filtros).then(r=>{
      if(activo)setDatos(r);
    }).catch(e=>{
      if(activo){setDatos(null);setError(e.response?.data?.message||"No fue posible consultar el reporte.");}
    }).finally(()=>{if(activo)setCargando(false);});
    return ()=>{activo=false;};
  },[tipo,filtros,actualizacion]);
  const cambiarTipo=(nuevo)=>{setTipo(nuevo);setPage(1);};
  const max=datos?.paginacion?.totalPages||0;
  const filas=datos?.filas||[];
  const columnas=datos?.columnas||[];
  const grafica=datos?.grafica||[];
  const máximo=Math.max(1,...grafica.map(x=>Number(x.valor)||0));
  const exportarPagina=()=>{
    // Exporta únicamente la página visible, sin fingir que es el histórico completo.
    if(!datos||!filas.length)return;
    const encabezados=columnas.map(c=>csvEscape(c.label));
    const renglones=filas.map(f=>columnas.map(c=>csvEscape(f[c.key])));
    const texto="\uFEFF"+[encabezados,...renglones].map(x=>x.join(";")).join("\r\n");
    const blob=new Blob([texto],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const enlace=document.createElement("a");
    enlace.href=url;
    enlace.download="ganatec-"+tipo+"-pagina-"+page+".csv";
    enlace.click();
    URL.revokeObjectURL(url);
  };
  return (
    <DashboardLayout>
      <div className="pagina-header">
        <div>
          <p className="dashboard-label">Información de la finca</p>
          <h1>Reportes</h1>
          <p>Consulta resultados reales por periodo, con indicadores y registros detallados.</p>
        </div>
        <BarChart3 size={32} aria-hidden="true"/>
      </div>
      <div className="reportes-tabs" role="group" aria-label="Tipo de reporte">
        {visibles.map(item=>(
          <button key={item.id} type="button"
            className={tipo===item.id?"reportes-tab seleccionado":"reportes-tab"}
            onClick={()=>cambiarTipo(item.id)} aria-pressed={tipo===item.id}>
            <strong>{item.nombre}</strong><span>{item.descripcion}</span>
          </button>
        ))}
      </div>
      <section className="dashboard-panel reportes-filtros" aria-label="Filtros">
        <div className="campo-formulario"><label htmlFor="reporte-desde">Desde</label>
          <input id="reporte-desde" type="date" value={desde}
            onChange={e=>{setDesde(e.target.value);setPage(1);}} /></div>
        <div className="campo-formulario"><label htmlFor="reporte-hasta">Hasta</label>
          <input id="reporte-hasta" type="date" value={hasta}
            onChange={e=>{setHasta(e.target.value);setPage(1);}} /></div>
        {tipo==="operativo"&&(
          <div className="campo-formulario"><label htmlFor="reporte-vista">Listado</label>
            <select id="reporte-vista" value={vista}
              onChange={e=>{setVista(e.target.value);setPage(1);}}>
              <option value="animales">Animales</option>
              <option value="inventario">Inventario</option>
              <option value="potreros">Potreros</option>
            </select>
          </div>
        )}
        <div className="campo-formulario"><label htmlFor="reporte-pagina">Filas por página</label>
          <select id="reporte-pagina" value={pageSize}
            onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}>
            {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button type="button" className="boton-secundario" onClick={()=>setActualizacion(n=>n+1)}>
          <RefreshCw size={16}/> Actualizar
        </button>
      </section>
      {error&&<div className="dashboard-error" role="alert">{error}</div>}
      {cargando ? (
        <div className="dashboard-loading" role="status">Calculando {titulo.toLowerCase()}…</div>
      ) : datos&&(
        <>
          <section className="reportes-indicadores" aria-label="Indicadores">
            {datos.resumen.map((x,i)=>(
              <article className="reportes-kpi" key={i}>
                <span>{x.nombre}</span>
                <strong>{formato(x.valor,x.moneda)}</strong>
              </article>
            ))}
          </section>
          {datos.avisos?.length>0&&(
            <section className="reportes-avisos" aria-label="Aclaraciones del reporte">
              {datos.avisos.map((nota,i)=><p key={i}>{nota}</p>)}
            </section>
          )}
          {grafica.length>0&&(
            <section className="dashboard-panel">
              <div className="lista-header">
                <div><h3>Distribución y tendencias</h3><span>Datos del periodo seleccionado</span></div>
              </div>
              <div className="reportes-grafica">
                {grafica.map((x,i)=>(
                  <div className="reportes-barra-fila" key={i}>
                    <span title={x.nombre}>{x.nombre}</span>
                    <div className="reportes-barra-pista">
                      <div style={{width:Math.max(0,Number(x.valor)/máximo*100)+"%"}}/>
                    </div>
                    <strong>{formato(x.valor)}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="dashboard-panel">
            <div className="lista-header reportes-lista-header">
              <div><h3>Detalle del reporte</h3>
                <span>{datos.paginacion.totalItems} registros · {titulo}</span></div>
              <button type="button" className="boton-secundario" onClick={exportarPagina} disabled={!filas.length}
                title="Exporta solamente las filas de esta página">
                <Download size={16}/> CSV de esta página
              </button>
            </div>
            {filas.length===0 ? (
              <div className="reportes-vacio"><FileText size={28}/><p>No hay registros para mostrar con estos filtros.</p></div>
            ) : (
              <div className="tabla-contenedor reportes-tabla-contenedor">
                <table className="tabla-ganatec reportes-tabla">
                  <thead><tr>{columnas.map(c=><th key={c.key} scope="col">{c.label}</th>)}</tr></thead>
                  <tbody>{filas.map((fila,index)=>(
                    <tr key={index}>{columnas.map(c=>(
                      <td key={c.key} data-label={c.label}>{mostrar(fila[c.key])}</td>
                    ))}</tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <div className="reportes-paginador">
              <span>Página {max===0?0:page} de {max}</span>
              <div>
                <button type="button" className="boton-secundario" disabled={page<=1}
                  onClick={()=>setPage(n=>Math.max(1,n-1))}>Anterior</button>
                <button type="button" className="boton-secundario" disabled={max===0||page>=max}
                  onClick={()=>setPage(n=>n+1)}>Siguiente</button>
              </div>
            </div>
            <p className="reportes-meta">
              Generado: {new Date(datos.generadoEn).toLocaleString("es-CO",{timeZone:"America/Bogota"})}
              {" · "}Zona horaria: {datos.zonaHoraria}
            </p>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
