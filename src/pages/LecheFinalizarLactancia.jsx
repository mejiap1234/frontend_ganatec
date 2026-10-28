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

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  obtenerAnimalPorId,
} from "../services/animales.service";

import {
  obtenerLactancias,
  finalizarLactancia,
} from "../services/leche.service";


const LecheFinalizarLactancia = () => {

  const {
    animalId,
    lactanciaId,
  } = useParams();

  const navigate =
    useNavigate();


  const [animal, setAnimal] =
    useState(null);

  const [lactancia, setLactancia] =
    useState(null);

  const [formulario, setFormulario] =
    useState({
      fecha_fin: "",
      motivo_fin: "",
      observacion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR LACTANCIA
  ========================================================= */

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        setCargando(true);


        const [
          respuestaAnimal,
          respuestaLactancias,
        ] = await Promise.all([

          obtenerAnimalPorId(
            animalId
          ),

          obtenerLactancias(
            animalId
          ),

        ]);


        const lista =
          Array.isArray(
            respuestaLactancias?.lactancias
          )
            ? respuestaLactancias.lactancias
            : Array.isArray(
                respuestaLactancias
              )
              ? respuestaLactancias
              : [];


        setAnimal(
          respuestaAnimal?.animal
          ||
          respuestaAnimal
        );


        setLactancia(
          lista.find(
            (item) =>
              String(item.id) ===
              String(lactanciaId)
          ) || null
        );


      } catch (error) {

        console.error(
          "Error cargando lactancia:",
          error
        );


        setError(
          "No fue posible cargar la lactancia."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDatos();

  }, [
    animalId,
    lactanciaId,
  ]);


  const manejarCambio = (e) => {

    const { name, value } =
      e.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );

  };


  /* =========================================================
     FINALIZAR LACTANCIA
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!formulario.motivo_fin) {

      setError(
        "Selecciona el motivo de finalización."
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        motivo_fin:
          formulario.motivo_fin,

        ...(formulario.fecha_fin && {
          fecha_fin:
            formulario.fecha_fin,
        }),

        ...(formulario.observacion.trim() && {
          observacion:
            formulario
              .observacion
              .trim(),
        }),

      };


      await finalizarLactancia(
        animalId,
        lactanciaId,
        datos
      );


      navigate(
        `/leche/animal/${animalId}`,
        {
          state: {
            vista: "lactancias",
          },
        }
      );


    } catch (error) {

      console.error(
        "Error finalizando lactancia:",
        error
      );


      setError(
        error.response?.data?.message ||
        "No fue posible finalizar la lactancia."
      );


    } finally {

      setGuardando(false);

    }

  };


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando lactancia...
        </div>

      </DashboardLayout>

    );

  }


  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                `/leche/animal/${animalId}`,
                {
                  state: {
                    vista: "lactancias",
                  },
                }
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
            Finalizar lactancia
          </h1>

          <p>

            {
              animal?.nombre
              ||
              animal?.identificacion
              ||
              "Animal"
            }

          </p>

        </div>

      </div>


      {!lactancia ? (

        <div className="dashboard-error">
          {error || "Lactancia no encontrada."}
        </div>

      ) : String(
          lactancia.estado || ""
        )
          .trim()
          .toLowerCase()
          !== "activa" ? (

        <div className="dashboard-error">
          Esta lactancia ya se encuentra finalizada.
        </div>

      ) : (

        <div className="dashboard-panel">

          <form
            className="formulario-reproduccion"
            onSubmit={manejarGuardar}
          >

            <div className="form-grid">

              <div className="campo-formulario">

                <label>
                  Fecha de finalización
                </label>

                <input
                  type="date"
                  name="fecha_fin"
                  value={
                    formulario.fecha_fin
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Motivo *
                </label>

                <select
                  name="motivo_fin"
                  value={
                    formulario.motivo_fin
                  }
                  onChange={manejarCambio}
                  required
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="secado">
                    Secado
                  </option>

                  <option value="venta">
                    Venta
                  </option>

                  <option value="muerte">
                    Muerte
                  </option>

                  <option value="otro">
                    Otro
                  </option>

                </select>

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Observación
                </label>

                <textarea
                  rows="3"
                  name="observacion"
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
                    `/leche/animal/${animalId}`,
                    {
                      state: {
                        vista: "lactancias",
                      },
                    }
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
                    : "Finalizar lactancia"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default LecheFinalizarLactancia;
