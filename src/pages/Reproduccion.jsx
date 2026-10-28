import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Dna,
  Search,
  CalendarDays,
  Activity,
  Plus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  obtenerAnimales,
} from "../services/animales.service";

import {
  obtenerServiciosReproductivos,
  obtenerGestaciones,
  obtenerPartos,
} from "../services/reproduccion.service";


const Reproduccion = () => {

  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [registros, setRegistros] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");


  /* =========================================================
     CARGAR REPRODUCCIÓN GENERAL
  ========================================================= */

  const cargarReproduccionGeneral = async () => {

    try {

      setCargando(true);
      setError("");

      const respuestaAnimales =
        await obtenerAnimales();

      const listaAnimales =
        Array.isArray(respuestaAnimales)
          ? respuestaAnimales
          : Array.isArray(respuestaAnimales?.animales)
            ? respuestaAnimales.animales
            : Array.isArray(respuestaAnimales?.data?.animales)
              ? respuestaAnimales.data.animales
              : Array.isArray(respuestaAnimales?.data)
                ? respuestaAnimales.data
                : [];


      /*
        Reproducción se gestiona sobre hembras activas.
        Consultamos en paralelo los datos reproductivos
        de cada una.
      */
      const hembrasActivas =
        listaAnimales.filter(
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

          hembrasActivas.map(
            async (animal) => {

              try {

                const [
                  respuestaServicios,
                  respuestaGestaciones,
                  respuestaPartos,
                ] = await Promise.all([

                  obtenerServiciosReproductivos(
                    animal.id
                  ),

                  obtenerGestaciones(
                    animal.id
                  ),

                  obtenerPartos(
                    animal.id
                  ),

                ]);


                const servicios =
                  Array.isArray(
                    respuestaServicios?.servicios
                  )
                    ? respuestaServicios.servicios
                    : Array.isArray(
                        respuestaServicios
                      )
                      ? respuestaServicios
                      : [];


                const gestaciones =
                  Array.isArray(
                    respuestaGestaciones?.gestaciones
                  )
                    ? respuestaGestaciones.gestaciones
                    : Array.isArray(
                        respuestaGestaciones
                      )
                      ? respuestaGestaciones
                      : [];


                const partos =
                  Array.isArray(
                    respuestaPartos?.partos
                  )
                    ? respuestaPartos.partos
                    : Array.isArray(
                        respuestaPartos
                      )
                      ? respuestaPartos
                      : [];


                const gestacionActiva =
                  gestaciones.find(
                    (gestacion) =>
                      gestacion.estado === "activa"
                  ) || null;


                return {

                  animal,

                  servicios,

                  gestaciones,

                  partos,

                  ultimoServicio:
                    servicios[0] || null,

                  gestacionActiva,

                };

              } catch (error) {

                console.error(
                  `Error cargando reproducción del animal ${animal.id}:`,
                  error
                );

                return {

                  animal,

                  servicios: [],

                  gestaciones: [],

                  partos: [],

                  ultimoServicio: null,

                  gestacionActiva: null,

                };

              }

            }
          )

        );


      setRegistros(
        resultados
      );


    } catch (error) {

      console.error(
        "Error cargando reproducción general:",
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

    cargarReproduccionGeneral();

  }, []);


  /* =========================================================
     INDICADORES
  ========================================================= */

  const totalHembras =
    registros.length;


  const totalServicios =
    registros.reduce(
      (total, registro) =>
        total + registro.servicios.length,
      0
    );


  const gestacionesActivas =
    registros.filter(
      (registro) =>
        registro.gestacionActiva
    ).length;


  const partosProximos =
    registros.filter(
      (registro) => {

        const fecha =
          registro
            .gestacionActiva
            ?.fecha_probable_parto;

        if (!fecha) {
          return false;
        }


        const hoy =
          new Date();

        hoy.setHours(
          0,
          0,
          0,
          0
        );


        const fechaParto =
          new Date(fecha);

        const diferencia =
          Math.ceil(
            (
              fechaParto.getTime()
              -
              hoy.getTime()
            )
            /
            (1000 * 60 * 60 * 24)
          );


        return (
          diferencia >= 0
          &&
          diferencia <= 30
        );

      }
    ).length;


  /* =========================================================
     FILTRO
  ========================================================= */

  const registrosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      if (!texto) {
        return registros;
      }


      return registros.filter(
        (registro) => {

          const contenido =
            [
              registro.animal.nombre,
              registro.animal.identificacion,
              registro.animal.raza,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return contenido.includes(
            texto
          );

        }
      );

    }, [
      registros,
      busqueda,
    ]);


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <p className="dashboard-label">
            Gestión reproductiva
          </p>

          <h1>
            Reproducción
          </h1>

          <p>
            Seguimiento general de servicios,
            gestaciones y partos de la finca.
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            navigate(
              "/reproduccion/servicio/nuevo"
            )
          }
        >

          <Plus size={17} />

          Registrar servicio

        </button>

      </div>


      {cargando ? (

        <div className="dashboard-loading">
          Cargando reproducción...
        </div>

      ) : error ? (

        <div className="dashboard-error">
          {error}
        </div>

      ) : (

        <>

          {/* =================================================
              RESUMEN GENERAL
          ================================================= */}

          <div className="reproduccion-general-resumen">

            <div>

              <span>
                Hembras activas
              </span>

              <strong>
                {totalHembras}
              </strong>

              <small>
                En seguimiento
              </small>

            </div>


            <div>

              <span>
                Gestaciones activas
              </span>

              <strong>
                {gestacionesActivas}
              </strong>

              <small>
                Actualmente
              </small>

            </div>


            <div>

              <span>
                Partos próximos
              </span>

              <strong>
                {partosProximos}
              </strong>

              <small>
                Próximos 30 días
              </small>

            </div>


            <div>

              <span>
                Servicios
              </span>

              <strong>
                {totalServicios}
              </strong>

              <small>
                Historial total
              </small>

            </div>

          </div>


          {/* =================================================
              BUSCADOR
          ================================================= */}

          <div className="reproduccion-general-filtros">

            <div className="buscador-reproduccion-general">

              <Search size={17} />

              <input
                type="text"
                placeholder="Buscar hembra..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* =================================================
              TABLA GENERAL
          ================================================= */}

          <div className="dashboard-panel">

            <div className="lista-header">

              <div>

                <h3>
                  Estado reproductivo
                </h3>

                <span>
                  {registrosFiltrados.length} animales
                </span>

              </div>

            </div>


            {registrosFiltrados.length === 0 ? (

              <p className="texto-secundario">
                No se encontraron hembras activas.
              </p>

            ) : (

              <div className="tabla-contenedor">

                <table className="tabla-ganatec">

                  <thead>

                    <tr>

                      <th>
                        Animal
                      </th>

                      <th>
                        Último servicio
                      </th>

                      <th>
                        Gestación
                      </th>

                      <th>
                        Parto estimado
                      </th>

                      <th>
                        Partos
                      </th>

                      <th>
                        Acciones
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {registrosFiltrados.map(
                      (registro) => (

                        <tr
                          key={registro.animal.id}
                        >

                          <td>

                            <strong>
                              {
                                registro.animal.nombre
                                ||
                                "Sin nombre"
                              }
                            </strong>

                            <div className="descripcion-tabla">
                              {
                                registro.animal.identificacion
                              }
                            </div>

                          </td>


                          <td>

                            {registro.ultimoServicio ? (

                              <>

                                <strong>
                                  {
                                    registro.ultimoServicio
                                      .tipo_servicio ===
                                    "inseminacion_artificial"
                                      ? "Inseminación artificial"
                                      : registro.ultimoServicio
                                          .tipo_servicio ===
                                          "monta_natural"
                                        ? "Monta natural"
                                        : registro.ultimoServicio
                                            .tipo_servicio
                                  }
                                </strong>

                                <div className="descripcion-tabla">

                                  {
                                    registro.ultimoServicio
                                      .fecha_servicio
                                      ? new Date(
                                          registro.ultimoServicio
                                            .fecha_servicio
                                        )
                                          .toLocaleDateString(
                                            "es-CO",
                                            {
                                              timeZone: "UTC",
                                            }
                                          )
                                      : "-"
                                  }

                                </div>

                              </>

                            ) : (

                              <span className="texto-secundario">
                                Sin servicios
                              </span>

                            )}

                          </td>


                          <td>

                            {registro.gestacionActiva ? (

                              <span className="estado-gestacion activa">
                                Activa
                              </span>

                            ) : (

                              <span className="texto-secundario">
                                Sin gestación activa
                              </span>

                            )}

                          </td>


                          <td>

                            {
                              registro.gestacionActiva
                                ?.fecha_probable_parto
                                ? new Date(
                                    registro.gestacionActiva
                                      .fecha_probable_parto
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

                            {registro.partos.length}

                          </td>


                          <td>

                            <div className="acciones-tabla">

                              <button
                                type="button"
                                className="boton-tabla"
                                onClick={() =>
                                  navigate(
                                    `/reproduccion/animal/${registro.animal.id}`
                                  )
                                }
                              >

                                <Dna size={14} />

                                Gestionar

                              </button>


                              <button
                                type="button"
                                className="boton-tabla"
                                onClick={() =>
                                  navigate(
                                    `/animales/${registro.animal.id}`
                                  )
                                }
                              >
                                Ver animal
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </DashboardLayout>

  );

};


export default Reproduccion;
