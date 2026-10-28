import { useEffect, useState } from "react";

import { ArrowLeft, Save } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  obtenerInventario,
  editarProductoInventario,
  registrarMovimientoInventario,
} from "../../services/inventario.service";

const ProductoEditar = () => {
  const { productoId } = useParams();

  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "",
    unidad: "",
    cantidad_actual: "",
    stock_minimo: "",
    descripcion: "",
  });

  const [stockOriginal, setStockOriginal] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     CARGAR PRODUCTO
  ========================================================= */

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);

        setError("");

        const respuesta = await obtenerInventario();

        const productos = Array.isArray(respuesta?.productos)
          ? respuesta.productos
          : [];

        const producto = productos.find(
          (item) => String(item.id) === String(productoId),
        );

        if (!producto) {
          setError("Producto no encontrado.");

          return;
        }

        const stockActual = Number(producto.stock_actual || 0);

        setStockOriginal(stockActual);

        setFormulario({
          nombre: producto.nombre || "",

          categoria: producto.categoria || "",

          unidad: producto.unidad || "",

          cantidad_actual: stockActual,

          stock_minimo: producto.stock_minimo ?? "",

          descripcion: producto.descripcion || "",
        });
      } catch (error) {
        console.error("Error cargando producto:", error);

        setError(
          error.response?.data?.message || "No fue posible cargar el producto.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [productoId]);

  /* =========================================================
     CAMBIAR CAMPOS
  ========================================================= */

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* =========================================================
     GUARDAR CAMBIOS
  ========================================================= */

  const manejarGuardar = async (e) => {
    e.preventDefault();

    setError("");

    if (!formulario.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");

      return;
    }

    if (!formulario.categoria) {
      setError("Debes seleccionar una categoría.");

      return;
    }

    if (!formulario.unidad) {
      setError("Debes seleccionar una unidad.");

      return;
    }

    if (Number(formulario.stock_minimo || 0) < 0) {
      setError("El stock mínimo no puede ser negativo.");

      return;
    }

    if (
      formulario.cantidad_actual === "" ||
      Number(formulario.cantidad_actual) < 0
    ) {
      setError("La cantidad actual no puede ser negativa.");

      return;
    }

    try {
      setGuardando(true);

      await editarProductoInventario(productoId, {
        nombre: formulario.nombre.trim(),

        categoria: formulario.categoria,

        unidad: formulario.unidad,

        stock_minimo: Number(formulario.stock_minimo || 0),

        descripcion: formulario.descripcion.trim() || undefined,
      });

      /* =========================================================
   AJUSTAR CANTIDAD ACTUAL
========================================================= */

      const nuevaCantidad = Number(formulario.cantidad_actual || 0);

      const diferencia = nuevaCantidad - stockOriginal;

      if (diferencia > 0) {
        await registrarMovimientoInventario(productoId, {
          tipo: "entrada",
          cantidad: diferencia,
          motivo: "ajuste",
          observacion:
            "Corrección manual de existencia desde edición de producto",
        });
      }

      if (diferencia < 0) {
        await registrarMovimientoInventario(productoId, {
          tipo: "salida",
          cantidad: Math.abs(diferencia),
          motivo: "ajuste",
          observacion:
            "Corrección manual de existencia desde edición de producto",
        });
      }

      navigate(`/inventario/${productoId}`);
    } catch (error) {
      console.error("Error actualizando producto:", error);

      setError(
        error.response?.data?.message ||
          "No fue posible actualizar el producto.",
      );
    } finally {
      setGuardando(false);
    }
  };

  /* =========================================================
     CARGA
  ========================================================= */

  if (cargando) {
    return <div className="dashboard-loading">Cargando producto...</div>;
  }

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <>
      <div className="modulo-subheader">
        <div>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navigate(`/inventario/${productoId}`)}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <h2>Editar producto</h2>

          <p>Actualiza la información y los parámetros del inventario.</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <form className="formulario-reproduccion" onSubmit={manejarGuardar}>
          <div className="form-grid">
            {/* NOMBRE */}

            <div className="campo-formulario">
              <label>Nombre *</label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                required
              />
            </div>

            {/* CATEGORÍA */}

            <div className="campo-formulario">
              <label>Categoría *</label>

              <select
                name="categoria"
                value={formulario.categoria}
                onChange={manejarCambio}
                required
              >
                <option value="alimento">Alimento</option>

                <option value="medicamento">Medicamento</option>

                <option value="insumo">Insumo</option>

                <option value="veterinario">Veterinario</option>

                <option value="otro">Otro</option>
              </select>
            </div>

            {/* UNIDAD */}

            <div className="campo-formulario">
              <label>Unidad de medida *</label>

              <select
                name="unidad"
                value={formulario.unidad}
                onChange={manejarCambio}
                required
              >
                <option value="kg">Kilogramos</option>

                <option value="g">Gramos</option>

                <option value="litro">Litros</option>

                <option value="ml">Mililitros</option>

                <option value="unidad">Unidades</option>
              </select>

              <small className="texto-secundario">
                Si el producto ya tiene movimientos, GANATEC no permitirá
                cambiar su unidad.
              </small>
            </div>

            {/* CANTIDAD ACTUAL */}

            <div className="campo-formulario">
              <label>Cantidad actual</label>

              <input
                type="number"
                name="cantidad_actual"
                min="0"
                step="0.01"
                value={formulario.cantidad_actual}
                onChange={manejarCambio}
              />

              <small className="texto-secundario">
                Corrige aquí la cantidad física disponible actualmente.
              </small>
            </div>

            {/* STOCK MÍNIMO */}

            <div className="campo-formulario">
              <label>Stock mínimo</label>

              <input
                type="number"
                name="stock_minimo"
                min="0"
                step="0.01"
                value={formulario.stock_minimo}
                onChange={manejarCambio}
              />

              <small className="texto-secundario">
                Cuando la existencia llegue a este nivel se generará la alerta.
              </small>
            </div>

            {/* DESCRIPCIÓN */}

            <div className="campo-formulario campo-completo">
              <label>Descripción</label>

              <textarea
                rows="4"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambio}
              />
            </div>
          </div>

          {error && <p className="formulario-error">{error}</p>}

          <div className="formulario-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => navigate(`/inventario/${productoId}`)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="boton-principal"
              disabled={guardando}
            >
              <Save size={16} />

              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductoEditar;
