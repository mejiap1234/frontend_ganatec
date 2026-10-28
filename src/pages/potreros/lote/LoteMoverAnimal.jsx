import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  MoveRight,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerLotes,
  obtenerAnimalesLote,
  moverAnimalLote,
} from "../../../services/potreros/potreros.service";


const LoteMoverAnimal = () => {

  const {
    loteId,
    animalId,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [animal, setAnimal] =
    useState(null);

  const [lotes, setLotes] =
    useState([]);

  const [
    loteDestinoId,
    setLoteDestinoId,
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
          respuestaLotes,
          respuestaAnimales,
        ] = await Promise.all([

          obtenerLotes(),

          obtenerAnimalesLote(
            loteId
          ),

        ]);


        const listaLotes =
          Array.isArray(
            respuestaLotes?.lotes
          )
            ? respuestaLotes.lotes
            : [];


        /*
          Solo mostramos lotes activos
          y excluimos el lote actual.
        */
        setLotes(
          listaLotes.filter(
            (lote) =>
              lote.estado === "activo"
              &&
              String(lote.id) !==
              String(loteId)
          )
        );


        const listaAnimales =
          Array.isArray(
            respuestaAnimales?.animales
          )
            ? respuestaAnimales.animales
            : [];


        const animalEncontrado =
          listaAnimales.find(
            (item) =>
              String(item.id) ===
              String(animalId)
          )
          ||
          null;


        setAnimal(
          animalEncontrado
        );


      } catch (error) {

        console.error(
          "Error cargando información:",
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

  }, [
    loteId,
    animalId,
  ]);


  /* =========================================================
     MOVER ANIMAL
  ========================================================= */

  const manejarMovimiento = async (e) => {

    e.preventDefault();

    setError("");


    if (!loteDestinoId) {

      setError(
        "Debes seleccionar el lote de destino."
      );

      return;

    }


    if (!motivo.trim()) {

      setError(
        "Debes indicar el motivo del cambio."
      );

      return;

    }


    try {

      setGuardando(true);


      await moverAnimalLote(
        animalId,
        loteDestinoId,
        motivo.trim()
      );


      /*
        Después del movimiento regresamos
        al lote de origen.

        El animal ya no aparecerá allí
        porque ahora pertenece al lote destino.
      */
      navigate(
        `/potreros/lotes/${loteId}`
      );


    } catch (error) {

      console.error(
        "Error moviendo animal:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible cambiar el animal de lote."
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

        Cargando información...

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
                `/potreros/lotes/${loteId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Cambiar de lote
          </h2>


          <p>

            {
              animal
                ? `${animal.nombre || "Sin nombre"} - ${animal.identificacion}`
                : "Mover animal a otro lote"
            }

          </p>

        </div>

      </div>


      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarMovimiento}
        >

          {/* =================================================
              ANIMAL
          ================================================= */}

          {animal && (

            <div className="potrero-descanso-actual">

              <div>

                <span>
                  Animal
                </span>

                <strong>

                  {
                    animal.nombre
                    ||
                    "Sin nombre"
                  }

                </strong>

              </div>


              <div>

                <span>
                  Identificación
                </span>

                <strong>

                  {
                    animal.identificacion
                    ||
                    "-"
                  }

                </strong>

              </div>


              <div>

                <span>
                  Raza
                </span>

                <strong>

                  {
                    animal.raza
                    ||
                    "-"
                  }

                </strong>

              </div>

            </div>

          )}


          {/* =================================================
              LOTE DE DESTINO
          ================================================= */}

          <div className="campo-formulario">

            <label>
              Lote de destino *
            </label>

            <select
              value={loteDestinoId}
              onChange={(e) =>
                setLoteDestinoId(
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Seleccionar lote
              </option>


              {lotes.map(
                (lote) => (

                  <option
                    key={lote.id}
                    value={lote.id}
                  >

                    {lote.nombre}

                    {
                      lote.total_animales !==
                      undefined
                        ? ` (${lote.total_animales} animales)`
                        : ""
                    }

                  </option>

                )
              )}

            </select>


            {lotes.length === 0 && (

              <small className="texto-secundario">

                No hay otro lote activo
                disponible para realizar
                el movimiento.

              </small>

            )}

          </div>


          {/* =================================================
              MOTIVO
          ================================================= */}

          <div className="campo-formulario">

            <label>
              Motivo del cambio *
            </label>

            <textarea
              rows="4"
              value={motivo}
              onChange={(e) =>
                setMotivo(
                  e.target.value
                )
              }
              placeholder="Ej: Cambio a lote de vacas en producción..."
              required
            />

          </div>


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
                lotes.length === 0
              }
            >

              <MoveRight size={16} />

              {
                guardando
                  ? "Moviendo..."
                  : "Cambiar de lote"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default LoteMoverAnimal;