import {
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
  registrarGasto,
} from "../../services/finanzas.service";


const GastoNuevo = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [formulario, setFormulario] =
    useState({
      categoria: "",
      monto: "",
      fecha_movimiento: "",
      descripcion: "",
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
     GUARDAR GASTO
  ========================================================= */

  const manejarGuardar =
    async (e) => {

      e.preventDefault();

      setError("");


      if (!formulario.categoria) {

        setError(
          "Debes seleccionar una categoría."
        );

        return;

      }


      if (
        formulario.monto === ""
        ||
        Number(formulario.monto) <= 0
      ) {

        setError(
          "El monto debe ser mayor que cero."
        );

        return;

      }


      if (
        !formulario.descripcion.trim()
      ) {

        setError(
          "La descripción del gasto es obligatoria."
        );

        return;

      }


      try {

        setGuardando(true);


        await registrarGasto({

          categoria:
            formulario.categoria,

          monto:
            Number(
              formulario.monto
            ),

          descripcion:
            formulario.descripcion.trim(),

          fecha_movimiento:
            formulario.fecha_movimiento
              ? formulario.fecha_movimiento
              : undefined,

        });


        navigate(
          "/finanzas"
        );


      } catch (error) {

        console.error(
          "Error registrando gasto:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible registrar el gasto."
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
            Registrar gasto
          </h2>

          <p>
            Registra un gasto realizado
            en la finca.
          </p>

        </div>

      </div>


      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarGuardar}
        >

          <div className="form-grid">


            {/* CATEGORÍA */}

            <div className="campo-formulario">

              <label>
                Categoría *
              </label>


              <select
                name="categoria"
                value={
                  formulario.categoria
                }
                onChange={manejarCambio}
                required
              >

                <option value="">
                  Seleccionar categoría
                </option>

                <option value="alimentacion">
                  Alimentación
                </option>

                <option value="medicamentos">
                  Medicamentos
                </option>

                <option value="veterinario">
                  Veterinario
                </option>

                <option value="combustible">
                  Combustible
                </option>

                <option value="mantenimiento">
                  Mantenimiento
                </option>

                <option value="transporte">
                  Transporte
                </option>

                <option value="servicios">
                  Servicios
                </option>

                <option value="mano_obra">
                  Mano de obra
                </option>

                <option value="infraestructura">
                  Infraestructura
                </option>

                <option value="otro">
                  Otro
                </option>

              </select>

            </div>


            {/* MONTO */}

            <div className="campo-formulario">

              <label>
                Monto *
              </label>

              <input
                type="number"
                name="monto"
                min="1"
                step="1"
                placeholder="Ej: 250000"
                value={
                  formulario.monto
                }
                onChange={manejarCambio}
                required
              />

              <small className="texto-secundario">
                Valor pagado en pesos colombianos.
              </small>

            </div>


            {/* FECHA */}

            <div className="campo-formulario">

              <label>
                Fecha del gasto
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
                GANATEC utilizará la fecha actual.
              </small>

            </div>


            {/* DESCRIPCIÓN */}

            <div className="campo-formulario campo-completo">

              <label>
                Descripción *
              </label>

              <textarea
                rows="4"
                name="descripcion"
                placeholder="Ej: Compra de 5 bultos de sal mineralizada"
                value={
                  formulario.descripcion
                }
                onChange={manejarCambio}
                required
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
                  : "Registrar gasto"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default GastoNuevo;