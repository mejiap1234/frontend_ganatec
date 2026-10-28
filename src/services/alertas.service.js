import api from "./api";


const BASE =
  "/alertas";


/* =========================================================
   18.1.1 OBTENER ALERTAS

   Permite consultar las alertas de la finca
   utilizando filtros opcionales:

   - estado
   - tipo
   - prioridad
========================================================= */

export const obtenerAlertas =
  async (filtros = {}) => {

    const respuesta =
      await api.get(
        BASE,
        {
          params: filtros,
        }
      );

    return respuesta.data;

  };