import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerInventario,
  registrarMovimientoInventario,
} from "../../services/inventario.service";


const MovimientoNuevo = () => {

  const {
    productoId,
    tipo,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     TIPO DE MOVIMIENTO
  ========================================================= */

  const esEntrada =
    tipo === "entrada";

  const esSalida =
    tipo === "salida";


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [producto, setProducto] =
    useState(null);

  const [formulario, setFormulario] =
    useState({
      cantidad: "",
      motivo: "",
      fecha_movimiento: "",
      observacion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR PRODUCTO
  ========================================================= */

  useEffect(() => {

    const cargarProducto = async () => {

      try {

        setCargando(true);

        setError("");


        if (
          !esEntrada
          &&
          !esSalida
        ) {

          setError(
            "Tipo de movimiento inválido."
          );

          return;

        }


        const respuesta =
          await obtenerInventario();


        const productos =
          Array.isArray(
            respuesta?.productos
          )
            ? respuesta.productos
            : [];


        const encontrado =
          productos.find(
            (item) =>
              String(item.id) ===
              String(productoId)
          )
          ||
          null;


        setProducto(
          encontrado
        );


      } catch (error) {

        console.error(
          "Error cargando producto:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible cargar el producto."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarProducto();

  }, [
    productoId,
    esEntrada,
    esSalida,
  ]);


  /* =========================================================
     CAMBIO DE CAMPOS
  ========================================================= */

  const manejarCambio = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );

  };


  /* =========================================================
     GUARDAR MOVIMIENTO
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    const cantidad =
      Number(
        formulario.cantidad
      );


    if (
      Number.isNaN(cantidad)
      ||
      cantidad <= 0
    ) {

      setError(
        "La cantidad debe ser mayor que cero."
      );

      return;

    }


    if (!formulario.motivo) {

      setError(
        "Debes seleccionar el motivo del movimiento."
      );

      return;

    }


    /*
      Validación adicional del frontend.

      El backend también impide que una salida
      deje el inventario en negativo.
    */
    if (
      esSalida
      &&
      producto
      &&
      cantidad >
        Number(
          producto.stock_actual
          ||
          0
        )
    ) {

      setError(
        `No hay existencias suficientes. Stock actual: ${
          Number(
            producto.stock_actual
            ||
            0
          )
        } ${producto.unidad}.`
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        tipo,

        cantidad,

        motivo:
          formulario.motivo,

        observacion:
          formulario.observacion.trim()
          ||
          undefined,

      };


      /*
        La fecha es opcional.
        Si se deja vacía, el backend usa
        la fecha y hora actuales.
      */
      if (
        formulario.fecha_movimiento
      ) {

        datos.fecha_movimiento =
          formulario.fecha_movimiento;

      }


      await registrarMovimientoInventario(
        productoId,
        datos
      );


      navigate(
        `/inventario/${productoId}`
      );


    } catch (error) {

      console.error(
        "Error registrando movimiento:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible registrar el movimiento."
      );


    } finally {

      setGuardando(false);

    }

  };


  /* =========================================================
     CARGA
  ========================================================= */

  if (cargando) {

    return (

      <div className="dashboard-loading">

        Cargando producto...

      </div>

    );

  }


  if (!producto) {

    return (

      <div className="dashboard-error">

        {
          error
          ||
          "Producto no encontrado."
        }

      </div>

    );

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
            onClick={() =>
              navigate(
                `/inventario/${productoId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>

            {
              esEntrada
                ? "Registrar entrada"
                : "Registrar salida"
            }

          </h2>


          <p>
            {producto.nombre}
          </p>

        </div>

      </div>


      {/* =====================================================
          RESUMEN DEL PRODUCTO
      ===================================================== */}

      <div className="potreros-resumen">

        <div>

          <span>
            Stock actual
          </span>

          <strong>

            {
              Number(
                producto.stock_actual
                ||
                0
              )
            }

            {" "}

            {producto.unidad}

          </strong>

          <small>
            Existencia disponible
          </small>

        </div>


        <div>

          <span>
            Movimiento
          </span>

          <strong>

            {
              esEntrada
                ? "Entrada"
                : "Salida"
            }

          </strong>

          <small>

            {
              esEntrada
                ? "Aumentará el stock"
                : "Disminuirá el stock"
            }

          </small>

        </div>


        <div>

          <span>
            Categoría
          </span>

          <strong className="texto-capitalizado">

            {
              producto.categoria
            }

          </strong>

          <small>
            Tipo de producto
          </small>

        </div>


        <div>

          <span>
            Unidad
          </span>

          <strong>

            {
              producto.unidad
            }

          </strong>

          <small>
            Unidad de medida
          </small>

        </div>

      </div>


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarGuardar}
        >

          <div className="form-grid">

            {/* -------------------------------------------------
                CANTIDAD
            ------------------------------------------------- */}

            <div className="campo-formulario">

              <label>
                Cantidad *
              </label>

              <input
                type="number"
                name="cantidad"
                min="0.01"
                step="0.01"
                value={
                  formulario.cantidad
                }
                onChange={manejarCambio}
                placeholder="Ej: 25"
                required
              />

              <small className="texto-secundario">

                Unidad:
                {" "}
                {producto.unidad}

              </small>

            </div>


            {/* -------------------------------------------------
                MOTIVO
            ------------------------------------------------- */}

            <div className="campo-formulario">

              <label>
                Motivo *
              </label>

              <select
                name="motivo"
                value={
                  formulario.motivo
                }
                onChange={manejarCambio}
                required
              >

                <option value="">
                  Seleccionar motivo
                </option>


                {esEntrada ? (

                  <>

                    <option value="compra">
                      Compra
                    </option>

                    <option value="ajuste">
                      Ajuste
                    </option>

                    <option value="otro">
                      Otro
                    </option>

                  </>

                ) : (

                  <>

                    <option value="alimentacion">
                      Alimentación
                    </option>

                    <option value="tratamiento">
                      Tratamiento
                    </option>

                    <option value="vacunacion">
                      Vacunación
                    </option>

                    <option value="consumo">
                      Consumo
                    </option>

                    <option value="venta">
                      Venta
                    </option>

                    <option value="ajuste">
                      Ajuste
                    </option>

                    <option value="otro">
                      Otro
                    </option>

                  </>

                )}

              </select>

            </div>


            {/* -------------------------------------------------
                FECHA
            ------------------------------------------------- */}

            <div className="campo-formulario">

              <label>
                Fecha del movimiento
              </label>

              <input
                type="datetime-local"
                name="fecha_movimiento"
                value={
                  formulario.fecha_movimiento
                }
                onChange={manejarCambio}
              />

              <small className="texto-secundario">

                Si la dejas vacía,
                se utilizará la fecha actual.

              </small>

            </div>


            {/* -------------------------------------------------
                OBSERVACIÓN
            ------------------------------------------------- */}

            <div className="campo-formulario campo-completo">

              <label>
                Observación
              </label>

              <textarea
                rows="4"
                name="observacion"
                value={
                  formulario.observacion
                }
                onChange={manejarCambio}
                placeholder={
                  esEntrada
                    ? "Ej: Compra de sal mineral para abastecimiento..."
                    : "Ej: Suministro al lote de vacas en producción..."
                }
              />

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <p className="formulario-error">

              {error}

            </p>

          )}


          {/* =================================================
              ACCIONES
          ================================================= */}

          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() =>
                navigate(
                  `/inventario/${productoId}`
                )
              }
            >

              Cancelar

            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={guardando}
            >

              {
                esEntrada
                  ? (
                    <ArrowDownToLine
                      size={16}
                    />
                  )
                  : (
                    <ArrowUpFromLine
                      size={16}
                    />
                  )
              }


              {
                guardando
                  ? "Guardando..."
                  : esEntrada
                    ? "Registrar entrada"
                    : "Registrar salida"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default MovimientoNuevo;