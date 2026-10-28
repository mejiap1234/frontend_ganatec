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
  obtenerProduccionLeche,
  corregirRegistroLeche,
} from "../services/leche.service";


const LecheCorreccion = () => {

  const {
    animalId,
    registroId,
  } = useParams();

  const navigate =
    useNavigate();


  const [registro, setRegistro] =
    useState(null);

  const [formulario, setFormulario] =
    useState({
      litros: "",
      turno: "",
      fecha_ordenio: "",
      observacion: "",
      motivo_correccion: "",
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR REGISTRO ORIGINAL
  ========================================================= */

  useEffect(() => {

    const cargarRegistro = async () => {

      try {

        setCargando(true);


        const respuesta =
          await obtenerProduccionLeche(
            animalId
          );


        const lista =
          Array.isArray(
            respuesta?.registros
          )
            ? respuesta.registros
            : [];


        const encontrado =
          lista.find(
            (item) =>
              String(item.id) ===
              String(registroId)
          );


        if (!encontrado) {

          setError(
            "Registro de ordeño no encontrado."
          );

          return;

        }


        setRegistro(
          encontrado
        );


        setFormulario({
          litros:
            encontrado.litros ?? "",
          turno:
            encontrado.turno ?? "",
          fecha_ordenio:
            encontrado.fecha_ordenio
              ? String(
                  encontrado.fecha_ordenio
                )
                  .slice(0, 10)
              : "",
          observacion:
            encontrado.observacion ?? "",
          motivo_correccion: "",
        });


      } catch (error) {

        console.error(
          "Error cargando ordeño:",
          error
        );


        setError(
          error.response?.data?.message ||
          "No fue posible cargar el registro."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarRegistro();

  }, [
    animalId,
    registroId,
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
     GUARDAR CORRECCIÓN
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (
      !formulario
        .motivo_correccion
        .trim()
    ) {

      setError(
        "El motivo de la corrección es obligatorio."
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


    try {

      setGuardando(true);


      const datos = {

        litros:
          Number(
            formulario.litros
          ),

        turno:
          formulario.turno,

        fecha_ordenio:
          formulario.fecha_ordenio,

        observacion:
          formulario.observacion.trim(),

        motivo_correccion:
          formulario
            .motivo_correccion
            .trim(),

      };


      await corregirRegistroLeche(
        animalId,
        registroId,
        datos
      );


      navigate(
        `/leche/animal/${animalId}`,
        {
          state: {
            vista: "ordenios",
          },
        }
      );


    } catch (error) {

      console.error(
        "Error corrigiendo ordeño:",
        error
      );


      setError(
        error.response?.data?.message ||
        "No fue posible corregir el registro."
      );


    } finally {

      setGuardando(false);

    }

  };


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando registro...
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
                    vista: "ordenios",
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
            Corregir ordeño
          </h1>

          <p>
            Toda corrección requiere un motivo
            y queda registrada en el historial.
          </p>

        </div>

      </div>


      {!registro ? (

        <div className="dashboard-error">
          {error || "Registro no encontrado."}
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
                  Fecha *
                </label>

                <input
                  type="date"
                  name="fecha_ordenio"
                  value={
                    formulario.fecha_ordenio
                  }
                  onChange={manejarCambio}
                  required
                />

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Observación
                </label>

                <textarea
                  rows="2"
                  name="observacion"
                  value={
                    formulario.observacion
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Motivo de la corrección *
                </label>

                <textarea
                  rows="3"
                  name="motivo_correccion"
                  value={
                    formulario.motivo_correccion
                  }
                  onChange={manejarCambio}
                  placeholder="Explica por qué debe modificarse este registro..."
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
                    `/leche/animal/${animalId}`,
                    {
                      state: {
                        vista: "ordenios",
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
                    ? "Guardando..."
                    : "Guardar corrección"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default LecheCorreccion;
