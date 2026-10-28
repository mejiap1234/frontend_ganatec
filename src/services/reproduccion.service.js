import api from "./api";


/* =========================================
   REPRODUCCIÓN
========================================= */


/* Obtener servicios reproductivos del animal */
export const obtenerServiciosReproductivos = async (
  animalId
) => {

  const respuesta = await api.get(
    `/animales/${animalId}/servicios-reproductivos`
  );

  return respuesta.data;
};


/* Obtener gestaciones del animal */
export const obtenerGestaciones = async (
  animalId
) => {

  const respuesta = await api.get(
    `/animales/${animalId}/gestaciones`
  );

  return respuesta.data;
};


/* =========================================================
   REGISTRAR SERVICIO REPRODUCTIVO

   Envía al backend una inseminación artificial
   o una monta natural realizada a una hembra.
========================================================= */
export const registrarServicioReproductivo = async (
  animalId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/servicios-reproductivos`,
    datos
  );

  return respuesta.data;
};

/* =========================================================
   REGISTRAR DIAGNÓSTICO DE GESTACIÓN

   Registra el resultado de un diagnóstico asociado
   a un servicio reproductivo específico.

   Si el resultado es "prenada", el backend se encarga
   automáticamente de crear la gestación.
========================================================= */
export const registrarDiagnosticoGestacion = async (
  animalId,
  servicioId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/servicios-reproductivos/${servicioId}/diagnosticos`,
    datos
  );

  return respuesta.data;
};


/* =========================================================
   REGISTRAR PARTO

   Registra el parto de una gestación activa.
   El backend se encarga de cerrar la gestación,
   registrar las crías e iniciar la lactancia.
========================================================= */
export const registrarParto = async (
  animalId,
  gestacionId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/gestaciones/${gestacionId}/partos`,
    datos
  );

  return respuesta.data;
};


/* =========================================================
   OBTENER HISTORIAL DE PARTOS
========================================================= */
export const obtenerPartos = async (animalId) => {

  const respuesta = await api.get(
    `/animales/${animalId}/partos`
  );

  return respuesta.data;
};