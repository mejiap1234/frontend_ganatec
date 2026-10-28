import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  registrarVentaLeche,
} from "../../services/finanzas.service";


const VentaLecheNueva = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [formulario, setFormulario] =
    useState({
      comprador: "",
      cantidad_litros: "",
      precio_litro: "",
      fecha_venta: "",
      observacion: "",
    });


  const [guardando, setGuardando] =
    useState(false);


  const [error, setError] =
    useState("");


  /* =========================================================
     CAMBIAR CAMPOS
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
     TOTAL DE LA VENTA
  ========================================================= */

  const totalVenta =
    useMemo(() => {

      const litros =
        Number(
          formulario.cantidad_litros
          ||
          0
        );


      const precio =
        Number(
          formulario.precio_litro
          ||
          0
        );


      return litros * precio;

    }, [
      formulario.cantidad_litros,
      formulario.precio_litro,
    ]);


  /* =========================================================
     FORMATEAR DINERO
  ========================================================= */

  const formatearDinero = (
    valor
  ) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(valor || 0)
    );

  };


  /* =========================================================
     GUARDAR VENTA
  ========================================================= */

  const manejarGuardar =
    async (e) => {

      e.preventDefault();

      setError("");


      if (
        formulario.cantidad_litros === ""
        ||
        Number(
          formulario.cantidad_litros
        ) <= 0
      ) {

        setError(
          "La cantidad de litros debe ser mayor que cero."
        );

        return;

      }


      if (
        formulario.precio_litro === ""
        ||
        Number(
          formulario.precio_litro
        ) < 0
      ) {

        setError(
          "El precio por litro no es válido."
        );

        return;

      }


      try {

        setGuardando(true);


        await registrarVentaLeche({

          comprador:
            formulario.comprador.trim()
            ||
            undefined,

          cantidad_litros:
            Number(
              formulario.cantidad_litros
            ),

          precio_litro:
            Number(
              formulario.precio_litro
            ),

          fecha_venta:
            formulario.fecha_venta
              ? formulario.fecha_venta
              : undefined,

          observacion:
            formulario.observacion.trim()
            ||
            undefined,

        });


        navigate(
          "/finanzas"
        );


      } catch (error) {

        console.error(
          "Error registrando venta de leche:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible registrar la venta de leche."
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

      <div className="modulo-subheader">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Registrar venta de leche
          </h2>

          <p>
            Registra los litros vendidos,
            el precio por litro y el comprador.
          </p>

        </div>

      </div>


      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarGuardar}
        >

          <div className="form-grid">


            {/* COMPRADOR */}

            <div className="campo-formulario">

              <label>
                Comprador
              </label>

              <input
                type="text"
                name="comprador"
                placeholder="Ej: Quesera San José"
                value={
                  formulario.comprador
                }
                onChange={manejarCambio}
              />

            </div>


            {/* LITROS VENDIDOS */}

            <div className="campo-formulario">

              <label>
                Litros vendidos *
              </label>

              <input
                type="number"
                name="cantidad_litros"
                min="0.01"
                step="0.01"
                placeholder="Ej: 100"
                value={
                  formulario.cantidad_litros
                }
                onChange={manejarCambio}
                required
              />

            </div>


            {/* PRECIO POR LITRO */}

            <div className="campo-formulario">

              <label>
                Precio por litro *
              </label>

              <input
                type="number"
                name="precio_litro"
                min="0"
                step="1"
                placeholder="Ej: 2200"
                value={
                  formulario.precio_litro
                }
                onChange={manejarCambio}
                required
              />

              <small className="texto-secundario">
                Valor recibido por cada litro.
              </small>

            </div>


            {/* FECHA */}

            <div className="campo-formulario">

              <label>
                Fecha de venta
              </label>

              <input
                type="datetime-local"
                name="fecha_venta"
                value={
                  formulario.fecha_venta
                }
                onChange={manejarCambio}
              />

              <small className="texto-secundario">
                Si la dejas vacía,
                se utilizará la fecha actual.
              </small>

            </div>


            {/* TOTAL */}

            <div className="campo-formulario">

              <label>
                Total de la venta
              </label>

              <div className="campo-calculado">

                <strong>
                  {
                    formatearDinero(
                      totalVenta
                    )
                  }
                </strong>

              </div>

              <small className="texto-secundario">
                Litros vendidos × precio por litro.
              </small>

            </div>


            {/* OBSERVACIÓN */}

            <div className="campo-formulario campo-completo">

              <label>
                Observación
              </label>

              <textarea
                rows="4"
                name="observacion"
                placeholder="Información adicional sobre la venta"
                value={
                  formulario.observacion
                }
                onChange={manejarCambio}
              />

            </div>

          </div>


          {error && (

            <p className="formulario-error">

              {error}

            </p>

          )}


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() =>
                navigate(
                  "/finanzas"
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

              <Save size={16} />

              {
                guardando
                  ? "Guardando..."
                  : "Registrar venta"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default VentaLecheNueva;