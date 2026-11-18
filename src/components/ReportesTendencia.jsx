// Gráfico SVG mensual, sin dependencias adicionales.
export default function ReportesTendencia({tipo,datos}) {
  const meses=datos.slice(-12);
  if(!meses.length || !["leche","finanzas"].includes(tipo)) return null;
  const series=tipo==="leche"
    ? [{key:"litros",nombre:"Litros",color:"#2d8651"}]
    : [{key:"ingresos",nombre:"Ingresos",color:"#2d8651"},
       {key:"gastos",nombre:"Gastos",color:"#d98438"}];
  const max=Math.max(1,...meses.flatMap(m=>series.map(s=>Number(m[s.key])||0)));
  const W=800,H=240,left=52,right=24,top=22,bottom=42;
  const px=i=>left+(meses.length===1?(W-left-right)/2:i*(W-left-right)/(meses.length-1));
  const py=v=>H-bottom-Math.max(0,Number(v)||0)/max*(H-top-bottom);
  const formato=n=>new Intl.NumberFormat("es-CO",{notation:"compact",maximumFractionDigits:1}).format(n);
  return <section className="dashboard-panel reportes-tendencia" aria-label="Tendencia mensual">
    <div className="lista-header"><div><h3>Evolución mensual</h3><span>Últimos {meses.length} meses con registros</span></div></div>
    <div className="reportes-tendencia-leyenda">{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.nombre}</span>)}</div>
    <svg className="reportes-tendencia-svg" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={series.map(s=>`${s.nombre}: ${meses.map(m=>`${m.mes} ${formato(m[s.key])}`).join(", ")}`).join(". ")}>
      {[0,.25,.5,.75,1].map(t=><g key={t}>
        <line x1={left} x2={W-right} y1={py(max*t)} y2={py(max*t)} stroke="#dce7df" strokeDasharray="3 5"/>
        <text x={left-8} y={py(max*t)+4} textAnchor="end" fill="#617b69" fontSize="11">{formato(max*t)}</text>
      </g>)}
      {meses.map((m,i)=><text key={m.mes} x={px(i)} y={H-17} textAnchor="middle" fontSize="10" fill="#617b69">
        {m.mes.slice(5)}</text>)}
      {series.map(s=><g key={s.key}>
        <polyline fill="none" stroke={s.color} strokeWidth="3" strokeLinejoin="round"
          points={meses.map((m,i)=>`${px(i)},${py(m[s.key])}`).join(" ")}/>
        {meses.map((m,i)=><circle key={m.mes} cx={px(i)} cy={py(m[s.key])} r="4" fill={s.color}>
          <title>{m.mes}: {s.nombre} {formato(m[s.key])}</title>
        </circle>)}
      </g>)}
    </svg>
    <p className="reportes-tendencia-ayuda">Cada punto representa un mes con registros. Los meses sin datos pueden no aparecer.</p>
  </section>;
}
