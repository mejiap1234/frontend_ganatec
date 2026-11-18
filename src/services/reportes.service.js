import api from "./api";

export async function obtenerReporte(tipo, filtros = {}) {
  const { data } = await api.get(`/reportes/${tipo}`, { params: filtros });
  return data;
}

export async function obtenerFincasReportes() {
  const { data } = await api.get("/reportes/fincas");
  return data.fincas;
}
