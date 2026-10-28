import { useEffect, useMemo, useState } from "react";

import { Milk, Search, Plus, Pencil } from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import { obtenerAnimales } from "../services/animales.service";

import {
  obtenerLactancias,
  obtenerProduccionLeche,
} from "../services/leche.service";

import {
  obtenerResumenProduccionFinca,
  obtenerProduccionesDiarias,
} from "../services/produccionLeche.service";

const Leche = () => {
  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [registros, setRegistros] = useState([]);

  const [resumenGeneral, setResumenGeneral] = useState(null);

  const [produccionesDiarias, setProduccionesDiarias] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("todos");

  /* =========================================================
     CARGAR PRODUCCIÓN GENERAL
  ========================================================= */

  const cargarProduccionGeneral = async () => {
    try {
      setCargando(true);
      setError("");

      try {
        const respuestaResumen = await obtenerResumenProduccionFinca();

        setResumenGeneral(respuestaResumen?.resumen || null);
      } catch (errorResumen) {
        console.error("Error cargando resumen general de leche:", errorResumen);

        setResumenGeneral(null);
      }

      try {
        const respuestaProducciones = await obtenerProduccionesDiarias();

        setProduccionesDiarias(
          Array.isArray(respuestaProducciones?.producciones)
            ? respuestaProducciones.producciones
            : [],
        );
      } catch (errorProducciones) {
        console.error(
          "Error cargando historial de producción total:",
          errorProducciones,
        );

        setProduccionesDiarias([]);
      }

      const respuestaAnimales = await obtenerAnimales();

      const listaAnimales = Array.isArray(respuestaAnimales)
        ? respuestaAnimales
        : Array.isArray(respuestaAnimales?.animales)
          ? respuestaAnimales.animales
          : Array.isArray(respuestaAnimales?.data?.animales)
            ? respuestaAnimales.data.animales
            : Array.isArray(respuestaAnimales?.data)
              ? respuestaAnimales.data
              : [];

      /*
        Producción de leche corresponde a hembras activas.
        Primero consultamos sus lactancias y solo pedimos
        producción a las que tienen una lactancia activa.
      */
      const hembrasActivas = listaAnimales.filter((animal) => {
        const sexo = String(animal.sexo || "")
          .trim()
          .toLowerCase();

        const estado = String(animal.estado || "")
          .trim()
          .toLowerCase();

        return sexo === "hembra" && estado === "activo";
      });

      const resultados = await Promise.all(
        hembrasActivas.map(async (animal) => {
          try {
            const respuestaLactancias = await obtenerLactancias(animal.id);

            const lactancias = Array.isArray(respuestaLactancias?.lactancias)
              ? respuestaLactancias.lactancias
              : Array.isArray(respuestaLactancias)
                ? respuestaLactancias
                : [];

            const lactanciaActiva =
              lactancias.find(
                (lactancia) =>
                  String(lactancia.estado || "")
                    .trim()
                    .toLowerCase() === "activa",
              ) || null;

            let produccion = null;

            if (lactanciaActiva) {
              try {
                produccion = await obtenerProduccionLeche(animal.id);
              } catch (error) {
                console.error(
                  `Error cargando producción del animal ${animal.id}:`,
                  error,
                );
              }
            }

            return {
              animal,

              lactancias,

              lactanciaActiva,

              produccion,
            };
          } catch (error) {
            console.error(
              `Error cargando lactancias del animal ${animal.id}:`,
              error,
            );

            return {
              animal,

              lactancias: [],

              lactanciaActiva: null,

              produccion: null,
            };
          }
        }),
      );

      setRegistros(resultados);
    } catch (error) {
      console.error("Error cargando producción general:", error);

      setError(
        error.response?.data?.message ||
          "No fue posible cargar la producción de leche.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProduccionGeneral();
  }, []);

  /* =========================================================
     INDICADORES
  ========================================================= */

  const vacasLactando = registros.filter(
    (registro) => registro.lactanciaActiva,
  ).length;

  const produccionHoyDetallada = registros.reduce(
    (total, registro) =>
      total + Number(registro.produccion?.resumen?.total_dia || 0),
    0,
  );

  const produccionMesDetallada = registros.reduce(
    (total, registro) =>
      total + Number(registro.produccion?.resumen?.total_mes || 0),
    0,
  );

  const produccionHoy = resumenGeneral
    ? Number(resumenGeneral.total_dia || 0)
    : produccionHoyDetallada;

  const produccionMes = resumenGeneral
    ? Number(resumenGeneral.total_mes || 0)
    : produccionMesDetallada;

  const promedios = registros
    .filter((registro) => registro.lactanciaActiva)
    .map((registro) =>
      Number(registro.produccion?.resumen?.promedio_diario || 0),
    );

  const promedioPorVaca =
    promedios.length > 0
      ? promedios.reduce((total, valor) => total + valor, 0) / promedios.length
      : 0;

  /* =========================================================
     FILTRO
  ========================================================= */

  const registrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return registros.filter((registro) => {
      const coincideFiltro =
        filtro === "todos" ||
        (filtro === "lactando" && registro.lactanciaActiva) ||
        (filtro === "sin_lactancia" && !registro.lactanciaActiva);

      const contenido = [
        registro.animal.nombre,
        registro.animal.identificacion,
        registro.animal.raza,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return coincideFiltro && (!texto || contenido.includes(texto));
    });
  }, [registros, busqueda, filtro]);

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <DashboardLayout>
      <div className="pagina-header">
        <div>
          <p className="dashboard-label">Producción</p>

          <h1>Producción de leche</h1>

          <p>Seguimiento general de lactancias y ordeños de la finca.</p>
        </div>

        <div className="leche-acciones-header">
          <button
            type="button"
            className="boton-principal"
            onClick={() => navigate("/leche/produccion-diaria/nueva")}
          >
            <Milk size={17} />
            Registrar producción total
          </button>

          <button
            type="button"
            className="boton-principal"
            onClick={() => navigate("/leche/ordenio/nuevo")}
          >
            <Plus size={17} />
            Registrar ordeño
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="dashboard-loading">Cargando producción de leche...</div>
      ) : error ? (
        <div className="dashboard-error">{error}</div>
      ) : (
        <>
          {/* =================================================
              INDICADORES
          ================================================= */}

          <div className="leche-general-resumen">
            <div>
              <span>Producción hoy</span>

              <strong>{produccionHoy.toFixed(2)} L</strong>

              <small>Toda la finca</small>
            </div>

            <div>
              <span>Producción del mes</span>

              <strong>{produccionMes.toFixed(2)} L</strong>

              <small>Mes actual</small>
            </div>

            <div>
              <span>Vacas en lactancia</span>

              <strong>{vacasLactando}</strong>

              <small>Lactancias activas</small>
            </div>

            <div>
              <span>Promedio diario</span>

              <strong>{promedioPorVaca.toFixed(2)} L</strong>

              <small>Por vaca lactando</small>
            </div>
          </div>

          {/* =================================================
    HISTORIAL DE PRODUCCIÓN TOTAL
================================================= */}

          <div className="dashboard-panel">
            <div className="lista-header">
              <div>
                <h3>Historial de producción total</h3>

                <span>Registros rápidos de producción general de la finca</span>
              </div>
            </div>

            {produccionesDiarias.length === 0 ? (
              <p className="texto-secundario">
                Aún no hay producciones totales registradas.
              </p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla-ganatec">
                  <thead>
                    <tr>
                      <th>Fecha</th>

                      <th>Vacas ordeñadas</th>

                      <th>Producción</th>

                      <th>Ordeños</th>

                      <th>Observación</th>

                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produccionesDiarias.map((produccion) => (
                      <tr key={produccion.id}>
                        <td>
                          {String(produccion.fecha_produccion)
                            .slice(0, 10)
                            .split("-")
                            .reverse()
                            .join("/")}
                        </td>

                        <td>{produccion.vacas_ordenadas}</td>

                        <td>
                          <strong>
                            {Number(produccion.litros_totales || 0).toFixed(2)}{" "}
                            L
                          </strong>
                        </td>

                        <td>{produccion.numero_ordenios}</td>

                        <td>{produccion.observacion || "Sin observación"}</td>

                        <td>
                          <button
                            type="button"
                            className="boton-secundario"
                            onClick={() =>
                              navigate(
                                `/leche/produccion-diaria/${produccion.id}/editar`,
                                {
                                  state: {
                                    produccion,
                                  },
                                },
                              )
                            }
                          >
                            <Pencil size={15} />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* =================================================
              FILTROS
          ================================================= */}

          <div className="leche-general-filtros">
            <div className="buscador-leche-general">
              <Search size={17} />

              <input
                type="text"
                placeholder="Buscar animal..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>

              <option value="lactando">En lactancia</option>

              <option value="sin_lactancia">Sin lactancia activa</option>
            </select>
          </div>

          {/* =================================================
              TABLA GENERAL
          ================================================= */}

          <div className="dashboard-panel">
            <div className="lista-header">
              <div>
                <h3>Estado de producción</h3>

                <span>{registrosFiltrados.length} animales</span>
              </div>
            </div>

            {registrosFiltrados.length === 0 ? (
              <p className="texto-secundario">No se encontraron animales.</p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla-ganatec">
                  <thead>
                    <tr>
                      <th>Animal</th>

                      <th>Lactancia</th>

                      <th>Hoy</th>

                      <th>Mes</th>

                      <th>Promedio diario</th>

                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrosFiltrados.map((registro) => (
                      <tr key={registro.animal.id}>
                        <td>
                          <strong>
                            {registro.animal.nombre || "Sin nombre"}
                          </strong>

                          <div className="descripcion-tabla">
                            {registro.animal.identificacion}
                          </div>
                        </td>

                        <td>
                          {registro.lactanciaActiva ? (
                            <>
                              <span className="estado-lactancia activa">
                                Activa
                              </span>

                              <div className="descripcion-tabla">
                                Inicio:{" "}
                                {registro.lactanciaActiva.fecha_inicio
                                  ? new Date(
                                      registro.lactanciaActiva.fecha_inicio,
                                    ).toLocaleDateString("es-CO", {
                                      timeZone: "UTC",
                                    })
                                  : "-"}
                              </div>
                            </>
                          ) : (
                            <span className="texto-secundario">
                              Sin lactancia activa
                            </span>
                          )}
                        </td>

                        <td>
                          {Number(
                            registro.produccion?.resumen?.total_dia || 0,
                          ).toFixed(2)}{" "}
                          L
                        </td>

                        <td>
                          {Number(
                            registro.produccion?.resumen?.total_mes || 0,
                          ).toFixed(2)}{" "}
                          L
                        </td>

                        <td>
                          {Number(
                            registro.produccion?.resumen?.promedio_diario || 0,
                          ).toFixed(2)}{" "}
                          L
                        </td>

                        <td>
                          <div className="acciones-tabla">
                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(`/leche/animal/${registro.animal.id}`)
                              }
                            >
                              <Milk size={14} />
                              Gestionar
                            </button>

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(`/animales/${registro.animal.id}`)
                              }
                            >
                              Ver animal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default Leche;
