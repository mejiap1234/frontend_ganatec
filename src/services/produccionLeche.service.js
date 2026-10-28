import api from "./api";


const BASE =
  "/produccion-leche";


/* =========================================================
   REGISTRAR PRODUCCIÓN TOTAL DIARIA
========================================================= */

export const registrarProduccionDiaria =
  async (datos) => {

    const respuesta =
      await api.post(
        `${BASE}/diaria`,
        datos
      );

    return respuesta.data;

  };

  /* =========================================================
   OBTENER RESUMEN GENERAL DE PRODUCCIÓN
========================================================= */

export const obtenerResumenProduccionFinca =
  async () => {

    const respuesta =
      await api.get(
        `${BASE}/resumen`
      );

    return respuesta.data;

  };

  /* =========================================================
   OBTENER HISTORIAL DE PRODUCCIÓN TOTAL DIARIA
========================================================= */

export const obtenerProduccionesDiarias =
  async () => {

    const respuesta =
      await api.get(
        `${BASE}/diaria`
      );

    return respuesta.data;

  };

  /* =========================================================
   EDITAR PRODUCCIÓN TOTAL DIARIA
========================================================= */

export const editarProduccionDiaria =
  async (
    produccionId,
    datos
  ) => {

    const respuesta =
      await api.patch(
        `${BASE}/diaria/${produccionId}`,
        datos
      );

    return respuesta.data;

  };