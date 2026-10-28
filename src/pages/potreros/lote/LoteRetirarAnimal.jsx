import {
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
  retirarAnimalLote,
} from "../../../services/potreros/potreros.service";


const LoteRetirarAnimal = () => {

  const {
    loteId,
    animalId,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    motivoSalida,
    setMotivoSalida,
  ] = useState("");

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     RETIRAR ANIMAL
  ========================================================= */

  const manejarRetiro = async (e) => {

    e.preventDefault();

    setError("");


    if (!motivoSalida.trim()) {

      setError(
        "Debes indicar el motivo de salida."
      );

      return;

    }


    try {

      setGuardando(true);


      await retirarAnimalLote(
        loteId,
        animalId,
        motivoSalida.trim()
      );


      navigate(
        `/potreros/lotes/${loteId}`
      );


    } catch (error) {

      console.error(
        "Error retirando animal:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible retirar el animal del lote."
      );


    } finally {

      setGuardando(false);

    }

  };


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
            Retirar animal
          </h2>


          <p>
            El animal dejará de pertenecer
            a este lote, pero se conservará
            su historial.
          </p>

        </div>

      </div>


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarRetiro}
        >

          <div className="campo-formulario">

            <label>
              Motivo de salida *
            </label>

            <textarea
              rows="4"
              value={motivoSalida}
              onChange={(e) =>
                setMotivoSalida(
                  e.target.value
                )
              }
              placeholder="Ej: Separación del lote, venta, cambio de manejo..."
              required
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
              disabled={guardando}
            >

              {
                guardando
                  ? "Retirando..."
                  : "Retirar animal"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default LoteRetirarAnimal;