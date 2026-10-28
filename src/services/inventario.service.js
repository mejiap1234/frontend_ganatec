import api from "./api";


const BASE =
  "/inventario";


/* =========================================================
   INVENTARIO
========================================================= */

export const obtenerInventario =
  async () => {

    const respuesta =
      await api.get(
        BASE
      );

    return respuesta.data;

  };


/* =========================================================
   CREAR PRODUCTO
========================================================= */

export const crearProductoInventario =
  async (datos) => {

    const respuesta =
      await api.post(
        BASE,
        datos
      );

    return respuesta.data;

  };


/* =========================================================
   MOVIMIENTOS
========================================================= */

export const registrarMovimientoInventario =
  async (
    productoId,
    datos
  ) => {

    const respuesta =
      await api.post(
        `${BASE}/${productoId}/movimientos`,
        datos
      );

    return respuesta.data;

  };


export const obtenerMovimientosInventario =
  async (
    productoId
  ) => {

    const respuesta =
      await api.get(
        `${BASE}/${productoId}/movimientos`
      );

    return respuesta.data;

  };


/* =========================================================
   STOCK BAJO
========================================================= */

export const obtenerStockBajo =
  async () => {

    const respuesta =
      await api.get(
        `${BASE}/alertas/stock-bajo`
      );

    return respuesta.data;

  };


  /* =========================================================
   EDITAR PRODUCTO
========================================================= */

export const editarProductoInventario =
  async (
    productoId,
    datos
  ) => {

    const respuesta =
      await api.patch(
        `${BASE}/${productoId}`,
        datos
      );

    return respuesta.data;

  };


/* =========================================================
   ACTIVAR / DESACTIVAR PRODUCTO
========================================================= */

export const cambiarEstadoProductoInventario =
  async (
    productoId,
    activo
  ) => {

    const respuesta =
      await api.patch(
        `${BASE}/${productoId}/estado`,
        {
          activo,
        }
      );

    return respuesta.data;

  };