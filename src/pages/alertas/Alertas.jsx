import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Dna,
  HeartPulse,
  Package,
  RotateCcw,
  Scale,
  Search,
  Syringe,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerAlertas,
} from "../../services/alertas.service";


const Alertas = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     18.2.1 ESTADOS PRINCIPALES
  ========================================================= */

  const [
    alertas,
    setAlertas,
  ] = useState([]);


  const [
    resumen,
    setResumen,
  ] = useState({
    total: 0,
    criticas: 0,
    altas: 0,
  });


  const [
    filtros,
    setFiltros,
  ] = useState({
    estado: "pendiente",
    tipo: "",
    prioridad: "",
  });


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     18.2.2 FORMATEAR FECHA
  ========================================================= */

  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }


    return new Date(
      fecha
    ).toLocaleString(
      "es-CO",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );

  };


  /* =========================================================
     18.2.3 NOMBRE DEL TIPO DE ALERTA
  ========================================================= */

  const nombreTipo = (
    tipo
  ) => {

    const nombres = {

      inventario:
        "Inventario",

      vacunacion:
        "Vacunación",

      reproduccion:
        "Reproducción",

      salud:
        "Salud",

      pesaje:
        "Pesaje",

    };


    return (
      nombres[tipo]
      ||
      tipo
      ||
      "General"
    );

  };


  /* =========================================================
     18.2.4 ICONO SEGÚN EL TIPO
  ========================================================= */

  const obtenerIcono =
    (tipo) => {

      switch (tipo) {

        case "inventario":
          return Package;

        case "vacunacion":
          return Syringe;

        case "reproduccion":
          return Dna;

        case "salud":
          return HeartPulse;

        case "pesaje":
          return Scale;

        default:
          return Bell;

      }

    };


  /* =========================================================
     18.2.5 RUTA DE LA ENTIDAD RELACIONADA

     Las alertas pueden estar asociadas
     principalmente a:

     - un animal
     - un producto del inventario
  ========================================================= */

  const obtenerRutaRelacionada =
    (alerta) => {

      if (
        alerta.entidad_tipo ===
        "animal"
        &&
        alerta.entidad_id
      ) {

        return (
          `/animales/${alerta.entidad_id}`
        );

      }


      if (
        alerta.entidad_tipo ===
        "producto_inventario"
        &&
        alerta.entidad_id
      ) {

        return (
          `/inventario/${alerta.entidad_id}`
        );

      }


      return null;

    };


  /* =========================================================
     18.2.6 CONSULTAR ALERTAS
  ========================================================= */

  const cargarAlertas =
    async (
      filtrosActuales = filtros
    ) => {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await obtenerAlertas(
            filtrosActuales
          );


        const lista =
          Array.isArray(
            respuesta?.alertas
          )
            ? respuesta.alertas
            : [];


        setAlertas(
          lista
        );


        setResumen({

          total:
            Number(
              respuesta?.resumen?.total
              ||
              0
            ),

          criticas:
            Number(
              respuesta?.resumen?.criticas
              ||
              0
            ),

          altas:
            Number(
              respuesta?.resumen?.altas
              ||
              0
            ),

        });


      } catch (error) {

        console.error(
          "Error cargando alertas:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible consultar las alertas."
        );


      } finally {

        setCargando(false);

      }

    };


  /* =========================================================
     18.2.7 CARGA INICIAL
  ========================================================= */

  useEffect(() => {

    cargarAlertas({
      estado: "pendiente",
      tipo: "",
      prioridad: "",
    });

  }, []);


  /* =========================================================
     18.2.8 CAMBIAR FILTROS
  ========================================================= */

  const manejarCambio =
    (e) => {

      const {
        name,
        value,
      } = e.target;


      setFiltros(
        (anterior) => ({
          ...anterior,
          [name]: value,
        })
      );

    };


  /* =========================================================
     18.2.9 APLICAR FILTROS
  ========================================================= */

  const manejarBuscar =
    (e) => {

      e.preventDefault();


      cargarAlertas(
        filtros
      );

    };


  /* =========================================================
     18.2.10 LIMPIAR FILTROS
  ========================================================= */

  const limpiarFiltros = () => {

    const filtrosIniciales = {
      estado: "pendiente",
      tipo: "",
      prioridad: "",
    };


    setFiltros(
      filtrosIniciales
    );


    cargarAlertas(
      filtrosIniciales
    );

  };


  /* =========================================================
     18.2.11 CONTADORES ADICIONALES
  ========================================================= */

  const medias =
    alertas.filter(
      (alerta) =>
        alerta.prioridad ===
        "media"
    ).length;


  const bajas =
    alertas.filter(
      (alerta) =>
        alerta.prioridad ===
        "baja"
    ).length;


  /* =========================================================
     18.2.12 INTERFAZ
  ========================================================= */

  return (

    <>

      {/* ENCABEZADO */}

      <div className="modulo-subheader">

        <div>

          <p className="dashboard-label">
            Gestión preventiva
          </p>


          <h2>
            Alertas
          </h2>


          <p>
            Situaciones detectadas automáticamente
            que requieren seguimiento en la finca.
          </p>

        </div>

      </div>


      {/* RESUMEN */}

      <div className="alertas-resumen-grid">


        <div className="alerta-resumen-card">

          <div className="alerta-resumen-icono">

            <Bell size={22} />

          </div>


          <div>

            <span>
              Total
            </span>

            <strong>
              {resumen.total}
            </strong>

            <small>
              Alertas encontradas
            </small>

          </div>

        </div>


        <div className="alerta-resumen-card critica">

          <div className="alerta-resumen-icono">

            <AlertTriangle size={22} />

          </div>


          <div>

            <span>
              Críticas
            </span>

            <strong>
              {resumen.criticas}
            </strong>

            <small>
              Atención inmediata
            </small>

          </div>

        </div>


        <div className="alerta-resumen-card alta">

          <div className="alerta-resumen-icono">

            <AlertTriangle size={22} />

          </div>


          <div>

            <span>
              Altas
            </span>

            <strong>
              {resumen.altas}
            </strong>

            <small>
              Requieren atención
            </small>

          </div>

        </div>


        <div className="alerta-resumen-card media">

          <div className="alerta-resumen-icono">

            <Bell size={22} />

          </div>


          <div>

            <span>
              Medias
            </span>

            <strong>
              {medias}
            </strong>

            <small>
              Seguimiento preventivo
            </small>

          </div>

        </div>

      </div>


      {/* FILTROS */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h3>
              Filtrar alertas
            </h3>

            <p>
              Consulta las alertas según
              su estado, tipo o prioridad.
            </p>

          </div>

        </div>


        <form
          onSubmit={manejarBuscar}
        >

          <div className="form-grid">


            {/* ESTADO */}

            <div className="campo-formulario">

              <label>
                Estado
              </label>


              <select
                name="estado"
                value={
                  filtros.estado
                }
                onChange={manejarCambio}
              >

                <option value="pendiente">
                  Pendientes
                </option>

                <option value="resuelta">
                  Resueltas
                </option>

                <option value="">
                  Todas
                </option>

              </select>

            </div>


            {/* TIPO */}

            <div className="campo-formulario">

              <label>
                Tipo
              </label>


              <select
                name="tipo"
                value={
                  filtros.tipo
                }
                onChange={manejarCambio}
              >

                <option value="">
                  Todos
                </option>

                <option value="inventario">
                  Inventario
                </option>

                <option value="vacunacion">
                  Vacunación
                </option>

                <option value="reproduccion">
                  Reproducción
                </option>

                <option value="salud">
                  Salud
                </option>

                <option value="pesaje">
                  Pesaje
                </option>

              </select>

            </div>


            {/* PRIORIDAD */}

            <div className="campo-formulario">

              <label>
                Prioridad
              </label>


              <select
                name="prioridad"
                value={
                  filtros.prioridad
                }
                onChange={manejarCambio}
              >

                <option value="">
                  Todas
                </option>

                <option value="critica">
                  Crítica
                </option>

                <option value="alta">
                  Alta
                </option>

                <option value="media">
                  Media
                </option>

                <option value="baja">
                  Baja
                </option>

              </select>

            </div>

          </div>


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={limpiarFiltros}
            >

              <RotateCcw size={16} />

              Restablecer

            </button>


            <button
              type="submit"
              className="boton-principal"
            >

              <Search size={16} />

              Buscar

            </button>

          </div>

        </form>

      </div>


      {/* LISTADO */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h3>
              Alertas de la finca
            </h3>


            <p>

              {
                alertas.length
              }

              {" "}

              {
                alertas.length === 1
                  ? "alerta encontrada"
                  : "alertas encontradas"
              }

            </p>

          </div>

        </div>


        {error && (

          <div className="dashboard-error">

            {error}

          </div>

        )}


        {
          cargando
            ? (

              <div className="dashboard-loading">

                Cargando alertas...

              </div>

            )
            : alertas.length === 0
              ? (

                <div className="alertas-vacio">

                  <CheckCircle2
                    size={36}
                  />

                  <strong>
                    Sin alertas
                  </strong>

                  <p>
                    No existen alertas que coincidan
                    con los filtros seleccionados.
                  </p>

                </div>

              )
              : (

                <div className="alertas-modulo-lista">

                  {
                    alertas.map(
                      (alerta) => {

                        const Icono =
                          obtenerIcono(
                            alerta.tipo
                          );


                        const ruta =
                          obtenerRutaRelacionada(
                            alerta
                          );


                        return (

                          <div
                            key={
                              alerta.id
                            }
                            className={
                              `alerta-modulo-item ${
                                alerta.prioridad
                              } ${
                                alerta.estado ===
                                "resuelta"
                                  ? "resuelta"
                                  : ""
                              }`
                            }
                          >

                            {/* ICONO */}

                            <div className="alerta-modulo-icono">

                              <Icono size={21} />

                            </div>


                            {/* INFORMACIÓN */}

                            <div className="alerta-modulo-contenido">

                              <div className="alerta-modulo-superior">


                                <div>

                                  <div className="alerta-etiquetas">

                                    <span
                                      className={
                                        `alerta-prioridad ${
                                          alerta.prioridad
                                        }`
                                      }
                                    >

                                      {
                                        alerta.prioridad
                                      }

                                    </span>


                                    <span className="alerta-tipo">

                                      {
                                        nombreTipo(
                                          alerta.tipo
                                        )
                                      }

                                    </span>


                                    {
                                      alerta.estado ===
                                      "resuelta"
                                      && (

                                        <span className="alerta-estado-resuelta">

                                          Resuelta

                                        </span>

                                      )
                                    }

                                  </div>


                                  <h4>
                                    {
                                      alerta.titulo
                                    }
                                  </h4>

                                </div>


                                <small>

                                  {
                                    formatearFecha(
                                      alerta.fecha_detectada
                                    )
                                  }

                                </small>

                              </div>


                              <p>
                                {
                                  alerta.mensaje
                                }
                              </p>


                              <div className="alerta-modulo-footer">

                                {
                                  alerta.estado ===
                                  "resuelta"
                                  &&
                                  alerta.fecha_resuelta
                                  && (

                                    <span>

                                      Resuelta:
                                      {" "}

                                      {
                                        formatearFecha(
                                          alerta.fecha_resuelta
                                        )
                                      }

                                    </span>

                                  )
                                }


                                {
                                  ruta
                                  && (

                                    <button
                                      type="button"
                                      className="alerta-ver-relacionado"
                                      onClick={() =>
                                        navigate(
                                          ruta
                                        )
                                      }
                                    >

                                      Ver relacionado

                                      <ArrowRight
                                        size={15}
                                      />

                                    </button>

                                  )
                                }

                              </div>

                            </div>

                          </div>

                        );

                      }
                    )
                  }

                </div>

              )
        }

      </div>


      {/* INFORMACIÓN */}

      {
        bajas > 0
        && (

          <p className="texto-secundario">

            También se encontraron
            {" "}
            {bajas}
            {" "}
            alertas de prioridad baja.

          </p>

        )
      }

    </>

  );

};


export default Alertas;