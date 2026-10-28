import api from "./api";


const BASE =
  "/finanzas";


/* =========================================================
   REGISTRAR GASTO
========================================================= */

export const registrarGasto =
  async (datos) => {

    const respuesta =
      await api.post(
        `${BASE}/gastos`,
        datos
      );

    return respuesta.data;

  };


/* =========================================================
   LISTAR MOVIMIENTOS
========================================================= */

export const obtenerMovimientosFinancieros =
  async (filtros = {}) => {

    const respuesta =
      await api.get(
        `${BASE}/movimientos`,
        {
          params: filtros,
        }
      );

    return respuesta.data;

  };


/* =========================================================
   REGISTRAR VENTA DE LECHE
========================================================= */

export const registrarVentaLeche =
  async (datos) => {

    const respuesta =
      await api.post(
        `${BASE}/ventas-leche`,
        datos
      );

    return respuesta.data;

  };


/* =========================================================
   LISTAR VENTAS DE LECHE
========================================================= */

export const obtenerVentasLeche =
  async () => {

    const respuesta =
      await api.get(
        `${BASE}/ventas-leche`
      );

    return respuesta.data;

  };


/* =========================================================
   REGISTRAR VENTA DE ANIMAL
========================================================= */

export const registrarVentaAnimal =
  async (
    animalId,
    datos
  ) => {

    const respuesta =
      await api.post(
        `${BASE}/ventas-animales/${animalId}`,
        datos
      );

    return respuesta.data;

  };


/* =========================================================
   LISTAR VENTAS DE ANIMALES
========================================================= */

export const obtenerVentasAnimales =
  async () => {

    const respuesta =
      await api.get(
        `${BASE}/ventas-animales`
      );

    return respuesta.data;

  };


/* =========================================================
   RESUMEN FINANCIERO
========================================================= */

export const obtenerResumenFinanciero =
  async (filtros) => {

    const respuesta =
      await api.get(
        `${BASE}/resumen`,
        {
          params: filtros,
        }
      );

    return respuesta.data;

  };