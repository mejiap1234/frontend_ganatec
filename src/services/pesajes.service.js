import api from "./api";


export const obtenerPesajesAnimal = async (animalId) => {

  const respuesta = await api.get(
    `/animales/${animalId}/pesajes`
  );

  return respuesta.data;
};


export const registrarPesaje = async (
  animalId,
  datos
) => {

  const respuesta = await api.post(
    `/animales/${animalId}/pesajes`,
    datos
  );

  return respuesta.data;
};