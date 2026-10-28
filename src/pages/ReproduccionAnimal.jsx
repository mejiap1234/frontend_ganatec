import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Dna,
  Plus,
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
  obtenerGestaciones,
  obtenerPartos,
} from "../services/reproduccion.service";


const ReproduccionAnimal = () => {

  const { animalId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [animal, setAnimal] =
    useState(null);

  const [
    servicios,
    setServicios,
  ] = useState([]);

  const [
    gestaciones,
    setGestaciones,
  ] = useState([]);

  const [partos, setPartos] =
    useState([]);

  const [vista, setVista] =
    useState("resumen");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR INFORMACIÓN
  ========================================================= */

  const cargarInformacion = async () => {

    try {

      setCargando(true);
      setError("");


      const [
        respuestaAnimal,
        respuestaServicios,
        respuestaGestaciones,
        respuestaPartos,
      ] = await Promise.all([

        obtenerAnimalPorId(
          animalId
        ),

        obtenerServiciosReproductivos(
          animalId
        ),

        obtenerGestaciones(
          animalId
        ),

        obtenerPartos(
          animalId
        ),

      ]);


      setAnimal(
        respuestaAnimal?.animal
        ||
        respuestaAnimal
      );


      setServicios(
        Array.isArray(
          respuestaServicios?.servicios
        )
          ? respuestaServicios.servicios
          : Array.isArray(
              respuestaServicios
            )
            ? respuestaServicios
            : []
      );


      setGestaciones(
        Array.isArray(
          respuestaGestaciones?.gestaciones
        )
          ? respuestaGestaciones.gestaciones
          : Array.isArray(
              respuestaGestaciones
            )
            ? respuestaGestaciones
            : []
      );


      setPartos(
        Array.isArray(
          respuestaPartos?.partos
        )
          ? respuestaPartos.partos
          : Array.isArray(
              respuestaPartos
            )
            ? respuestaPartos
            : []
      );


    } catch (error) {

      console.error(
        "Error cargando reproducción del animal:",
        error
      );

      setError(
        error.response?.data?.message ||
        "No fue posible cargar la información reproductiva."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarInformacion();

  }, [animalId]);


  const gestacionActiva =
    gestaciones.find(
      (gestacion) =>
        gestacion.estado === "activa"
    ) || null;


  const ultimoServicio =
    servicios[0] || null;


  const ultimoParto =
    partos[0] || null;


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando reproducción...
        </div>

      </DashboardLayout>

    );

  }


  if (error || !animal) {

    return (

      <DashboardLayout>

        <div className="dashboard-error">
          {error || "Animal no encontrado."}
        </div>

      </DashboardLayout>

    );

  }


  return (

    <DashboardLayout>

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/reproduccion"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver a Reproducción

          </button>


          <p className="dashboard-label">
            Gestión reproductiva
          </p>

          <h1>
            {
              animal.nombre
              ||
              animal.identificacion
            }
          </h1>

          <p>
            {animal.identificacion}
            {" · "}
            {animal.raza || "Raza no registrada"}
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            navigate(
              `/reproduccion/animal/${animalId}/servicio/nuevo`
            )
          }
        >

          <Plus size={17} />

          Nuevo servicio

        </button>

      </div>


      {/* =====================================================
          NAVEGACIÓN
      ===================================================== */}

      <div className="reproduccion-navegacion">

        <button
          type="button"
          className={
            vista === "resumen"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("resumen")
          }
        >
          Resumen
        </button>


        <button
          type="button"
          className={
            vista === "servicios"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("servicios")
          }
        >
          Servicios
        </button>


        <button
          type="button"
          className={
            vista === "gestaciones"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("gestaciones")
          }
        >
          Gestaciones
        </button>


        <button
          type="button"
          className={
            vista === "partos"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("partos")
          }
        >
          Partos
        </button>

      </div>


      {/* =====================================================
          RESUMEN
      ===================================================== */}

      {vista === "resumen" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Resumen reproductivo
              </h3>

              <span>
                Estado actual del animal
              </span>

            </div>

          </div>


          <div className="reproduccion-resumen">

            <div>

              <span>
                Servicios
              </span>

              <strong>
                {servicios.length}
              </strong>

              <small>
                Registrados
              </small>

            </div>


            <div>

              <span>
                Gestaciones
              </span>

              <strong>
                {gestaciones.length}
              </strong>

              <small>
                Históricas
              </small>

            </div>


            <div>

              <span>
                Gestación activa
              </span>

              <strong>
                {
                  gestacionActiva
                    ? "Sí"
                    : "No"
                }
              </strong>

              <small>
                Estado actual
              </small>

            </div>


            <div>

              <span>
                Partos
              </span>

              <strong>
                {partos.length}
              </strong>

              <small>
                Registrados
              </small>

            </div>

          </div>


          <div className="seccion-reproduccion">

            <h4>
              Estado actual
            </h4>


            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <tbody>

                  <tr>

                    <th>
                      Último servicio
                    </th>

                    <td>

                      {ultimoServicio ? (

                        <>

                          {
                            ultimoServicio.tipo_servicio ===
                            "inseminacion_artificial"
                              ? "Inseminación artificial"
                              : ultimoServicio.tipo_servicio ===
                                  "monta_natural"
                                ? "Monta natural"
                                : ultimoServicio.tipo_servicio
                          }

                          {" · "}

                          {
                            ultimoServicio.fecha_servicio
                              ? new Date(
                                  ultimoServicio.fecha_servicio
                                )
                                  .toLocaleDateString(
                                    "es-CO",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )
                              : "-"
                          }

                        </>

                      ) : (

                        "Sin servicios registrados"

                      )}

                    </td>

                  </tr>


                  <tr>

                    <th>
                      Parto estimado
                    </th>

                    <td>

                      {
                        gestacionActiva
                          ?.fecha_probable_parto
                          ? new Date(
                              gestacionActiva
                                .fecha_probable_parto
                            )
                              .toLocaleDateString(
                                "es-CO",
                                {
                                  timeZone: "UTC",
                                }
                              )
                          : "Sin gestación activa"
                      }

                    </td>

                  </tr>


                  <tr>

                    <th>
                      Último parto
                    </th>

                    <td>

                      {
                        ultimoParto
                          ?.fecha_parto
                          ? new Date(
                              ultimoParto.fecha_parto
                            )
                              .toLocaleDateString(
                                "es-CO",
                                {
                                  timeZone: "UTC",
                                }
                              )
                          : "Sin partos registrados"
                      }

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          SERVICIOS
      ===================================================== */}

      {vista === "servicios" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Servicios reproductivos
              </h3>

              <span>
                {servicios.length} registros
              </span>

            </div>


            <button
              type="button"
              className="boton-principal"
              onClick={() =>
                navigate(
                  `/reproduccion/animal/${animalId}/servicio/nuevo`
                )
              }
            >

              <Plus size={16} />

              Nuevo servicio

            </button>

          </div>


          {servicios.length === 0 ? (

            <p className="texto-secundario">
              No hay servicios reproductivos registrados.
            </p>

          ) : (

            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <thead>

                  <tr>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Reproductor
                    </th>

                    <th>
                      Responsable
                    </th>

                    <th>
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {servicios.map(
                    (servicio) => (

                      <tr key={servicio.id}>

                        <td>

                          {
                            servicio.fecha_servicio
                              ? new Date(
                                  servicio.fecha_servicio
                                )
                                  .toLocaleDateString(
                                    "es-CO",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )
                              : "-"
                          }

                        </td>


                        <td>

                          {
                            servicio.tipo_servicio ===
                            "inseminacion_artificial"
                              ? "Inseminación artificial"
                              : servicio.tipo_servicio ===
                                  "monta_natural"
                                ? "Monta natural"
                                : servicio.tipo_servicio
                          }

                        </td>


                        <td>

                          {
                            servicio.reproductor_nombre
                            ||
                            servicio.reproductor_externo
                            ||
                            "-"
                          }

                        </td>


                        <td>
                          {servicio.responsable || "-"}
                        </td>


                        <td>

                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/reproduccion/animal/${animalId}/servicio/${servicio.id}/diagnostico`
                              )
                            }
                          >
                            Registrar diagnóstico
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          GESTACIONES
      ===================================================== */}

      {vista === "gestaciones" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Gestaciones
              </h3>

              <span>
                {gestaciones.length} registros
              </span>

            </div>

          </div>


          {gestaciones.length === 0 ? (

            <p className="texto-secundario">
              No hay gestaciones registradas.
            </p>

          ) : (

            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <thead>

                  <tr>

                    <th>
                      Inicio
                    </th>

                    <th>
                      Parto estimado
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Resultado
                    </th>

                    <th>
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {gestaciones.map(
                    (gestacion) => (

                      <tr key={gestacion.id}>

                        <td>

                          {
                            (
                              gestacion.fecha_inicio_estimada
                              ||
                              gestacion.fecha_inicio
                            )
                              ? new Date(
                                  gestacion.fecha_inicio_estimada
                                  ||
                                  gestacion.fecha_inicio
                                )
                                  .toLocaleDateString(
                                    "es-CO",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )
                              : "-"
                          }

                        </td>


                        <td>

                          {
                            gestacion.fecha_probable_parto
                              ? new Date(
                                  gestacion.fecha_probable_parto
                                )
                                  .toLocaleDateString(
                                    "es-CO",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )
                              : "-"
                          }

                        </td>


                        <td>

                          <span
                            className={
                              `estado-gestacion ${
                                gestacion.estado || ""
                              }`
                            }
                          >
                            {gestacion.estado}
                          </span>

                        </td>


                        <td>
                          {
                            gestacion.resultado_final
                            ||
                            "-"
                          }
                        </td>


                        <td>

                          {gestacion.estado === "activa" ? (

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(
                                  `/reproduccion/animal/${animalId}/gestacion/${gestacion.id}/parto`
                                )
                              }
                            >
                              Registrar parto
                            </button>

                          ) : (

                            <span className="texto-secundario">
                              Finalizada
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          PARTOS
      ===================================================== */}

      {vista === "partos" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Historial de partos
              </h3>

              <span>
                {partos.length} registros
              </span>

            </div>

          </div>


          {partos.length === 0 ? (

            <p className="texto-secundario">
              No hay partos registrados.
            </p>

          ) : (

            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <thead>

                  <tr>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Crías
                    </th>

                    <th>
                      Lactancia
                    </th>

                    <th>
                      Observación
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {partos.map(
                    (parto) => (

                      <tr key={parto.id}>

                        <td>

                          {
                            parto.fecha_parto
                              ? new Date(
                                  parto.fecha_parto
                                )
                                  .toLocaleDateString(
                                    "es-CO",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )
                              : "-"
                          }

                        </td>


                        <td>
                          {parto.tipo_parto || "-"}
                        </td>


                        <td>

                          {
                            Array.isArray(
                              parto.crias
                            )
                              ? parto.crias.length
                              : 0
                          }

                        </td>


                        <td>

                          {
                            parto.lactancia_estado
                            ||
                            "Sin lactancia"
                          }

                        </td>


                        <td>

                          {
                            parto.complicaciones
                            ||
                            parto.observacion
                            ||
                            "-"
                          }

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </DashboardLayout>

  );

};


export default ReproduccionAnimal;
