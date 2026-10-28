import api from "./api";


export const obtenerAnimales = async () => {

  const respuesta = await api.get("/animales");

  return respuesta.data;
};


export const registrarAnimal = async (datos) => {

  const respuesta = await api.post(
    "/animales",
    datos
  );

  return respuesta.data;
};


export const obtenerAnimalPorId = async (id) => {

  const respuesta = await api.get(
    `/animales/${id}`
  );

  return respuesta.data;
};


/* =========================================================
   ACTUALIZAR ANIMAL

   Envía al backend los campos que queremos modificar
   de un animal existente.
========================================================= */
export const actualizarAnimal = async (
  animalId,
  datos
) => {

  const respuesta = await api.patch(
    `/animales/${animalId}`,
    datos
  );

  return respuesta.data;
};