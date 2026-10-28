
import {
  useCallback,
  useEffect,
  useState
} from "react";

import { Navigate } from "react-router-dom";

import {
  UsersRound,
  UserPlus,
  Search,
  Pencil,
  Power,
  X,
  RefreshCw
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Campos iniciales del formulario.
const formularioInicial = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  confirmarPassword: ""
};

// Recupera los mensajes devueltos por el backend.
const obtenerError = (error, mensaje) =>
  error.response?.data?.message || mensaje;

const Trabajadores = () => {
  const { usuario } = useAuth();

  // 1. Estado del listado y los mensajes.
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // 2. Estado de los formularios y modales.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [cambioEstado, setCambioEstado] = useState(null);

  // 3. Consultar exclusivamente trabajadores de la finca.
  const cargarTrabajadores = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/trabajadores");

      setTrabajadores(
        Array.isArray(respuesta.data.trabajadores)
          ? respuesta.data.trabajadores
          : []
      );
    } catch (err) {
      setError(
        obtenerError(err, "No fue posible cargar los trabajadores")
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.rol === "administrador") {
      cargarTrabajadores();
    }
  }, [usuario?.rol, cargarTrabajadores]);

  // 4. Preparar un registro nuevo o una edición.
  const abrirFormulario = (trabajador = null) => {
    setEditando(trabajador);
    setErrorFormulario("");

    setFormulario(
      trabajador
        ? {
            nombre: trabajador.nombre,
            apellido: trabajador.apellido,
            email: trabajador.email,
            password: "",
            confirmarPassword: ""
          }
        : { ...formularioInicial }
    );

    setModalAbierto(true);
  };

  const cerrarFormulario = () => {
    if (guardando) return;

    setModalAbierto(false);
    setEditando(null);
    setFormulario({ ...formularioInicial });
    setErrorFormulario("");
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // 5. Crear o actualizar un trabajador.
  const guardarTrabajador = async (e) => {
    e.preventDefault();

    if (guardando) return;

    setErrorFormulario("");
    setMensaje("");

    const datos = {
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      email: formulario.email.trim().toLowerCase()
    };

    if (!datos.nombre || !datos.apellido || !datos.email) {
      setErrorFormulario("Completa todos los campos.");
      return;
    }

    if (!editando) {
      if (formulario.password.length < 8) {
        setErrorFormulario(
          "La contraseña debe tener mínimo 8 caracteres."
        );
        return;
      }

      if (
        formulario.password !== formulario.confirmarPassword
      ) {
        setErrorFormulario("Las contraseñas no coinciden.");
        return;
      }
    }

    setGuardando(true);

    try {
      let respuesta;

      if (editando) {
  // Actualiza los datos del trabajador seleccionado.
  respuesta = await api.patch(
    `/trabajadores/${editando.id}`,
    datos
  );

      } else {
        respuesta = await api.post("/trabajadores", {
          ...datos,
          password: formulario.password
        });
      }

      const trabajadorGuardado = respuesta.data.trabajador;

      // Actualiza la tabla sin perder los datos existentes.
      if (editando) {
        setTrabajadores((anteriores) =>
          anteriores.map((trabajador) =>
            trabajador.id === editando.id
              ? { ...trabajador, ...trabajadorGuardado }
              : trabajador
          )
        );
      } else {
        setTrabajadores((anteriores) =>
          [...anteriores, trabajadorGuardado]
            .sort((a, b) =>
              a.nombre.localeCompare(b.nombre, "es")
            )
        );
      }

      setMensaje(
        respuesta.data.message ||
        "Operación realizada correctamente."
      );

      setModalAbierto(false);
      setEditando(null);
      setFormulario({ ...formularioInicial });

    } catch (err) {
      setErrorFormulario(
        obtenerError(err, "No fue posible guardar el trabajador")
      );
    } finally {
      setGuardando(false);
    }
  };

  // 6. Activar o desactivar la cuenta seleccionada.
  const confirmarCambioEstado = async () => {
    if (!cambioEstado || guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await api.patch(
        `/trabajadores/${cambioEstado.id}/estado`,
        {
          activo: !cambioEstado.activo
        }
      );

      setTrabajadores((anteriores) =>
        anteriores.map((trabajador) =>
          trabajador.id === cambioEstado.id
            ? { ...trabajador, ...respuesta.data.trabajador }
            : trabajador
        )
      );

      setMensaje(respuesta.data.message);
      setCambioEstado(null);

    } catch (err) {
      setError(
        obtenerError(err, "No fue posible cambiar el estado")
      );
      setCambioEstado(null);
    } finally {
      setGuardando(false);
    }
  };

  // 7. Resumen y búsqueda de trabajadores.
  const activos = trabajadores.filter(
    (trabajador) => trabajador.activo
  ).length;

  const filtrados = trabajadores.filter((trabajador) => {
    const texto = [
      trabajador.nombre,
      trabajador.apellido,
      trabajador.email
    ].join(" ").toLowerCase();

    return texto.includes(busqueda.trim().toLowerCase());
  });

  // El frontend limita la pantalla al administrador.
  if (usuario?.rol !== "administrador") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="trabajadores-pagina">

      {/* ENCABEZADO */}
      <div className="pagina-header trabajadores-header">
        <div>
          <h1>Trabajadores</h1>
          <p>
            Administra el personal registrado en tu finca.
          </p>
        </div>

        <button
          type="button"
          className="boton-principal"
          onClick={() => abrirFormulario()}
        >
          <UserPlus size={18} />
          Nuevo trabajador
        </button>
      </div>

      {/* INDICADORES */}
      <div className="trabajadores-resumen">
        <div>
          <span>Total trabajadores</span>
          <strong>{trabajadores.length}</strong>
        </div>

        <div>
          <span>Activos</span>
          <strong>{activos}</strong>
        </div>

        <div>
          <span>Inactivos</span>
          <strong>{trabajadores.length - activos}</strong>
        </div>
      </div>

      {/* MENSAJES */}
      {mensaje && (
        <div className="mensaje-exito" role="status">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      {/* BÚSQUEDA Y ACTUALIZACIÓN */}
      <div className="trabajadores-herramientas">
        <div className="buscador trabajadores-buscador">
          <Search size={18} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar trabajador..."
            aria-label="Buscar trabajador"
          />
        </div>

        <button
          type="button"
          className="boton-secundario trabajadores-actualizar"
          onClick={cargarTrabajadores}
          disabled={cargando}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* LISTADO */}
      {cargando ? (
        <div className="trabajadores-vacio">
          Cargando trabajadores...
        </div>
      ) : trabajadores.length === 0 && !error ? (
        <div className="trabajadores-vacio">
          <UsersRound size={35} />
          <h3>No hay trabajadores registrados</h3>
          <p>
            Crea el primer trabajador de tu finca.
          </p>
        </div>
      ) : (
        <div className="tabla-contenedor trabajadores-tabla">
          <table className="tabla-ganatec">
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Correo electrónico</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((trabajador) => (
                <tr key={trabajador.id}>
                  <td data-label="Trabajador">
                    <strong>
                      {trabajador.nombre} {trabajador.apellido}
                    </strong>
                  </td>

                  <td data-label="Correo">
                    {trabajador.email}
                  </td>

                  <td data-label="Estado">
                    <span
                      className={
                        trabajador.activo
                          ? "trabajador-estado activo"
                          : "trabajador-estado inactivo"
                      }
                    >
                      {trabajador.activo
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>

                  <td data-label="Acciones">
                    <div className="trabajadores-acciones">
                      <button
                        type="button"
                        className="boton-tabla"
                        onClick={() =>
                          abrirFormulario(trabajador)
                        }
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className={
                          trabajador.activo
                            ? "trabajador-accion desactivar"
                            : "trabajador-accion activar"
                        }
                        onClick={() =>
                          setCambioEstado(trabajador)
                        }
                      >
                        <Power size={15} />
                        {trabajador.activo
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="trabajadores-sin-resultados">
                    No se encontraron trabajadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PARA CREAR O EDITAR */}
      {modalAbierto && (
        <div className="ganatec-modal-fondo">
          <div
            className="ganatec-modal-ventana"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-trabajador"
          >
            <div className="ganatec-modal-cabecera">
              <h2 id="titulo-modal-trabajador">
                {editando
                  ? "Editar trabajador"
                  : "Registrar trabajador"}
              </h2>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ganatec-modal-cuerpo">
              <form onSubmit={guardarTrabajador}>
                <div className="form-grid">

                  <div className="campo-formulario">
                    <label htmlFor="trabajador-nombre">
                      Nombre
                    </label>
                    <input
                      id="trabajador-nombre"
                      name="nombre"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="campo-formulario">
                    <label htmlFor="trabajador-apellido">
                      Apellido
                    </label>
                    <input
                      id="trabajador-apellido"
                      name="apellido"
                      value={formulario.apellido}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="campo-formulario campo-completo">
                    <label htmlFor="trabajador-email">
                      Correo electrónico
                    </label>
                    <input
                      id="trabajador-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formulario.email}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  {/* La contraseña se solicita solo al crear. */}
                  {!editando && (
                    <>
                      <div className="campo-formulario">
                        <label htmlFor="trabajador-password">
                          Contraseña inicial
                        </label>
                        <input
                          id="trabajador-password"
                          type="password"
                          name="password"
                          autoComplete="new-password"
                          minLength={8}
                          value={formulario.password}
                          onChange={manejarCambio}
                          required
                        />
                      </div>

                      <div className="campo-formulario">
                        <label htmlFor="trabajador-confirmar">
                          Confirmar contraseña
                        </label>
                        <input
                          id="trabajador-confirmar"
                          type="password"
                          name="confirmarPassword"
                          autoComplete="new-password"
                          value={formulario.confirmarPassword}
                          onChange={manejarCambio}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                {errorFormulario && (
                  <div
                    className="formulario-error"
                    role="alert"
                  >
                    {errorFormulario}
                  </div>
                )}

                <div className="formulario-acciones">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={cerrarFormulario}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="boton-principal"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : editando
                        ? "Guardar cambios"
                        : "Crear trabajador"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ACTIVACIÓN / DESACTIVACIÓN */}
      {cambioEstado && (
        <div className="ganatec-modal-fondo">
          <div
            className="ganatec-modal-ventana trabajadores-modal-confirmacion"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-cambio-estado"
          >
            <div className="ganatec-modal-cabecera">
              <h2 id="titulo-cambio-estado">
                {cambioEstado.activo
                  ? "Desactivar trabajador"
                  : "Activar trabajador"}
              </h2>

              <button
                type="button"
                disabled={guardando}
                onClick={() => setCambioEstado(null)}
                aria-label="Cancelar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ganatec-modal-cuerpo">
              <p>
                ¿Deseas {cambioEstado.activo
                  ? "desactivar"
                  : "activar"} la cuenta de{" "}
                <strong>
                  {cambioEstado.nombre}{" "}
                  {cambioEstado.apellido}
                </strong>?
              </p>

              <div className="formulario-acciones">
                <button
                  type="button"
                  className="boton-secundario"
                  disabled={guardando}
                  onClick={() => setCambioEstado(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="boton-principal"
                  disabled={guardando}
                  onClick={confirmarCambioEstado}
                >
                  {guardando
                    ? "Procesando..."
                    : cambioEstado.activo
                      ? "Desactivar"
                      : "Activar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trabajadores;
