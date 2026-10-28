import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  editarProduccionDiaria,
  obtenerProduccionesDiarias,
} from "../services/produccionLeche.service";


const ProduccionDiariaEditar = () => {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    produccionId
  } = useParams();


  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    guardando,
    setGuardando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  const [
    formulario,
    setFormulario
  ] = useState({

    fecha_produccion: "",

    vacas_ordenadas: "",

    litros_totales: "",

    numero_ordenios: "",

    observacion: "",

  });


  /* =========================================================
     CARGAR REGISTRO
  ========================================================= */

  useEffect(() => {

    const cargarProduccion =
      async () => {

        try {

          setCargando(true);
          setError("");


          let produccion =
            location.state?.produccion
            || null;


          if (!produccion) {

            const respuesta =
              await obtenerProduccionesDiarias();


            const producciones =
              Array.isArray(
                respuesta?.producciones
              )
                ? respuesta.producciones
                : [];


            produccion =
              producciones.find(
                (item) =>
                  Number(item.id)
                  ===
                  Number(produccionId)
              )
              || null;

          }


          if (!produccion) {

            setError(
              "No fue posible encontrar el registro de producción."
            );

            return;

          }


          const fecha =
            produccion.fecha_produccion
              ? String(
                  produccion.fecha_produccion
                ).slice(0, 10)
              : "";


          setFormulario({

            fecha_produccion:
              fecha,

            vacas_ordenadas:
              produccion.vacas_ordenadas
              ?? "",

            litros_totales:
              produccion.litros_totales
              ?? "",

            numero_ordenios:
              produccion.numero_ordenios
              ?? "",

            observacion:
              produccion.observacion
              || "",

          });


        } catch (error) {

          console.error(
            "Error cargando producción total:",
            error
          );


          setError(
            error.response?.data?.message
            ||
            "No fue posible cargar el registro."
          );


        } finally {

          setCargando(false);

        }

      };


    cargarProduccion();

  }, [
    produccionId,
    location.state
  ]);


  /* =========================================================
     CAMBIOS DEL FORMULARIO
  ========================================================= */

  const manejarCambio =
    (e) => {

      const {
        name,
        value
      } = e.target;


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

  const manejarGuardar =
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
        !formulario.fecha_produccion
      ) {

        setError(
          "Selecciona la fecha de producción."
        );

        return;

      }


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
          "Los litros totales deben ser mayores que cero."
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


        await editarProduccionDiaria(
          produccionId,
          {

            fecha_produccion:
              formulario.fecha_produccion,

            vacas_ordenadas:
              vacas,

            litros_totales:
              litros,

            numero_ordenios:
              ordenios,

            observacion:
              formulario
                .observacion
                .trim(),

          }
        );


        navigate(
          "/leche"
        );


      } catch (error) {

        console.error(
          "Error editando producción total:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible actualizar la producción total."
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
              navigate("/leche")
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <p className="dashboard-label">
            Producción de leche
          </p>

          <h1>
            Editar producción total
          </h1>

          <p>
            Corrige los datos del registro general
            de producción de la finca.
          </p>

        </div>

      </div>


      {cargando ? (

        <div className="dashboard-loading">
          Cargando producción...
        </div>

      ) : error &&
        !formulario.fecha_produccion ? (

        <div className="dashboard-error">
          {error}
        </div>

      ) : (

        <div className="dashboard-panel">

          <form
            className="formulario-reproduccion"
            onSubmit={
              manejarGuardar
            }
          >

            <div className="form-grid">


              <div className="campo-formulario">

                <label>
                  Fecha *
                </label>

                <input
                  type="date"
                  name="fecha_produccion"
                  value={
                    formulario.fecha_produccion
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Vacas ordeñadas *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  name="vacas_ordenadas"
                  value={
                    formulario.vacas_ordenadas
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Litros totales *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="litros_totales"
                  value={
                    formulario.litros_totales
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Número de ordeños *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  name="numero_ordenios"
                  value={
                    formulario.numero_ordenios
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                />

              </div>


              <div
                className="
                  campo-formulario
                  campo-completo
                "
              >

                <label>
                  Observación
                </label>

                <textarea
                  rows="4"
                  name="observacion"
                  value={
                    formulario.observacion
                  }
                  onChange={
                    manejarCambio
                  }
                  placeholder="Observación opcional"
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
                  navigate("/leche")
                }
                disabled={
                  guardando
                }
              >
                Cancelar
              </button>


              <button
                type="submit"
                className="boton-principal"
                disabled={
                  guardando
                }
              >

                <Save size={17} />

                {
                  guardando
                    ? "Guardando..."
                    : "Guardar cambios"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default ProduccionDiariaEditar;