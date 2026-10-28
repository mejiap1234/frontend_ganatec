import { useEffect, useMemo, useState } from "react";

import {
  HeartPulse,
  Activity,
  Search,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import { obtenerAnimales } from "../services/animales.service";

import {
  obtenerEventosSalud,
  registrarEventoSalud,
  cerrarEventoSalud,
} from "../services/salud.service";


const Salud = () => {

  const navigate = useNavigate();

  /* =========================================================
     ESTADOS GENERALES
  ========================================================= */

  const [animales, setAnimales] =
    useState([]);

  const [eventos, setEventos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("todos");


  /* =========================================================
     REGISTRO DE EVENTO
  ========================================================= */

  const [
    mostrarFormularioSalud,
    setMostrarFormularioSalud,
  ] = useState(false);

  const [formSalud, setFormSalud] =
    useState({
      animal_id: "",
      tipo_evento: "",
      titulo: "",
      descripcion: "",
      gravedad: "",
      fecha_evento: "",
    });

  const [
    guardandoSalud,
    setGuardandoSalud,
  ] = useState(false);

  const [
    errorRegistroSalud,
    setErrorRegistroSalud,
  ] = useState("");

  const [mensajeSalud, setMensajeSalud] =
    useState("");


  /* =========================================================
     CIERRE DE EVENTO
  ========================================================= */

  const [eventoCerrar, setEventoCerrar] =
    useState(null);

  const [motivoCierre, setMotivoCierre] =
    useState("");

  const [
    cerrandoEvento,
    setCerrandoEvento,
  ] = useState(false);

  const [errorCierre, setErrorCierre] =
    useState("");


  /* =========================================================
     CARGAR SALUD DE TODA LA FINCA
  ========================================================= */

  const cargarSaludGeneral = async () => {

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

      setAnimales(listaAnimales);

      /*
        Reutilizamos el endpoint de salud de cada animal.
        Por ahora evita crear un endpoint general nuevo.
      */
      const resultados =
        await Promise.all(

          listaAnimales.map(
            async (animal) => {

              try {

                const respuesta =
                  await obtenerEventosSalud(
                    animal.id
                  );

                const lista =
                  Array.isArray(respuesta?.eventos)
                    ? respuesta.eventos
                    : Array.isArray(respuesta)
                      ? respuesta
                      : [];

                return lista.map(
                  (evento) => ({
                    ...evento,
                    animal_id: animal.id,
                    animal_nombre: animal.nombre,
                    identificacion: animal.identificacion,
                  })
                );

              } catch (error) {

                console.error(
                  `Error cargando salud del animal ${animal.id}:`,
                  error
                );

                return [];

              }

            }
          )

        );

      setEventos(
        resultados.flat()
      );

    } catch (error) {

      console.error(
        "Error cargando salud general:",
        error
      );

      setError(
        error.response?.data?.message ||
        "No fue posible cargar la información de salud."
      );

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarSaludGeneral();

  }, []);


  /* =========================================================
     REGISTRAR EVENTO
  ========================================================= */

  const manejarCambioSalud = (e) => {

    const { name, value } =
      e.target;

    setFormSalud(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );

  };


  const manejarRegistrarSalud =
    async (e) => {

      e.preventDefault();

      setErrorRegistroSalud("");
      setMensajeSalud("");


      if (!formSalud.animal_id) {

        setErrorRegistroSalud(
          "Selecciona el animal."
        );

        return;

      }


      if (
        !formSalud.tipo_evento ||
        !formSalud.titulo.trim()
      ) {

        setErrorRegistroSalud(
          "El tipo de evento y el título son obligatorios."
        );

        return;

      }


      try {

        setGuardandoSalud(true);

        const datos = {

          tipo_evento:
            formSalud.tipo_evento,

          titulo:
            formSalud.titulo.trim(),

          ...(formSalud.descripcion.trim() && {
            descripcion:
              formSalud.descripcion.trim(),
          }),

          ...(formSalud.gravedad && {
            gravedad:
              formSalud.gravedad,
          }),

          ...(formSalud.fecha_evento && {
            fecha_evento:
              formSalud.fecha_evento,
          }),

        };


        const respuesta =
          await registrarEventoSalud(
            formSalud.animal_id,
            datos
          );


        await cargarSaludGeneral();


        setFormSalud({
          animal_id: "",
          tipo_evento: "",
          titulo: "",
          descripcion: "",
          gravedad: "",
          fecha_evento: "",
        });


        setMostrarFormularioSalud(false);


        setMensajeSalud(
          respuesta?.message ||
          "Evento de salud registrado correctamente."
        );


      } catch (error) {

        console.error(
          "Error registrando evento de salud:",
          error
        );

        setErrorRegistroSalud(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible registrar el evento."
        );


      } finally {

        setGuardandoSalud(false);

      }

    };


  /* =========================================================
     CERRAR EVENTO
  ========================================================= */

  const manejarCerrarEvento =
    async (e) => {

      e.preventDefault();

      setErrorCierre("");


      if (!motivoCierre.trim()) {

        setErrorCierre(
          "Debes indicar el motivo del cierre."
        );

        return;

      }


      try {

        setCerrandoEvento(true);


        await cerrarEventoSalud(
          eventoCerrar.animal_id,
          eventoCerrar.id,
          motivoCierre.trim()
        );


        setEventoCerrar(null);
        setMotivoCierre("");


        setMensajeSalud(
          "Evento de salud cerrado correctamente."
        );


        await cargarSaludGeneral();


      } catch (error) {

        console.error(
          "Error cerrando evento:",
          error
        );

        setErrorCierre(
          error.response?.data?.message ||
          "No fue posible cerrar el evento."
        );


      } finally {

        setCerrandoEvento(false);

      }

    };


  /* =========================================================
     INDICADORES
  ========================================================= */

  const eventosAbiertos =
    eventos.filter(
      (evento) =>
        evento.estado === "abierto"
    ).length;


  const eventosGraves =
    eventos.filter(
      (evento) =>
        evento.estado === "abierto" &&
        evento.gravedad === "grave"
    ).length;


  const animalesConNovedades =
    new Set(

      eventos
        .filter(
          (evento) =>
            evento.estado === "abierto"
        )
        .map(
          (evento) =>
            evento.animal_id
        )

    ).size;


  /* =========================================================
     FILTROS
  ========================================================= */

  const eventosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return eventos.filter(
        (evento) => {

          const coincideEstado =
            filtroEstado === "todos" ||
            evento.estado === filtroEstado;


          const contenido =
            [
              evento.animal_nombre,
              evento.identificacion,
              evento.titulo,
              evento.tipo_evento,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return (
            coincideEstado &&
            (
              !texto ||
              contenido.includes(texto)
            )
          );

        }
      );

    }, [
      eventos,
      busqueda,
      filtroEstado,
    ]);


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <p className="dashboard-label">
            Gestión sanitaria
          </p>

          <h1>
            Salud
          </h1>

          <p>
            Estado sanitario general de los
            animales de la finca.
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() => {

            setMostrarFormularioSalud(
              true
            );

            setErrorRegistroSalud("");
            setMensajeSalud("");

          }}
        >

          <Plus size={17} />

          Registrar evento

        </button>

      </div>


      {mensajeSalud && (

        <div className="mensaje-exito">
          {mensajeSalud}
        </div>

      )}


      {/* =====================================================
          REGISTRAR EVENTO
      ===================================================== */}

      {mostrarFormularioSalud && (

        <form
          className="formulario-salud"
          onSubmit={manejarRegistrarSalud}
        >

          <div className="formulario-reproduccion-header">

            <div>

              <p className="dashboard-label">
                Nuevo registro
              </p>

              <h4>
                Registrar evento de salud
              </h4>

              <span>
                Selecciona el animal al que
                pertenece la novedad sanitaria.
              </span>

            </div>


            <button
              type="button"
              className="boton-cerrar"
              onClick={() => {

                setMostrarFormularioSalud(
                  false
                );

                setErrorRegistroSalud("");

              }}
            >
              ×
            </button>

          </div>


          <div className="form-grid">

            <div className="campo-formulario">

              <label>
                Animal *
              </label>

              <select
                name="animal_id"
                value={formSalud.animal_id}
                onChange={manejarCambioSalud}
                required
              >

                <option value="">
                  Seleccionar animal
                </option>


                {animales
                  .filter(
                    (animal) => {

                      const estado =
                        String(
                          animal.estado || ""
                        )
                          .trim()
                          .toLowerCase();

                      return estado === "activo";

                    }
                  )
                  .map(
                    (animal) => (

                      <option
                        key={animal.id}
                        value={animal.id}
                      >

                        {animal.nombre ||
                          "Sin nombre"}

                        {" - "}

                        {animal.identificacion}

                      </option>

                    )
                  )}

              </select>

            </div>


            <div className="campo-formulario">

              <label>
                Tipo de evento *
              </label>

              <select
                name="tipo_evento"
                value={formSalud.tipo_evento}
                onChange={manejarCambioSalud}
                required
              >

                <option value="">
                  Seleccionar
                </option>

                <option value="enfermedad">
                  Enfermedad
                </option>

                <option value="lesion">
                  Lesión
                </option>

                <option value="sintoma">
                  Síntoma
                </option>

                <option value="revision">
                  Revisión
                </option>

                <option value="otro">
                  Otro
                </option>

              </select>

            </div>


            <div className="campo-formulario">

              <label>
                Evento *
              </label>

              <input
                type="text"
                name="titulo"
                placeholder="Ej: Pérdida de apetito"
                value={formSalud.titulo}
                onChange={manejarCambioSalud}
                required
              />

            </div>


            <div className="campo-formulario">

              <label>
                Gravedad
              </label>

              <select
                name="gravedad"
                value={formSalud.gravedad}
                onChange={manejarCambioSalud}
              >

                <option value="">
                  Sin especificar
                </option>

                <option value="leve">
                  Leve
                </option>

                <option value="moderada">
                  Moderada
                </option>

                <option value="grave">
                  Grave
                </option>

              </select>

            </div>


            <div className="campo-formulario">

              <label>
                Fecha
              </label>

              <input
                type="date"
                name="fecha_evento"
                value={formSalud.fecha_evento}
                onChange={manejarCambioSalud}
              />

            </div>


            <div className="campo-formulario campo-completo">

              <label>
                Descripción
              </label>

              <textarea
                name="descripcion"
                rows="3"
                placeholder="Describe la novedad observada..."
                value={formSalud.descripcion}
                onChange={manejarCambioSalud}
              />

            </div>

          </div>


          {errorRegistroSalud && (

            <p className="formulario-error">
              {errorRegistroSalud}
            </p>

          )}


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() =>
                setMostrarFormularioSalud(
                  false
                )
              }
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={guardandoSalud}
            >

              {guardandoSalud
                ? "Registrando..."
                : "Registrar evento"}

            </button>

          </div>

        </form>

      )}


      {/* =====================================================
          CERRAR EVENTO
      ===================================================== */}

      {eventoCerrar && (

        <form
          className="formulario-cierre-salud"
          onSubmit={manejarCerrarEvento}
        >

          <div>

            <h4>
              Cerrar evento
            </h4>

            <p>
              {eventoCerrar.animal_nombre}
              {" - "}
              {eventoCerrar.titulo}
            </p>

          </div>


          <div className="campo-formulario">

            <label>
              Motivo del cierre *
            </label>

            <textarea
              rows="3"
              value={motivoCierre}
              onChange={(e) =>
                setMotivoCierre(
                  e.target.value
                )
              }
              placeholder="Ej: Animal recuperado después del tratamiento..."
            />

          </div>


          {errorCierre && (

            <p className="formulario-error">
              {errorCierre}
            </p>

          )}


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() => {

                setEventoCerrar(null);
                setMotivoCierre("");

              }}
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={cerrandoEvento}
            >

              {cerrandoEvento
                ? "Cerrando..."
                : "Cerrar evento"}

            </button>

          </div>

        </form>

      )}


      {cargando ? (

        <div className="dashboard-loading">
          Cargando información de salud...
        </div>

      ) : error ? (

        <div className="dashboard-error">
          {error}
        </div>

      ) : (

        <>

          <div className="salud-general-resumen">

            <div>

              <HeartPulse size={20} />

              <span>
                Eventos abiertos
              </span>

              <strong>
                {eventosAbiertos}
              </strong>

            </div>


            <div>

              <AlertTriangle size={20} />

              <span>
                Casos graves
              </span>

              <strong>
                {eventosGraves}
              </strong>

            </div>


            <div>

              <Activity size={20} />

              <span>
                Animales con novedades
              </span>

              <strong>
                {animalesConNovedades}
              </strong>

            </div>


            <div>

              <HeartPulse size={20} />

              <span>
                Historial total
              </span>

              <strong>
                {eventos.length}
              </strong>

            </div>

          </div>


          <div className="salud-general-filtros">

            <div className="buscador-salud-general">

              <Search size={17} />

              <input
                type="text"
                placeholder="Buscar animal o evento..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
            >

              <option value="todos">
                Todos
              </option>

              <option value="abierto">
                Abiertos
              </option>

              <option value="cerrado">
                Cerrados
              </option>

            </select>

          </div>


          <div className="dashboard-panel">

            <div className="lista-header">

              <div>

                <h3>
                  Eventos sanitarios
                </h3>

                <span>
                  {eventosFiltrados.length} registros
                </span>

              </div>

            </div>


            {eventosFiltrados.length === 0 ? (

              <p className="texto-secundario">
                No se encontraron eventos sanitarios.
              </p>

            ) : (

              <div className="tabla-contenedor">

                <table className="tabla-ganatec">

                  <thead>

                    <tr>
                      <th>Animal</th>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Evento</th>
                      <th>Gravedad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {eventosFiltrados.map(
                      (evento) => (

                        <tr
                          key={
                            `${evento.animal_id}-${evento.id}`
                          }
                        >

                          <td>

                            <strong>
                              {evento.animal_nombre ||
                                evento.identificacion}
                            </strong>

                            <div className="descripcion-tabla">
                              {evento.identificacion}
                            </div>

                          </td>


                          <td>

                            {evento.fecha_evento
                              ? new Date(
                                  evento.fecha_evento
                                ).toLocaleDateString(
                                  "es-CO",
                                  {
                                    timeZone: "UTC",
                                  }
                                )
                              : "-"}

                          </td>


                          <td className="texto-capitalizado">
                            {evento.tipo_evento || "-"}
                          </td>


                          <td>

                            <strong>
                              {evento.titulo}
                            </strong>

                            {evento.descripcion && (

                              <div className="descripcion-tabla">
                                {evento.descripcion}
                              </div>

                            )}

                          </td>


                          <td>

                            <span
                              className={
                                `gravedad-salud ${
                                  evento.gravedad || ""
                                }`
                              }
                            >
                              {evento.gravedad ||
                                "Sin especificar"}
                            </span>

                          </td>


                          <td>

                            <span
                              className={
                                `estado-salud ${
                                  evento.estado || ""
                                }`
                              }
                            >
                              {evento.estado}
                            </span>

                          </td>


                          <td>

                            <div className="acciones-tabla">

                              <button
                                type="button"
                                className="boton-tabla"
                                onClick={() =>
                                  navigate(
                                    `/animales/${evento.animal_id}`
                                  )
                                }
                              >
                                Ver animal
                              </button>


                              <button
                                type="button"
                                className="boton-tabla"
                                onClick={() =>
                                  navigate(
                                    `/salud/animal/${evento.animal_id}/evento/${evento.id}`
                                  )
                                }
                              >
                                Gestionar
                              </button>


                              {evento.estado === "abierto" && (

                                <button
                                  type="button"
                                  className="boton-tabla"
                                  onClick={() => {

                                    setEventoCerrar(
                                      evento
                                    );

                                    setMotivoCierre("");

                                    setErrorCierre("");

                                  }}
                                >
                                  Cerrar
                                </button>

                              )}

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


export default Salud;
