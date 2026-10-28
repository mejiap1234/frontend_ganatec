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
  obtenerServiciosReproductivos,
  registrarDiagnosticoGestacion,
} from "../services/reproduccion.service";


const ReproduccionDiagnostico = () => {

  const {
    animalId,
    servicioId,
  } = useParams();

  const navigate =
    useNavigate();


  const [animal, setAnimal] =
    useState(null);

  const [servicio, setServicio] =
    useState(null);

  const [formulario, setFormulario] =
    useState({
      fecha_diagnostico: "",
      resultado: "",
      metodo: "",
      responsable: "",
      observacion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const cargarDatos = async () => {

      try {

        setCargando(true);


        const [
          respuestaAnimal,
          respuestaServicios,
        ] = await Promise.all([

          obtenerAnimalPorId(
            animalId
          ),

          obtenerServiciosReproductivos(
            animalId
          ),

        ]);


        const listaServicios =
          Array.isArray(
            respuestaServicios?.servicios
          )
            ? respuestaServicios.servicios
            : Array.isArray(
                respuestaServicios
              )
              ? respuestaServicios
              : [];


        setAnimal(
          respuestaAnimal?.animal
          ||
          respuestaAnimal
        );


        setServicio(
          listaServicios.find(
            (item) =>
              String(item.id) ===
              String(servicioId)
          ) || null
        );


      } catch (error) {

        console.error(
          "Error cargando diagnóstico:",
          error
        );

        setError(
          "No fue posible cargar el servicio reproductivo."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDatos();

  }, [
    animalId,
    servicioId,
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


  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!formulario.resultado) {

      setError(
        "Selecciona el resultado del diagnóstico."
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        resultado:
          formulario.resultado,

        ...(formulario.fecha_diagnostico && {
          fecha_diagnostico:
            formulario.fecha_diagnostico,
        }),

        ...(formulario.metodo && {
          metodo:
            formulario.metodo,
        }),

        ...(formulario.responsable.trim() && {
          responsable:
            formulario
              .responsable
              .trim(),
        }),

        ...(formulario.observacion.trim() && {
          observacion:
            formulario
              .observacion
              .trim(),
        }),

      };


      await registrarDiagnosticoGestacion(
        animalId,
        servicioId,
        datos
      );


      navigate(
        `/reproduccion/animal/${animalId}`
      );


    } catch (error) {

      console.error(
        "Error registrando diagnóstico:",
        error
      );

      setError(
        error.response?.data?.message ||
        "No fue posible registrar el diagnóstico."
      );


    } finally {

      setGuardando(false);

    }

  };


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando servicio...
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
                `/reproduccion/animal/${animalId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <p className="dashboard-label">
            Reproducción
          </p>

          <h1>
            Diagnóstico de gestación
          </h1>

          <p>

            {
              animal?.nombre
              ||
              animal?.identificacion
              ||
              "Animal"
            }

            {
              servicio?.fecha_servicio
                ? ` · Servicio del ${new Date(
                    servicio.fecha_servicio
                  ).toLocaleDateString(
                    "es-CO",
                    {
                      timeZone: "UTC",
                    }
                  )}`
                : ""
            }

          </p>

        </div>

      </div>


      {!servicio ? (

        <div className="dashboard-error">
          Servicio reproductivo no encontrado.
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
                  Fecha del diagnóstico
                </label>

                <input
                  type="date"
                  name="fecha_diagnostico"
                  value={
                    formulario.fecha_diagnostico
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Resultado *
                </label>

                <select
                  name="resultado"
                  value={
                    formulario.resultado
                  }
                  onChange={manejarCambio}
                  required
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="prenada">
                    Preñada
                  </option>

                  <option value="vacia">
                    Vacía
                  </option>

                  <option value="dudosa">
                    Dudosa
                  </option>

                </select>

              </div>


              <div className="campo-formulario">

                <label>
                  Método
                </label>

                <select
                  name="metodo"
                  value={
                    formulario.metodo
                  }
                  onChange={manejarCambio}
                >

                  <option value="">
                    Sin especificar
                  </option>

                  <option value="palpacion">
                    Palpación
                  </option>

                  <option value="ecografia">
                    Ecografía
                  </option>

                  <option value="otro">
                    Otro
                  </option>

                </select>

              </div>


              <div className="campo-formulario">

                <label>
                  Responsable
                </label>

                <input
                  type="text"
                  name="responsable"
                  value={
                    formulario.responsable
                  }
                  onChange={manejarCambio}
                />

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
                    `/reproduccion/animal/${animalId}`
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
                    ? "Guardando..."
                    : "Guardar diagnóstico"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default ReproduccionDiagnostico;
