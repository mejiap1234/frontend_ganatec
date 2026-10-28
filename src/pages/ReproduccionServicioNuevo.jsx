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
  obtenerAnimales,
} from "../services/animales.service";

import {
  registrarServicioReproductivo,
} from "../services/reproduccion.service";


const ReproduccionServicioNuevo = () => {

  const { animalId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [animales, setAnimales] =
    useState([]);

  const [
    reproductores,
    setReproductores,
  ] = useState([]);

  const [
    animalSeleccionado,
    setAnimalSeleccionado,
  ] = useState(
    animalId || ""
  );

  const [
    origenReproductor,
    setOrigenReproductor,
  ] = useState("externo");

  const [formulario, setFormulario] =
    useState({
      tipo_servicio: "",
      fecha_servicio: "",
      reproductor_id: "",
      reproductor_externo: "",
      codigo_semen: "",
      responsable: "",
      observacion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR ANIMALES
  ========================================================= */

  useEffect(() => {

    const cargarAnimales = async () => {

      try {

        setCargando(true);


        const respuesta =
          await obtenerAnimales();


        const lista =
          Array.isArray(respuesta)
            ? respuesta
            : Array.isArray(
                respuesta?.animales
              )
              ? respuesta.animales
              : Array.isArray(
                  respuesta?.data?.animales
                )
                ? respuesta.data.animales
                : Array.isArray(
                    respuesta?.data
                  )
                  ? respuesta.data
                  : [];


        const activos =
          lista.filter(
            (animal) =>
              String(
                animal.estado || ""
              )
                .trim()
                .toLowerCase()
              === "activo"
          );


        setAnimales(
          activos.filter(
            (animal) =>
              String(
                animal.sexo || ""
              )
                .trim()
                .toLowerCase()
              === "hembra"
          )
        );


        setReproductores(
          activos.filter(
            (animal) =>
              String(
                animal.sexo || ""
              )
                .trim()
                .toLowerCase()
              === "macho"
          )
        );


      } catch (error) {

        console.error(
          "Error cargando animales:",
          error
        );

        setError(
          "No fue posible cargar los animales."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarAnimales();

  }, []);


  /* =========================================================
     CAMBIOS DEL FORMULARIO
  ========================================================= */

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
     REGISTRAR SERVICIO
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!animalSeleccionado) {

      setError(
        "Selecciona la hembra."
      );

      return;

    }


    if (!formulario.tipo_servicio) {

      setError(
        "Selecciona el tipo de servicio."
      );

      return;

    }


    if (
      origenReproductor === "externo"
      &&
      !formulario
        .reproductor_externo
        .trim()
    ) {

      setError(
        "Indica el reproductor utilizado."
      );

      return;

    }


    if (
      origenReproductor === "registrado"
      &&
      !formulario.reproductor_id
    ) {

      setError(
        "Selecciona un reproductor registrado."
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        tipo_servicio:
          formulario.tipo_servicio,

        ...(formulario.fecha_servicio && {
          fecha_servicio:
            formulario.fecha_servicio,
        }),

        ...(origenReproductor === "externo" && {
          reproductor_externo:
            formulario
              .reproductor_externo
              .trim(),
        }),

        ...(origenReproductor === "registrado" && {
          reproductor_id:
            Number(
              formulario.reproductor_id
            ),
        }),

        ...(formulario.codigo_semen.trim() && {
          codigo_semen:
            formulario
              .codigo_semen
              .trim(),
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


      await registrarServicioReproductivo(
        animalSeleccionado,
        datos
      );


      navigate(
        `/reproduccion/animal/${animalSeleccionado}`
      );


    } catch (error) {

      console.error(
        "Error registrando servicio:",
        error
      );

      setError(
        error.response?.data?.message ||
        "No fue posible registrar el servicio reproductivo."
      );


    } finally {

      setGuardando(false);

    }

  };


  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                animalId
                  ? `/reproduccion/animal/${animalId}`
                  : "/reproduccion"
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
            Registrar servicio
          </h1>

          <p>
            Registra una inseminación artificial
            o una monta natural.
          </p>

        </div>

      </div>


      {cargando ? (

        <div className="dashboard-loading">
          Cargando animales...
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
                  Hembra *
                </label>

                <select
                  value={animalSeleccionado}
                  onChange={(e) =>
                    setAnimalSeleccionado(
                      e.target.value
                    )
                  }
                  disabled={Boolean(animalId)}
                  required
                >

                  <option value="">
                    Seleccionar
                  </option>

                  {animales.map(
                    (animal) => (

                      <option
                        key={animal.id}
                        value={animal.id}
                      >

                        {
                          animal.nombre
                          ||
                          "Sin nombre"
                        }

                        {" - "}

                        {animal.identificacion}

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="campo-formulario">

                <label>
                  Tipo de servicio *
                </label>

                <select
                  name="tipo_servicio"
                  value={
                    formulario.tipo_servicio
                  }
                  onChange={manejarCambio}
                  required
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="inseminacion_artificial">
                    Inseminación artificial
                  </option>

                  <option value="monta_natural">
                    Monta natural
                  </option>

                </select>

              </div>


              <div className="campo-formulario">

                <label>
                  Fecha del servicio
                </label>

                <input
                  type="date"
                  name="fecha_servicio"
                  value={
                    formulario.fecha_servicio
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Origen del reproductor
                </label>

                <select
                  value={origenReproductor}
                  onChange={(e) => {

                    const origen =
                      e.target.value;

                    setOrigenReproductor(
                      origen
                    );

                    setFormulario(
                      (anterior) => ({
                        ...anterior,
                        reproductor_id: "",
                        reproductor_externo: "",
                      })
                    );

                  }}
                >

                  <option value="externo">
                    Reproductor externo
                  </option>

                  <option value="registrado">
                    Registrado en GANATEC
                  </option>

                </select>

              </div>


              {origenReproductor === "registrado" ? (

                <div className="campo-formulario">

                  <label>
                    Reproductor *
                  </label>

                  <select
                    name="reproductor_id"
                    value={
                      formulario.reproductor_id
                    }
                    onChange={manejarCambio}
                    required
                  >

                    <option value="">
                      Seleccionar macho
                    </option>

                    {reproductores.map(
                      (animal) => (

                        <option
                          key={animal.id}
                          value={animal.id}
                        >

                          {
                            animal.nombre
                            ||
                            "Sin nombre"
                          }

                          {" - "}

                          {animal.identificacion}

                        </option>

                      )
                    )}

                  </select>

                </div>

              ) : (

                <div className="campo-formulario">

                  <label>
                    Reproductor externo *
                  </label>

                  <input
                    type="text"
                    name="reproductor_externo"
                    value={
                      formulario
                        .reproductor_externo
                    }
                    onChange={manejarCambio}
                    placeholder="Nombre o identificación"
                    required
                  />

                </div>

              )}


              <div className="campo-formulario">

                <label>
                  Código de semen
                </label>

                <input
                  type="text"
                  name="codigo_semen"
                  value={
                    formulario.codigo_semen
                  }
                  onChange={manejarCambio}
                />

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
                    animalId
                      ? `/reproduccion/animal/${animalId}`
                      : "/reproduccion"
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
                    : "Guardar servicio"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default ReproduccionServicioNuevo;
