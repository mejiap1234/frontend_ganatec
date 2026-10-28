import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  MapPin,
  MoveRight,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerPotreros,
  obtenerHistorialPotrerosLote,
  moverLotePotrero,
} from "../../../services/potreros/potreros.service";


const LoteMoverPotrero = () => {

  const { loteId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [lote, setLote] =
    useState(null);

  const [
    ubicacionActual,
    setUbicacionActual,
  ] = useState(null);

  const [potreros, setPotreros] =
    useState([]);

  const [
    potreroDestinoId,
    setPotreroDestinoId,
  ] = useState("");

  const [motivo, setMotivo] =
    useState("");

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
          respuestaHistorial,
        ] = await Promise.all([

          obtenerPotreros(),

          obtenerHistorialPotrerosLote(
            loteId
          ),

        ]);


        /* -----------------------------------------
           INFORMACIÓN DEL LOTE
        ----------------------------------------- */

        setLote(
          respuestaHistorial?.lote
          ||
          null
        );


        /* -----------------------------------------
           UBICACIÓN ACTUAL
        ----------------------------------------- */

        const actual =
          respuestaHistorial
            ?.ubicacion_actual
          ||
          null;


        setUbicacionActual(
          actual
        );


        /* -----------------------------------------
           POTREROS DISPONIBLES
        ----------------------------------------- */

        const listaPotreros =
          Array.isArray(
            respuestaPotreros?.potreros
          )
            ? respuestaPotreros.potreros
            : [];


        /*
          No mostramos:

          - potreros inactivos
          - potreros en descanso
          - el mismo potrero donde ya está el lote
        */
        setPotreros(
          listaPotreros.filter(
            (potrero) => {

              const esUtilizable =
                potrero.estado !== "inactivo"
                &&
                potrero.estado !== "descanso";


              const esPotreroActual =
                actual
                &&
                String(
                  actual.potrero_id
                ) ===
                String(
                  potrero.id
                );


              return (
                esUtilizable
                &&
                !esPotreroActual
              );

            }
          )
        );


      } catch (error) {

        console.error(
          "Error cargando información del lote:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible cargar la información."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDatos();

  }, [loteId]);


  /* =========================================================
     MOVER LOTE
  ========================================================= */

  const manejarMovimiento = async (e) => {

    e.preventDefault();

    setError("");


    if (!potreroDestinoId) {

      setError(
        "Debes seleccionar el potrero de destino."
      );

      return;

    }


    try {

      setGuardando(true);


      await moverLotePotrero(
        loteId,
        {
          potrero_id:
            Number(
              potreroDestinoId
            ),

          motivo:
            motivo.trim()
            ||
            "Rotación de potrero",
        }
      );


      navigate(
        `/potreros/lotes/${loteId}`
      );


    } catch (error) {

      console.error(
        "Error moviendo lote:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible mover el lote al nuevo potrero."
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

        Cargando potreros...

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
                `/potreros/lotes/${loteId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Mover lote de potrero
          </h2>


          <p>

            {
              lote?.nombre
              ||
              "Rotación del lote"
            }

          </p>

        </div>

      </div>


      {/* =====================================================
          UBICACIÓN ACTUAL
      ===================================================== */}

      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Ubicación actual
            </h3>

            <span>
              Potrero donde se encuentra
              actualmente el lote
            </span>

          </div>

        </div>


        {ubicacionActual ? (

          <div className="potrero-descanso-actual">

            <div>

              <span>
                Potrero
              </span>

              <strong>

                {
                  ubicacionActual
                    .potrero_nombre
                }

              </strong>

            </div>


            <div>

              <span>
                Fecha de ingreso
              </span>

              <strong>

                {
                  ubicacionActual
                    .fecha_ingreso
                    ? new Date(
                        ubicacionActual
                          .fecha_ingreso
                      )
                        .toLocaleDateString(
                          "es-CO"
                        )
                    : "-"
                }

              </strong>

            </div>


            <div>

              <span>
                Permanencia
              </span>

              <strong>

                {
                  ubicacionActual
                    .dias_permanencia
                  ||
                  0
                } días

              </strong>

            </div>

          </div>

        ) : (

          <div className="estado-vacio">

            <MapPin size={28} />

            <p>
              Este lote todavía no tiene
              un potrero asignado.
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarMovimiento}
        >

          <div className="campo-formulario">

            <label>
              Potrero de destino *
            </label>

            <select
              value={potreroDestinoId}
              onChange={(e) =>
                setPotreroDestinoId(
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Seleccionar potrero
              </option>


              {potreros.map(
                (potrero) => (

                  <option
                    key={potrero.id}
                    value={potrero.id}
                  >

                    {potrero.nombre}

                    {
                      potrero.area_hectareas
                        ? ` - ${Number(
                            potrero.area_hectareas
                          )} hectáreas`
                        : ""
                    }

                    {
                      potrero.estado
                        ? ` - ${potrero.estado}`
                        : ""
                    }

                  </option>

                )
              )}

            </select>


            {potreros.length === 0 && (

              <small className="texto-secundario">

                No hay otro potrero
                disponible para mover
                este lote.

              </small>

            )}

          </div>


          <div className="campo-formulario">

            <label>
              Motivo del traslado
            </label>

            <textarea
              rows="4"
              value={motivo}
              onChange={(e) =>
                setMotivo(
                  e.target.value
                )
              }
              placeholder="Ej: Rotación por recuperación de pastura..."
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
                  `/potreros/lotes/${loteId}`
                )
              }
            >

              Cancelar

            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={
                guardando
                ||
                potreros.length === 0
              }
            >

              <MoveRight size={16} />

              {
                guardando
                  ? "Moviendo..."
                  : "Mover lote"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default LoteMoverPotrero;