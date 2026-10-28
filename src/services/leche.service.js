import api from "./api";

/* =========================================================
   LECHE: CONSULTAR PRODUCCIÓN POR FECHA
========================================================= */

export const obtenerProduccionLeche = async (
  animalId,
  fecha = ""
) => {

  const respuesta = await api.get(
    `/animales/${animalId}/leche`,
    {
      params: fecha
        ? { fecha }
        : {},
    }
  );

  return respuesta.data;

};


/* =========================================================
   LECHE: REGISTRAR ORDEÑO
========================================================= */

export const registrarOrdenio = async (
  animalId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/leche`,
    datos
  );

  return respuesta.data;

};


/* =========================================================
   LECHE: CORREGIR REGISTRO
========================================================= */

export const corregirRegistroLeche = async (
  animalId,
  registroId,
  datos
) => {

  const respuesta = await api.patch(
    `/animales/${animalId}/leche/${registroId}`,
    datos
  );

  return respuesta.data;

};


/* =========================================================
   LACTANCIAS: CONSULTAR HISTORIAL
========================================================= */

export const obtenerLactancias = async (animalId) => {

  const respuesta = await api.get(
    `/animales/${animalId}/lactancias`
  );

  return respuesta.data;

};


/* =========================================================
   LACTANCIAS: FINALIZAR
========================================================= */

export const finalizarLactancia = async (
  animalId,
  lactanciaId,
  datos
) => {

  const respuesta = await api.patch(
    `/animales/${animalId}/lactancias/${lactanciaId}/finalizar`,
    datos
  );

  return respuesta.data;

};


/* =========================================================
   LACTANCIAS: COMPARACIÓN
========================================================= */

export const compararLactancias = async (animalId) => {

  const respuesta = await api.get(
    `/animales/${animalId}/lactancias/comparacion`
  );

  return respuesta.data;

};


/* =========================================================
   LACTANCIAS: CONSULTAR ORDEÑOS HISTÓRICOS
========================================================= */

export const obtenerLecheLactancia = async (
  animalId,
  lactanciaId
) => {

  const respuesta = await api.get(
    `/animales/${animalId}/lactancias/${lactanciaId}/leche`
  );

  return respuesta.data;

};