import api from "./api";

export async function obtenerReporte(tipo, filtros = {}) {
  const { data } = await api.get(`/reportes/${tipo}`, { params: filtros });
  return data;
}
