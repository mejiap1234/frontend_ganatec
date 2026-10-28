import {
  useState,
} from "react";

import {
  ArrowLeft,
  Milk,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  registrarProduccionDiaria,
} from "../services/produccionLeche.service";


const obtenerFechaHoy = () => {

  const hoy =
    new Date();

  const fechaLocal =
    new Date(
      hoy.getTime()
      -
      hoy.getTimezoneOffset()
      * 60000
    );

  return fechaLocal
    .toISOString()
    .split("T")[0];

};


const ProduccionDiariaNueva = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    formulario,
    setFormulario,
  ] = useState({

    fecha_produccion:
      obtenerFechaHoy(),

    vacas_ordenadas: "",

    litros_totales: "",

    numero_ordenios: "2",

    observacion: "",

  });


  const [
    guardando,
    setGuardando,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     CAMBIAR CAMPOS
  ========================================================= */

  const manejarCambio =
    (e) => {

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
     GUARDAR PRODUCCIÓN
  ========================================================= */

  const guardar =
    async (e) => {

      e.preventDefault();

      setError("");


      const vacas =
        Number(
          formulario.vacas_ordenadas
        );


      const litros =
        Number(
          formulario.litros_totales
        );


      const ordenios =
        Number(
          formulario.numero_ordenios
        );


      if (
        !Number.isInteger(vacas)
        ||
        vacas <= 0
      ) {

        setError(
          "La cantidad de vacas ordeñadas debe ser mayor que cero."
        );

        return;

      }


      if (
        !Number.isFinite(litros)
        ||
        litros <= 0
      ) {

        setError(
          "Los litros producidos deben ser mayores que cero."
        );

        return;

      }


      if (
        !Number.isInteger(ordenios)
        ||
        ordenios <= 0
      ) {

        setError(
          "El número de ordeños debe ser mayor que cero."
        );

        return;

      }


      try {

        setGuardando(true);


        await registrarProduccionDiaria({

          fecha_produccion:
            formulario.fecha_produccion,

          vacas_ordenadas:
            vacas,

          litros_totales:
            litros,

          numero_ordenios:
            ordenios,

          observacion:
            formulario.observacion
              .trim()
            ||
            null,

        });


        navigate(
          "/leche"
        );


      } catch (error) {

        console.error(
          "Error registrando producción diaria:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible registrar la producción diaria."
        );


      } finally {

        setGuardando(false);

      }

    };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/leche"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <p className="dashboard-label">
            Producción de leche
          </p>


          <h1>
            Producción total del día
          </h1>


          <p>
            Registro rápido de la producción
            general de leche de la finca.
          </p>

        </div>


        <Milk size={32} />

      </div>


      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Registro diario
            </h3>

            <span>
              Usa esta opción cuando no registrarás
              cada vaca individualmente.
            </span>

          </div>

        </div>


        {error && (

          <div className="dashboard-error">
            {error}
          </div>

        )}


        <form
          onSubmit={guardar}
        >

          <div className="form-grid">


            {/* FECHA */}

            <div className="campo-formulario">

              <label>
                Fecha de producción
              </label>


              <input
                type="date"
                name="fecha_produccion"
                value={
                  formulario.fecha_produccion
                }
                onChange={manejarCambio}
                required
              />

            </div>


            {/* VACAS ORDEÑADAS */}

            <div className="campo-formulario">

              <label>
                Vacas ordeñadas
              </label>


              <input
                type="number"
                name="vacas_ordenadas"
                min="1"
                step="1"
                placeholder="Ej: 20"
                value={
                  formulario.vacas_ordenadas
                }
                onChange={manejarCambio}
                required
              />

            </div>


            {/* LITROS TOTALES */}

            <div className="campo-formulario">

              <label>
                Litros totales
              </label>


              <input
                type="number"
                name="litros_totales"
                min="0.01"
                step="0.01"
                placeholder="Ej: 100"
                value={
                  formulario.litros_totales
                }
                onChange={manejarCambio}
                required
              />

            </div>


            {/* NÚMERO DE ORDEÑOS */}

            <div className="campo-formulario">

              <label>
                Número de ordeños
              </label>


              <input
                type="number"
                name="numero_ordenios"
                min="1"
                step="1"
                value={
                  formulario.numero_ordenios
                }
                onChange={manejarCambio}
                required
              />

            </div>


            {/* OBSERVACIÓN */}

            <div className="campo-formulario campo-completo">

              <label>
                Observación
              </label>


              <textarea
                name="observacion"
                rows="4"
                placeholder="Ej: Producción normal del día..."
                value={
                  formulario.observacion
                }
                onChange={manejarCambio}
              />

            </div>

          </div>


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() =>
                navigate(
                  "/leche"
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
                  : "Guardar producción"
              }

            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>

  );

};


export default ProduccionDiariaNueva;