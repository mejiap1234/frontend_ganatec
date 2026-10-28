import api from "../api";


const BASE = "/potreros";

const BASE_LOTES = "/lotes";


/* =========================================================
   POTREROS
========================================================= */

export const obtenerPotreros = async () => {

  const respuesta =
    await api.get(BASE);

  return respuesta.data;

};


export const crearPotrero = async (datos) => {

  const respuesta =
    await api.post(
      BASE,
      datos
    );

  return respuesta.data;

};


export const obtenerDescansosPotrero = async (
  potreroId
) => {

  const respuesta =
    await api.get(
      `${BASE}/${potreroId}/descansos`
    );

  return respuesta.data;

};


export const finalizarDescansoPotrero = async (
  potreroId,
  datos
) => {

  const respuesta =
    await api.patch(
      `${BASE}/${potreroId}/descansos/finalizar`,
      datos
    );

  return respuesta.data;

};

export const obtenerLotesPotrero = async (
  potreroId
) => {

  const respuesta =
    await api.get(
      `${BASE}/${potreroId}/lotes`
    );

  return respuesta.data;

};


/* =========================================================
   LOTES / ROTACIÓN
========================================================= */

export const moverLotePotrero = async (
  loteId,
  datos
) => {

  const respuesta =
    await api.patch(
      `${BASE}/lotes/${loteId}/mover`,
      datos
    );

  return respuesta.data;

};


export const obtenerHistorialPotrerosLote = async (
  loteId
) => {

  const respuesta =
    await api.get(
      `${BASE}/lotes/${loteId}/historial`
    );

  return respuesta.data;

};


/* =========================================================
   LOTES
========================================================= */

export const obtenerLotes = async () => {

  const respuesta =
    await api.get(
      BASE_LOTES
    );

  return respuesta.data;

};


export const crearLote = async (datos) => {

  const respuesta =
    await api.post(
      BASE_LOTES,
      datos
    );

  return respuesta.data;

};


/* =========================================================
   ANIMALES DEL LOTE
========================================================= */

export const obtenerAnimalesLote = async (
  loteId
) => {

  const respuesta =
    await api.get(
      `${BASE_LOTES}/${loteId}/animales`
    );

  return respuesta.data;

};


export const obtenerAnimalesDisponibles = async () => {

  const respuesta =
    await api.get(
      `${BASE_LOTES}/animales/disponibles`
    );

  return respuesta.data;

};


export const agregarAnimalLote = async (
  loteId,
  animalId
) => {

  const respuesta =
    await api.post(
      `${BASE_LOTES}/${loteId}/animales/${animalId}`
    );

  return respuesta.data;

};


export const retirarAnimalLote = async (
  loteId,
  animalId,
  motivoSalida
) => {

  const respuesta =
    await api.patch(
      `${BASE_LOTES}/${loteId}/animales/${animalId}/retirar`,
      {
        motivo_salida:
          motivoSalida,
      }
    );

  return respuesta.data;

};


/* =========================================================
   CAMBIAR ANIMAL DE LOTE
========================================================= */

export const moverAnimalLote = async (
  animalId,
  loteDestinoId,
  motivo
) => {

  const respuesta =
    await api.patch(
      `${BASE_LOTES}/animales/${animalId}/mover`,
      {
        lote_destino_id:
          loteDestinoId,

        motivo,
      }
    );

  return respuesta.data;

};

