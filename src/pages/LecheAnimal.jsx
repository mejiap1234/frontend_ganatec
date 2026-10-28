import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Plus,
} from "lucide-react";

import {
  useLocation,
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
  obtenerProduccionLeche,
} from "../services/leche.service";


const LecheAnimal = () => {

  const { animalId } =
    useParams();

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [animal, setAnimal] =
    useState(null);

  const [lactancias, setLactancias] =
    useState([]);

  const [produccion, setProduccion] =
    useState(null);

  const [vista, setVista] =
    useState(
      location.state?.vista
      ||
      "resumen"
    );

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
        respuestaLactancias,
      ] = await Promise.all([

        obtenerAnimalPorId(
          animalId
        ),

        obtenerLactancias(
          animalId
        ),

      ]);


      const listaLactancias =
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


      setLactancias(
        listaLactancias
      );


      const activa =
        listaLactancias.find(
          (lactancia) =>
            String(
              lactancia.estado || ""
            )
              .trim()
              .toLowerCase()
            === "activa"
        );


      if (activa) {

        const respuestaProduccion =
          await obtenerProduccionLeche(
            animalId
          );


        setProduccion(
          respuestaProduccion
        );

      } else {

        setProduccion(null);

      }


    } catch (error) {

      console.error(
        "Error cargando producción del animal:",
        error
      );


      setError(
        error.response?.data?.message ||
        "No fue posible cargar la producción de leche."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarInformacion();

  }, [animalId]);


  const lactanciaActiva =
    lactancias.find(
      (lactancia) =>
        String(
          lactancia.estado || ""
        )
          .trim()
          .toLowerCase()
        === "activa"
    ) || null;


  const registros =
    Array.isArray(
      produccion?.registros
    )
      ? produccion.registros
      : [];


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando producción...
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
                "/leche"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver a Producción

          </button>


          <p className="dashboard-label">
            Producción de leche
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

            {
              animal.raza
              ||
              "Raza no registrada"
            }

          </p>

        </div>


        

      </div>


      {/* =====================================================
          NAVEGACIÓN
      ===================================================== */}

      <div className="leche-navegacion">

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
            vista === "ordenios"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("ordenios")
          }
        >
          Ordeños
        </button>


        <button
          type="button"
          className={
            vista === "lactancias"
              ? "boton-principal"
              : "boton-secundario"
          }
          onClick={() =>
            setVista("lactancias")
          }
        >
          Lactancias
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
                Resumen de producción
              </h3>

              <span>
                Estado actual del animal
              </span>

            </div>

          </div>


          {!lactanciaActiva ? (

            <p className="texto-secundario">
              Este animal no tiene una lactancia activa.
              Puedes consultar su historial en Lactancias.
            </p>

          ) : (

            <>

              <div className="leche-general-resumen">

                <div>

                  <span>
                    Hoy
                  </span>

                  <strong>

                    {
                      Number(
                        produccion
                          ?.resumen
                          ?.total_dia
                        || 0
                      )
                        .toFixed(2)
                    } L

                  </strong>

                  <small>
                    Producción diaria
                  </small>

                </div>


                <div>

                  <span>
                    Semana
                  </span>

                  <strong>

                    {
                      Number(
                        produccion
                          ?.resumen
                          ?.total_semana
                        || 0
                      )
                        .toFixed(2)
                    } L

                  </strong>

                  <small>
                    Semana actual
                  </small>

                </div>


                <div>

                  <span>
                    Mes
                  </span>

                  <strong>

                    {
                      Number(
                        produccion
                          ?.resumen
                          ?.total_mes
                        || 0
                      )
                        .toFixed(2)
                    } L

                  </strong>

                  <small>
                    Mes actual
                  </small>

                </div>


                <div>

                  <span>
                    Lactancia
                  </span>

                  <strong>

                    {
                      Number(
                        produccion
                          ?.resumen
                          ?.total_lactancia
                        || 0
                      )
                        .toFixed(2)
                    } L

                  </strong>

                  <small>
                    Acumulado
                  </small>

                </div>

              </div>


              <div className="seccion-reproduccion">

                <h4>
                  Estado de la lactancia
                </h4>


                <div className="tabla-contenedor">

                  <table className="tabla-ganatec">

                    <tbody>

                      <tr>

                        <th>
                          Inicio
                        </th>

                        <td>

                          {
                            lactanciaActiva.fecha_inicio
                              ? new Date(
                                  lactanciaActiva.fecha_inicio
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

                      </tr>


                      <tr>

                        <th>
                          Promedio diario
                        </th>

                        <td>

                          {
                            Number(
                              produccion
                                ?.resumen
                                ?.promedio_diario
                              || 0
                            )
                              .toFixed(2)
                          } L

                        </td>

                      </tr>


                      <tr>

                        <th>
                          Tendencia 7 días
                        </th>

                        <td>

                          {
                            produccion
                              ?.comparacion_7_dias
                              ?.tendencia
                            ||
                            "Sin comparación"
                          }

                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )}

        </div>

      )}


      {/* =====================================================
          ORDEÑOS
      ===================================================== */}

      {vista === "ordenios" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Ordeños
              </h3>

              <span>
                {registros.length} registros de la lactancia activa
              </span>

            </div>


            {lactanciaActiva && (

              <button
                type="button"
                className="boton-principal"
                onClick={() =>
                  navigate(
                    `/leche/animal/${animalId}/ordenio/nuevo`
                  )
                }
              >

                <Plus size={16} />

                Nuevo ordeño

              </button>

            )}

          </div>


          {!lactanciaActiva ? (

            <p className="texto-secundario">
              No hay una lactancia activa.
            </p>

          ) : registros.length === 0 ? (

            <p className="texto-secundario">
              Todavía no hay ordeños registrados en esta lactancia.
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
                      Turno
                    </th>

                    <th>
                      Litros
                    </th>

                    <th>
                      Observación
                    </th>

                    <th>
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {registros.map(
                    (registro) => (

                      <tr key={registro.id}>

                        <td>

                          {
                            registro.fecha_ordenio
                              ? new Date(
                                  registro.fecha_ordenio
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


                        <td className="texto-capitalizado">

                          {
                            registro.turno === "manana"
                              ? "Mañana"
                              : registro.turno
                          }

                        </td>


                        <td>

                          <strong>
                            {Number(registro.litros).toFixed(2)} L
                          </strong>

                        </td>


                        <td>
                          {registro.observacion || "-"}
                        </td>


                        <td>

                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/leche/animal/${animalId}/registro/${registro.id}/corregir`
                              )
                            }
                          >
                            Corregir
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
          LACTANCIAS
      ===================================================== */}

      {vista === "lactancias" && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Historial de lactancias
              </h3>

              <span>
                {lactancias.length} registros
              </span>

            </div>

          </div>


          {lactancias.length === 0 ? (

            <p className="texto-secundario">
              Este animal no tiene lactancias registradas.
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
                      Fin
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Litros
                    </th>

                    <th>
                      Promedio diario
                    </th>

                    <th>
                      Ordeños
                    </th>

                    <th>
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {lactancias.map(
                    (lactancia) => (

                      <tr key={lactancia.id}>

                        <td>

                          {
                            lactancia.fecha_inicio
                              ? new Date(
                                  lactancia.fecha_inicio
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
                            lactancia.fecha_fin
                              ? new Date(
                                  lactancia.fecha_fin
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
                              `estado-lactancia ${
                                lactancia.estado || ""
                              }`
                            }
                          >
                            {lactancia.estado}
                          </span>

                        </td>


                        <td>

                          {
                            Number(
                              lactancia.litros_totales
                              || 0
                            )
                              .toFixed(2)
                          } L

                        </td>


                        <td>

                          {
                            Number(
                              lactancia.promedio_diario
                              || 0
                            )
                              .toFixed(2)
                          } L

                        </td>


                        <td>
                          {
                            lactancia.total_ordenios
                            || 0
                          }
                        </td>


                        <td>

                          {String(
                            lactancia.estado || ""
                          )
                            .trim()
                            .toLowerCase()
                            === "activa" ? (

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(
                                  `/leche/animal/${animalId}/lactancia/${lactancia.id}/finalizar`
                                )
                              }
                            >
                              Finalizar lactancia
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

    </DashboardLayout>

  );

};


export default LecheAnimal;
