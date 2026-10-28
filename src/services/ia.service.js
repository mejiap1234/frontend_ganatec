/* =========================================================
   IA GANATEC
========================================================= */

import api from "./api";


export const preguntarCopiloto = async (
  pregunta,
  historial = []
) => {

  const respuesta =
    await api.post(
      "/ia/preguntar",
      {
        pregunta,
        historial,
      }
    );


  return respuesta.data;

};