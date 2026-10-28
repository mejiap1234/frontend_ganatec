import { useState } from "react";

import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  crearProductoInventario,
  registrarMovimientoInventario,
} from "../../services/inventario.service";

const ProductoNuevo = () => {
  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "",
    unidad: "",
    cantidad_inicial: "",
    stock_minimo: "",
    descripcion: "",
  });

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     CAMBIOS DEL FORMULARIO
  ========================================================= */

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* =========================================================
     CREAR PRODUCTO
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
      setError("Debes seleccionar una unidad de medida.");

      return;
    }

    if (formulario.stock_minimo !== "" && Number(formulario.stock_minimo) < 0) {
      setError("El stock mínimo no puede ser negativo.");

      return;
    }

    if (
  formulario.cantidad_inicial !== ""
  &&
  Number(
    formulario.cantidad_inicial
  ) < 0
) {

  setError(
    "La cantidad inicial no puede ser negativa."
  );

  return;

}

    try {
      setGuardando(true);

      const respuesta = await crearProductoInventario({
        nombre: formulario.nombre.trim(),

        categoria: formulario.categoria,

        unidad: formulario.unidad,

        stock_minimo:
          formulario.stock_minimo === "" ? 0 : Number(formulario.stock_minimo),

        descripcion: formulario.descripcion.trim() || undefined,
      });

      /*
  Si el usuario indicó una cantidad inicial,
  registramos automáticamente una entrada
  para conservar correctamente la trazabilidad.
*/
      const cantidadInicial = Number(formulario.cantidad_inicial || 0);

      if (cantidadInicial > 0 && respuesta?.producto?.id) {
        await registrarMovimientoInventario(respuesta.producto.id, {
          tipo: "entrada",
          cantidad: cantidadInicial,
          motivo: "ajuste",
          observacion: "Stock inicial registrado al crear el producto",
        });
      }

      navigate("/inventario");
    } catch (error) {
      console.error("Error creando producto:", error);

      setError(
        error.response?.data?.message || "No fue posible crear el producto.",
      );
    } finally {
      setGuardando(false);
    }
  };

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

          <h2>Nuevo producto</h2>

          <p>
            Registra un alimento, medicamento, insumo u otro producto de la
            finca.
          </p>
        </div>
      </div>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div className="dashboard-panel">
        <form className="formulario-reproduccion" onSubmit={manejarGuardar}>
          <div className="form-grid">
            {/* -------------------------------------------------
                NOMBRE
            ------------------------------------------------- */}

            <div className="campo-formulario">
              <label>Nombre *</label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                placeholder="Ej: Sal mineralizada"
                required
              />
            </div>

            {/* -------------------------------------------------
                CATEGORÍA
            ------------------------------------------------- */}

            <div className="campo-formulario">
              <label>Categoría *</label>

              <select
                name="categoria"
                value={formulario.categoria}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar categoría</option>

                <option value="alimento">Alimento</option>

                <option value="medicamento">Medicamento</option>

                <option value="insumo">Insumo</option>

                <option value="veterinario">Veterinario</option>

                <option value="otro">Otro</option>
              </select>
            </div>

            {/* -------------------------------------------------
                UNIDAD
            ------------------------------------------------- */}

            <div className="campo-formulario">
              <label>Unidad de medida *</label>

              <select
                name="unidad"
                value={formulario.unidad}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar unidad</option>

                <option value="kg">Kilogramos</option>

                <option value="g">Gramos</option>

                <option value="litro">Litros</option>

                <option value="ml">Mililitros</option>

                <option value="unidad">Unidades</option>
              </select>
            </div>

            {/* -------------------------------------------------
                    CANTIDAD INICIAL
                ------------------------------------------------- */}

            <div className="campo-formulario">
              <label>Cantidad inicial</label>

              <input
                type="number"
                name="cantidad_inicial"
                min="0"
                step="0.01"
                value={formulario.cantidad_inicial}
                onChange={manejarCambio}
                placeholder="Ej: 50"
              />

              <small className="texto-secundario">
                Cantidad disponible actualmente en la finca.
              </small>
            </div>

            {/* -------------------------------------------------
                STOCK MÍNIMO
            ------------------------------------------------- */}

            <div className="campo-formulario">
              <label>Stock mínimo</label>

              <input
                type="number"
                name="stock_minimo"
                min="0"
                step="0.01"
                value={formulario.stock_minimo}
                onChange={manejarCambio}
                placeholder="Ej: 10"
              />

              <small className="texto-secundario">
                GANATEC avisará cuando el stock llegue a este nivel.
              </small>
            </div>

            {/* -------------------------------------------------
                DESCRIPCIÓN
            ------------------------------------------------- */}

            <div className="campo-formulario campo-completo">
              <label>Descripción</label>

              <textarea
                rows="4"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambio}
                placeholder="Ej: Sal mineral utilizada para suplementación del ganado..."
              />
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && <p className="formulario-error">{error}</p>}

          {/* =================================================
              ACCIONES
          ================================================= */}

          <div className="formulario-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => navigate("/inventario")}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="boton-principal"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductoNuevo;
