import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerPotreros,
  obtenerDescansosPotrero,
  finalizarDescansoPotrero,
} from "../../../services/potreros/potreros.service";


const PotreroFinalizarDescanso = () => {

  const { potreroId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [potrero, setPotrero] =
    useState(null);

  const [
    descansoActual,
    setDescansoActual,
  ] = useState(null);

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR INFORMACIÓN
  ========================================================= */

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        setCargando(true);
        setError("");


        const [
          respuestaPotreros,
          respuestaDescansos,
        ] = await Promise.all([

          obtenerPotreros(),

          obtenerDescansosPotrero(
            potreroId
          ),

        ]);


        const listaPotreros =
          Array.isArray(
            respuestaPotreros?.potreros
          )
            ? respuestaPotreros.potreros
            : [];


        const potreroEncontrado =
          listaPotreros.find(
            (item) =>
              String(item.id) ===
              String(potreroId)
          ) || null;


        setPotrero(
          potreroEncontrado
        );


        setDescansoActual(
          respuestaDescansos
            ?.descanso_actual
          || null
        );


      } catch (error) {

        console.error(
          "Error cargando descanso:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible cargar el descanso."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDatos();

  }, [potreroId]);


  /* =========================================================
     FINALIZAR DESCANSO
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    try {

      setGuardando(true);


      await finalizarDescansoPotrero(
        potreroId,
        {
          observacion:
            observacion.trim()
            ||
            undefined,
        }
      );


      navigate(
        `/potreros/${potreroId}`
      );


    } catch (error) {

      console.error(
        "Error finalizando descanso:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible finalizar el descanso."
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

        Cargando descanso...

      </div>

    );

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
            onClick={() =>
              navigate(
                `/potreros/${potreroId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Finalizar descanso
          </h2>


          <p>

            {
              potrero?.nombre
              ||
              "Potrero"
            }

          </p>

        </div>

      </div>


      {!descansoActual ? (

        <div className="dashboard-error">

          {
            error
            ||
            "Este potrero no tiene un descanso activo."
          }

        </div>

      ) : (

        <div className="dashboard-panel">

          {/* ===============================================
              INFORMACIÓN DEL DESCANSO
          =============================================== */}

          <div className="potrero-descanso-actual">

            <div>

              <span>
                Fecha de inicio
              </span>

              <strong>

                {
                  descansoActual.fecha_inicio
                    ? new Date(
                        descansoActual.fecha_inicio
                      )
                        .toLocaleDateString(
                          "es-CO",
                          {
                            timeZone: "UTC",
                          }
                        )
                    : "-"
                }

              </strong>

            </div>


            <div>

              <span>
                Días de descanso
              </span>

              <strong>

                {
                  descansoActual.dias_descanso
                  ||
                  0
                }

              </strong>

            </div>

          </div>


          {/* ===============================================
              FORMULARIO
          =============================================== */}

          <form
            className="formulario-reproduccion"
            onSubmit={manejarGuardar}
          >

            <div className="campo-formulario">

              <label>
                Observación
              </label>

              <textarea
                rows="4"
                value={observacion}
                onChange={(e) =>
                  setObservacion(
                    e.target.value
                  )
                }
                placeholder="Ej: Pastura recuperada y lista para una nueva rotación..."
              />

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
                    `/potreros/${potreroId}`
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
                  guardando
                    ? "Finalizando..."
                    : "Finalizar descanso"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </>

  );

};


export default PotreroFinalizarDescanso;