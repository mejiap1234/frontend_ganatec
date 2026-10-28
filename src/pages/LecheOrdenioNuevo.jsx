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
  obtenerLactancias,
  registrarOrdenio,
} from "../services/leche.service";


const LecheOrdenioNuevo = () => {

  const { animalId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    animalesLactando,
    setAnimalesLactando,
  ] = useState([]);

  const [
    animalSeleccionado,
    setAnimalSeleccionado,
  ] = useState(
    animalId || ""
  );

  const [formulario, setFormulario] =
    useState({
      litros: "",
      turno: "",
      fecha_ordenio: "",
      observacion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR VACAS EN LACTANCIA
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


        const hembras =
          lista.filter(
            (animal) => {

              const sexo =
                String(
                  animal.sexo || ""
                )
                  .trim()
                  .toLowerCase();

              const estado =
                String(
                  animal.estado || ""
                )
                  .trim()
                  .toLowerCase();


              return (
                sexo === "hembra"
                &&
                estado === "activo"
              );

            }
          );


        const resultados =
          await Promise.all(

            hembras.map(
              async (animal) => {

                try {

                  const respuestaLactancias =
                    await obtenerLactancias(
                      animal.id
                    );


                  const lactancias =
                    Array.isArray(
                      respuestaLactancias?.lactancias
                    )
                      ? respuestaLactancias.lactancias
                      : Array.isArray(
                          respuestaLactancias
                        )
                        ? respuestaLactancias
                        : [];


                  const activa =
                    lactancias.some(
                      (lactancia) =>
                        String(
                          lactancia.estado || ""
                        )
                          .trim()
                          .toLowerCase()
                        === "activa"
                    );


                  return activa
                    ? animal
                    : null;


                } catch {

                  return null;

                }

              }
            )

          );


        setAnimalesLactando(
          resultados.filter(Boolean)
        );


      } catch (error) {

        console.error(
          "Error cargando animales en lactancia:",
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
     REGISTRAR ORDEÑO
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!animalSeleccionado) {

      setError(
        "Selecciona el animal."
      );

      return;

    }


    if (
      !formulario.litros
      ||
      Number(formulario.litros) <= 0
    ) {

      setError(
        "La cantidad de litros debe ser mayor que cero."
      );

      return;

    }


    if (!formulario.turno) {

      setError(
        "Selecciona el turno."
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        litros:
          Number(
            formulario.litros
          ),

        turno:
          formulario.turno,

        ...(formulario.fecha_ordenio && {
          fecha_ordenio:
            formulario.fecha_ordenio,
        }),

        ...(formulario.observacion.trim() && {
          observacion:
            formulario
              .observacion
              .trim(),
        }),

      };


      await registrarOrdenio(
        animalSeleccionado,
        datos
      );


      navigate(
        `/leche/animal/${animalSeleccionado}`,
        {
          state: {
            vista: "ordenios",
          },
        }
      );


    } catch (error) {

      console.error(
        "Error registrando ordeño:",
        error
      );


      setError(
        error.response?.data?.message ||
        "No fue posible registrar el ordeño."
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
                  ? `/leche/animal/${animalId}`
                  : "/leche"
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
            Registrar ordeño
          </h1>

          <p>
            Registra la producción de una vaca
            con lactancia activa.
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
                  Animal *
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


                  {animalesLactando.map(
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
                  Litros *
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="litros"
                  value={
                    formulario.litros
                  }
                  onChange={manejarCambio}
                  required
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Turno *
                </label>

                <select
                  name="turno"
                  value={
                    formulario.turno
                  }
                  onChange={manejarCambio}
                  required
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="manana">
                    Mañana
                  </option>

                  <option value="tarde">
                    Tarde
                  </option>

                  <option value="noche">
                    Noche
                  </option>

                  <option value="otro">
                    Otro
                  </option>

                </select>

              </div>


              <div className="campo-formulario">

                <label>
                  Fecha
                </label>

                <input
                  type="date"
                  name="fecha_ordenio"
                  value={
                    formulario.fecha_ordenio
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
                      ? `/leche/animal/${animalId}`
                      : "/leche"
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
                    : "Guardar ordeño"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default LecheOrdenioNuevo;
