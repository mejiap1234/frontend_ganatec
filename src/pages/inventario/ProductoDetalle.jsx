import { useEffect, useState } from "react";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  History,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  obtenerInventario,
  obtenerMovimientosInventario,
  cambiarEstadoProductoInventario,
} from "../../services/inventario.service";

const ProductoDetalle = () => {
  const { productoId } = useParams();

  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [producto, setProducto] = useState(null);

  const [movimientos, setMovimientos] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const [mensaje, setMensaje] = useState("");

  /* =========================================================
     CARGAR PRODUCTO E HISTORIAL
  ========================================================= */

  const cargarDatos = async () => {
    try {
      setCargando(true);

      setError("");

      const [respuestaInventario, respuestaMovimientos] = await Promise.all([
        obtenerInventario(),

        obtenerMovimientosInventario(productoId),
      ]);

      /* -----------------------------------------------------
         BUSCAR PRODUCTO
      ----------------------------------------------------- */

      const productos = Array.isArray(respuestaInventario?.productos)
        ? respuestaInventario.productos
        : [];

      const productoEncontrado =
        productos.find((item) => String(item.id) === String(productoId)) ||
        null;

      setProducto(productoEncontrado);

      /* -----------------------------------------------------
         MOVIMIENTOS
      ----------------------------------------------------- */

      setMovimientos(
        Array.isArray(respuestaMovimientos?.movimientos)
          ? respuestaMovimientos.movimientos
          : [],
      );
    } catch (error) {
      console.error("Error cargando producto:", error);

      setError(
        error.response?.data?.message || "No fue posible cargar el producto.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [productoId]);

  /* =========================================================
     CARGA
  ========================================================= */

  if (cargando) {
    return <div className="dashboard-loading">Cargando producto...</div>;
  }

  if (error && !producto) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!producto) {
    return <div className="dashboard-error">Producto no encontrado.</div>;
  }

  /* =========================================================
   ACTIVAR / DESACTIVAR PRODUCTO
========================================================= */

  const manejarCambioEstado = async () => {
    const nuevoEstado = !producto.activo;

    const accion = nuevoEstado ? "reactivar" : "desactivar";

    const confirmar = window.confirm(
      nuevoEstado
        ? `¿Deseas reactivar ${producto.nombre}?`
        : `¿Deseas desactivar ${producto.nombre}? El historial se conservará.`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setCambiandoEstado(true);

      setError("");

      setMensaje("");

      const respuesta = await cambiarEstadoProductoInventario(
        productoId,
        nuevoEstado,
      );

      setProducto((anterior) => ({
        ...anterior,
        activo: respuesta?.producto?.activo ?? nuevoEstado,
      }));

      setMensaje(
        nuevoEstado
          ? "Producto reactivado correctamente."
          : "Producto desactivado correctamente.",
      );
    } catch (error) {
      console.error(`Error al ${accion} producto:`, error);

      setError(
        error.response?.data?.message ||
          `No fue posible ${accion} el producto.`,
      );
    } finally {
      setCambiandoEstado(false);
    }
  };

  /* =========================================================
     DATOS CALCULADOS
  ========================================================= */

  const stockActual = Number(producto.stock_actual || 0);

  const stockMinimo = Number(producto.stock_minimo || 0);

  let estadoStock = "Normal";

  if (stockActual <= 0) {
    estadoStock = "Agotado";
  } else if (producto.stock_bajo) {
    estadoStock = "Stock bajo";
  }

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="modulo-subheader">
        <div>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navigate("/inventario")}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <h2>{producto.nombre}</h2>

          <p>Control de existencias y movimientos del producto.</p>
        </div>

        <div className="formulario-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navigate(`/inventario/${productoId}/editar`)}
          >
            <Pencil size={16} />
            Editar
          </button>

          {producto.activo ? (
            <>
              <button
                type="button"
                className="boton-secundario"
                onClick={() =>
                  navigate(`/inventario/${productoId}/movimiento/salida`)
                }
              >
                <ArrowUpFromLine size={16} />
                Registrar salida
              </button>

              <button
                type="button"
                className="boton-principal"
                onClick={() =>
                  navigate(`/inventario/${productoId}/movimiento/entrada`)
                }
              >
                <ArrowDownToLine size={16} />
                Registrar entrada
              </button>

              <button
                type="button"
                className="boton-secundario"
                disabled={cambiandoEstado}
                onClick={manejarCambioEstado}
              >
                <PowerOff size={16} />

                {cambiandoEstado ? "Desactivando..." : "Desactivar"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="boton-principal"
              disabled={cambiandoEstado}
              onClick={manejarCambioEstado}
            >
              <Power size={16} />

              {cambiandoEstado ? "Reactivando..." : "Reactivar producto"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {mensaje && (

  <div className="mensaje-exito">

    {mensaje}

  </div>

)}

      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <div className="potreros-resumen">
        <div>
          <span>Stock actual</span>

          <strong>
            {stockActual} {producto.unidad}
          </strong>

          <small>Existencia disponible</small>
        </div>

        <div>
          <span>Stock mínimo</span>

          <strong>
            {stockMinimo} {producto.unidad}
          </strong>

          <small>Nivel de alerta</small>
        </div>

        <div>
          <span>Categoría</span>

          <strong className="texto-capitalizado">{producto.categoria}</strong>

          <small>Tipo de producto</small>
        </div>

        <div>
          <span>Estado</span>

          <strong>{estadoStock}</strong>

          <small>
            {producto.activo ? "Producto activo" : "Producto inactivo"}
          </small>
        </div>
      </div>

      {/* =====================================================
          INFORMACIÓN
      ===================================================== */}

      <div className="dashboard-panel">
        <div className="lista-header">
          <div>
            <h3>Información del producto</h3>
          </div>
        </div>

        <div className="potrero-descanso-actual">
          <div>
            <span>Nombre</span>

            <strong>{producto.nombre}</strong>
          </div>

          <div>
            <span>Unidad de medida</span>

            <strong>{producto.unidad}</strong>
          </div>

          <div>
            <span>Descripción</span>

            <strong>{producto.descripcion || "Sin descripción"}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          HISTORIAL
      ===================================================== */}

      <div className="dashboard-panel">
        <div className="lista-header">
          <div>
            <h3>Historial de movimientos</h3>

            <span>{movimientos.length} registros</span>
          </div>
        </div>

        {movimientos.length === 0 ? (
          <div className="estado-vacio">
            <History size={28} />

            <p>Este producto todavía no tiene movimientos registrados.</p>
          </div>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla-ganatec">
              <thead>
                <tr>
                  <th>Fecha</th>

                  <th>Tipo</th>

                  <th>Cantidad</th>

                  <th>Motivo</th>

                  <th>Responsable</th>

                  <th>Observación</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>
                      {movimiento.fecha_movimiento
                        ? new Date(movimiento.fecha_movimiento).toLocaleString(
                            "es-CO",
                          )
                        : "-"}
                    </td>

                    <td>
                      <strong className="texto-capitalizado">
                        {movimiento.tipo}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {movimiento.tipo === "entrada" ? "+" : "-"}
                        {Number(movimiento.cantidad)} {producto.unidad}
                      </strong>
                    </td>

                    <td className="texto-capitalizado">
                      {movimiento.motivo || "-"}
                    </td>

                    <td>{movimiento.registrado_por_nombre || "-"}</td>

                    <td>{movimiento.observacion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductoDetalle;
