
/* =========================================================
   GANATEC - MIGRAR PANELES A MODALES
   Ejecutar una sola vez.
========================================================= */

const fs = require("node:fs");

const ruta = "src/pages/AnimalDetalle.jsx";

let codigo = fs
  .readFileSync(ruta, "utf8")
  .replace(/\r\n/g, "\n");

const importacion =
  'import ModalGanatec from "../components/ModalGanatec";';

if (codigo.includes(importacion)) {
  console.error("Los modales ya están instalados.");
  process.exit(1);
}

// Cada entrada indica el estado, título y acción de cierre.
const paneles = [
  [
    "mostrarFormularioPesaje",
    "Registrar pesaje",
    "setMostrarFormularioPesaje(false);",
  ],
  [
    "eventoCerrar",
    "Cerrar evento de salud",
    'setEventoCerrar(null); setMotivoCierre(""); setErrorCierre("");',
  ],
  [
    "mostrarFormularioSalud",
    "Registrar evento de salud",
    "setMostrarFormularioSalud(false);",
  ],
  [
    "eventoTratamientos",
    "Tratamientos del evento",
    "setEventoTratamientos(null); setTratamientoMedicamentos(null); setTratamientoEstado(null); setMostrarFormularioTratamiento(false); setMostrarFormularioMedicamento(false);",
  ],
  [
    "mostrarFormularioServicio",
    "Registrar servicio reproductivo",
    "setMostrarFormularioServicio(false);",
  ],
  [
    "servicioDiagnostico",
    "Registrar diagnóstico",
    "setServicioDiagnostico(null);",
  ],
  [
    "gestacionParto",
    "Registrar parto",
    "setGestacionParto(null);",
  ],
  [
    "mostrarFinalizarLactancia",
    "Finalizar lactancia",
    "setMostrarFinalizarLactancia(false);",
  ],
  [
    "mostrarFormularioOrdenio",
    "Registrar ordeño",
    "setMostrarFormularioOrdenio(false);",
  ],
  [
    "registroCorreccion",
    "Corregir ordeño",
    "setRegistroCorreccion(null);",
  ],
  [
    "lactanciaHistorialSeleccionada",
    "Historial de lactancia",
    'setLactanciaHistorialSeleccionada(null); setProduccionLactanciaHistorial(null); setErrorHistorialLactancia("");',
  ],
];

// Envolver cada condición original sin alterar su contenido.
for (const [estado, titulo, accion] of paneles) {
  const inicioTexto = `{${estado} && (`;
  const posicion = codigo.indexOf(inicioTexto);

  if (
    posicion < 0 ||
    codigo.indexOf(inicioTexto, posicion + 1) !== -1
  ) {
    throw new Error(`No se encontró un único bloque: ${estado}`);
  }

  const principioLinea =
    codigo.lastIndexOf("\n", posicion) + 1;

  const sangria = codigo.slice(principioLinea, posicion);

  if (!/^\s*$/.test(sangria)) {
    throw new Error(`Indentación inesperada: ${estado}`);
  }

  // Localizar el cierre del bloque JSX con la misma sangría.
  const cierreBloque = new RegExp(
    `^${sangria}\\)\\}`,
    "gm"
  );

  cierreBloque.lastIndex = posicion + inicioTexto.length;

  const cierre = cierreBloque.exec(codigo);

  if (!cierre) {
    throw new Error(`Falta el cierre de ${estado}`);
  }

  const original = codigo.slice(
    posicion,
    cierre.index + cierre[0].length
  );

  const modal =
    `<ModalGanatec abierto={Boolean(${estado})} ` +
    `titulo="${titulo}" ` +
    `onClose={() => { ${accion} }}>\n` +
    `${sangria}  ${original}\n` +
    `${sangria}</ModalGanatec>`;

  codigo =
    codigo.slice(0, posicion) +
    modal +
    codigo.slice(cierre.index + cierre[0].length);
}

// Importar el componente reutilizable.
const ancla =
  'import DashboardLayout from "../layouts/DashboardLayout";';

if (!codigo.includes(ancla)) {
  throw new Error("No se encontró DashboardLayout.");
}

codigo = codigo.replace(
  ancla,
  `${ancla}\n${importacion}`
);

// Crear copia de seguridad antes de guardar.
fs.copyFileSync(ruta, `${ruta}.backup`);

fs.writeFileSync(ruta, codigo);

console.log(
  `Listo: ${paneles.length} paneles convertidos a modal.`
);

console.log(
  `Copia de seguridad: ${ruta}.backup`
);
