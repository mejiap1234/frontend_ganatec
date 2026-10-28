import api from "./api";


/* Obtener historial de salud de un animal */
export const obtenerEventosSalud = async (animalId) => {

  const respuesta = await api.get(
    `/animales/${animalId}/salud`
  );

  return respuesta.data;
};


/* Registrar un nuevo evento de salud */
export const registrarEventoSalud = async (
  animalId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/salud`,
    datos
  );

  return respuesta.data;
};


/* Cerrar un evento de salud abierto */
export const cerrarEventoSalud = async (
  animalId,
  eventoId,
  motivoCierre
) => {

  const respuesta = await api.patch(
    `/animales/${animalId}/salud/${eventoId}/estado`,
    {
      estado: "cerrado",
      motivo_cierre: motivoCierre
    }
  );

  return respuesta.data;
};


/* =========================================
   TRATAMIENTOS
========================================= */


/* Obtener tratamientos de un evento de salud */
export const obtenerTratamientosEvento = async (
  animalId,
  eventoId
) => {

  const respuesta = await api.get(
    `/animales/${animalId}/salud/${eventoId}/tratamientos`
  );

  return respuesta.data;
};


/* Registrar tratamiento en un evento de salud */
export const registrarTratamiento = async (
  animalId,
  eventoId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/salud/${eventoId}/tratamientos`,
    datos
  );

  return respuesta.data;
};


/* Cambiar estado de un tratamiento */
export const cambiarEstadoTratamiento = async (
  animalId,
  eventoId,
  tratamientoId,
  estado,
  motivo
) => {

  const respuesta = await api.patch(
    `/animales/${animalId}/salud/${eventoId}/tratamientos/${tratamientoId}/estado`,
    {
      estado,
      motivo
    }
  );

  return respuesta.data;
};


/* =========================================
   MEDICAMENTOS DEL TRATAMIENTO
========================================= */


/* Agregar medicamento a un tratamiento */
export const agregarMedicamentoTratamiento = async (
  animalId,
  eventoId,
  tratamientoId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/salud/${eventoId}/tratamientos/${tratamientoId}/medicamentos`,
    datos
  );

  return respuesta.data;
};