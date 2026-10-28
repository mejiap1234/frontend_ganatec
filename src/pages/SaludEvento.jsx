import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Plus,
  Pill,
  HeartPulse,
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
  obtenerEventosSalud,
  obtenerTratamientosEvento,
  registrarTratamiento,
  cambiarEstadoTratamiento,
  agregarMedicamentoTratamiento,
} from "../services/salud.service";


const SaludEvento = () => {

  const navigate = useNavigate();

  const {
    animalId,
    eventoId,
  } = useParams();


  /* =========================================================
     DATOS PRINCIPALES
  ========================================================= */

  const [animal, setAnimal] =
    useState(null);

  const [evento, setEvento] =
    useState(null);

  const [tratamientos, setTratamientos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     NUEVO TRATAMIENTO
  ========================================================= */

  const [
    mostrarFormularioTratamiento,
    setMostrarFormularioTratamiento,
  ] = useState(false);

  const [
    formTratamiento,
    setFormTratamiento,
  ] = useState({
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    observacion: "",
  });

  const [
    guardandoTratamiento,
    setGuardandoTratamiento,
  ] = useState(false);

  const [
    errorTratamiento,
    setErrorTratamiento,
  ] = useState("");

  const [
    mensajeTratamiento,
    setMensajeTratamiento,
  ] = useState("");


  /* =========================================================
     CAMBIO DE ESTADO DEL TRATAMIENTO
  ========================================================= */

  const [
    tratamientoEstado,
    setTratamientoEstado,
  ] = useState(null);

  const [
    nuevoEstadoTratamiento,
    setNuevoEstadoTratamiento,
  ] = useState("");

  const [
    motivoEstadoTratamiento,
    setMotivoEstadoTratamiento,
  ] = useState("");

  const [
    cambiandoEstadoTratamiento,
    setCambiandoEstadoTratamiento,
  ] = useState(false);

  const [
    errorEstadoTratamiento,
    setErrorEstadoTratamiento,
  ] = useState("");


  /* =========================================================
     MEDICAMENTOS
  ========================================================= */

  const [
    tratamientoMedicamentos,
    setTratamientoMedicamentos,
  ] = useState(null);

  const [
    mostrarFormularioMedicamento,
    setMostrarFormularioMedicamento,
  ] = useState(false);

  const [
    formMedicamento,
    setFormMedicamento,
  ] = useState({
    medicamento: "",
    dosis: "",
    frecuencia: "",
    via_administracion: "",
    duracion_dias: "",
    observacion: "",
  });

  const [
    guardandoMedicamento,
    setGuardandoMedicamento,
  ] = useState(false);

  const [
    errorMedicamento,
    setErrorMedicamento,
  ] = useState("");

  const [
    mensajeMedicamento,
    setMensajeMedicamento,
  ] = useState("");


  /* =========================================================
     CARGAR TRATAMIENTOS
  ========================================================= */

  const cargarTratamientos = async () => {

    const respuesta =
      await obtenerTratamientosEvento(
        animalId,
        eventoId
      );

    const lista =
      Array.isArray(respuesta?.tratamientos)
        ? respuesta.tratamientos
        : Array.isArray(respuesta)
          ? respuesta
          : [];

    setTratamientos(lista);


    /*
      Si estamos viendo medicamentos,
      actualizamos ese mismo tratamiento
      después de cualquier cambio.
    */
    setTratamientoMedicamentos(
      (anterior) => {

        if (!anterior) {
          return null;
        }

        return (
          lista.find(
            (tratamiento) =>
              Number(tratamiento.id) ===
              Number(anterior.id)
          )
          ||
          anterior
        );

      }
    );

    return lista;

  };


  /* =========================================================
     CARGA INICIAL
  ========================================================= */

  useEffect(() => {

    const cargarDetalle = async () => {

      try {

        setCargando(true);
        setError("");


        const [
          respuestaAnimal,
          respuestaEventos,
          respuestaTratamientos,
        ] = await Promise.all([

          obtenerAnimalPorId(
            animalId
          ),

          obtenerEventosSalud(
            animalId
          ),

          obtenerTratamientosEvento(
            animalId,
            eventoId
          ),

        ]);


        const animalActual =
          respuestaAnimal?.animal ||
          respuestaAnimal;


        const listaEventos =
          Array.isArray(respuestaEventos?.eventos)
            ? respuestaEventos.eventos
            : Array.isArray(respuestaEventos)
              ? respuestaEventos
              : [];


        const eventoActual =
          listaEventos.find(
            (registro) =>
              Number(registro.id) ===
              Number(eventoId)
          );


        const listaTratamientos =
          Array.isArray(
            respuestaTratamientos?.tratamientos
          )
            ? respuestaTratamientos.tratamientos
            : Array.isArray(
                respuestaTratamientos
              )
              ? respuestaTratamientos
              : [];


        if (!eventoActual) {

          setError(
            "No se encontró el evento de salud."
          );

          return;

        }


        setAnimal(animalActual);

        setEvento(eventoActual);

        setTratamientos(
          listaTratamientos
        );


      } catch (error) {

        console.error(
          "Error cargando el evento de salud:",
          error
        );

        setError(
          error.response?.data?.message ||
          "No fue posible cargar el evento de salud."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDetalle();

  }, [
    animalId,
    eventoId,
  ]);


  /* =========================================================
     REGISTRAR TRATAMIENTO
  ========================================================= */

  const manejarCambioTratamiento =
    (e) => {

      const { name, value } =
        e.target;

      setFormTratamiento(
        (anterior) => ({
          ...anterior,
          [name]: value,
        })
      );

    };


  const manejarRegistrarTratamiento =
    async (e) => {

      e.preventDefault();

      setErrorTratamiento("");
      setMensajeTratamiento("");


      if (
        !formTratamiento.descripcion.trim()
      ) {

        setErrorTratamiento(
          "La descripción del tratamiento es obligatoria."
        );

        return;

      }


      try {

        setGuardandoTratamiento(true);


        const datos = {

          descripcion:
            formTratamiento.descripcion.trim(),

          ...(formTratamiento.fecha_inicio && {
            fecha_inicio:
              formTratamiento.fecha_inicio,
          }),

          ...(formTratamiento.fecha_fin && {
            fecha_fin:
              formTratamiento.fecha_fin,
          }),

          ...(formTratamiento.observacion.trim() && {
            observacion:
              formTratamiento.observacion.trim(),
          }),

        };


        await registrarTratamiento(
          animalId,
          eventoId,
          datos
        );


        await cargarTratamientos();


        setFormTratamiento({
          descripcion: "",
          fecha_inicio: "",
          fecha_fin: "",
          observacion: "",
        });


        setMostrarFormularioTratamiento(
          false
        );


        setMensajeTratamiento(
          "Tratamiento registrado correctamente."
        );


      } catch (error) {

        console.error(
          "Error registrando tratamiento:",
          error
        );

        setErrorTratamiento(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible registrar el tratamiento."
        );


      } finally {

        setGuardandoTratamiento(false);

      }

    };


  /* =========================================================
     CAMBIAR ESTADO DEL TRATAMIENTO
  ========================================================= */

  const manejarCambiarEstadoTratamiento =
    async (e) => {

      e.preventDefault();

      setErrorEstadoTratamiento("");


      if (
        !tratamientoEstado ||
        !nuevoEstadoTratamiento
      ) {

        setErrorEstadoTratamiento(
          "Selecciona un estado."
        );

        return;

      }


      if (
        !motivoEstadoTratamiento.trim()
      ) {

        setErrorEstadoTratamiento(
          "Debes indicar el motivo del cambio."
        );

        return;

      }


      try {

        setCambiandoEstadoTratamiento(
          true
        );


        await cambiarEstadoTratamiento(
          animalId,
          eventoId,
          tratamientoEstado.id,
          nuevoEstadoTratamiento,
          motivoEstadoTratamiento.trim()
        );


        await cargarTratamientos();


        setTratamientoEstado(null);

        setNuevoEstadoTratamiento("");

        setMotivoEstadoTratamiento("");


        setMensajeTratamiento(
          "Estado del tratamiento actualizado correctamente."
        );


      } catch (error) {

        console.error(
          "Error cambiando estado del tratamiento:",
          error
        );

        setErrorEstadoTratamiento(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible cambiar el estado del tratamiento."
        );


      } finally {

        setCambiandoEstadoTratamiento(
          false
        );

      }

    };


  /* =========================================================
     REGISTRAR MEDICAMENTO
  ========================================================= */

  const manejarCambioMedicamento =
    (e) => {

      const { name, value } =
        e.target;

      setFormMedicamento(
        (anterior) => ({
          ...anterior,
          [name]: value,
        })
      );

    };


  const manejarRegistrarMedicamento =
    async (e) => {

      e.preventDefault();

      setErrorMedicamento("");
      setMensajeMedicamento("");


      if (
        !formMedicamento.medicamento.trim()
      ) {

        setErrorMedicamento(
          "El nombre del medicamento es obligatorio."
        );

        return;

      }


      if (
        formMedicamento.duracion_dias &&
        Number(
          formMedicamento.duracion_dias
        ) <= 0
      ) {

        setErrorMedicamento(
          "La duración debe ser mayor que cero."
        );

        return;

      }


      try {

        setGuardandoMedicamento(true);


        const datos = {

          medicamento:
            formMedicamento.medicamento.trim(),

          ...(formMedicamento.dosis.trim() && {
            dosis:
              formMedicamento.dosis.trim(),
          }),

          ...(formMedicamento.frecuencia.trim() && {
            frecuencia:
              formMedicamento.frecuencia.trim(),
          }),

          ...(formMedicamento.via_administracion.trim() && {
            via_administracion:
              formMedicamento.via_administracion.trim(),
          }),

          ...(formMedicamento.duracion_dias && {
            duracion_dias:
              Number(
                formMedicamento.duracion_dias
              ),
          }),

          ...(formMedicamento.observacion.trim() && {
            observacion:
              formMedicamento.observacion.trim(),
          }),

        };


        await agregarMedicamentoTratamiento(
          animalId,
          eventoId,
          tratamientoMedicamentos.id,
          datos
        );


        await cargarTratamientos();


        setFormMedicamento({
          medicamento: "",
          dosis: "",
          frecuencia: "",
          via_administracion: "",
          duracion_dias: "",
          observacion: "",
        });


        setMostrarFormularioMedicamento(
          false
        );


        setMensajeMedicamento(
          "Medicamento agregado correctamente."
        );


      } catch (error) {

        console.error(
          "Error agregando medicamento:",
          error
        );

        setErrorMedicamento(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible agregar el medicamento."
        );


      } finally {

        setGuardandoMedicamento(false);

      }

    };


  /* =========================================================
     ESTADOS DE CARGA
  ========================================================= */

  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando evento de salud...
        </div>

      </DashboardLayout>

    );

  }


  if (error || !evento) {

    return (

      <DashboardLayout>

        <div className="dashboard-error">
          {error ||
            "No fue posible cargar el evento."}
        </div>

      </DashboardLayout>

    );

  }


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate("/salud")
            }
          >
            <ArrowLeft size={16} />

            Volver a Salud
          </button>


          <p className="dashboard-label">
            Gestión sanitaria
          </p>

          <h1>
            {evento.titulo}
          </h1>

          <p>

            {animal?.nombre ||
              animal?.identificacion ||
              "Animal"}

            {animal?.identificacion && (
              <>
                {" · "}
                {animal.identificacion}
              </>
            )}

          </p>

        </div>


        <button
          type="button"
          className="boton-secundario"
          onClick={() =>
            navigate(
              `/animales/${animalId}`
            )
          }
        >
          Ver ficha del animal
        </button>

      </div>


      <div className="salud-general-resumen">

        <div>

          <HeartPulse size={20} />

          <span>
            Evento
          </span>

          <strong className="texto-capitalizado">
            {evento.tipo_evento || "-"}
          </strong>

        </div>


        <div>

          <HeartPulse size={20} />

          <span>
            Gravedad
          </span>

          <strong className="texto-capitalizado">
            {evento.gravedad ||
              "Sin especificar"}
          </strong>

        </div>


        <div>

          <HeartPulse size={20} />

          <span>
            Estado
          </span>

          <strong className="texto-capitalizado">
            {evento.estado}
          </strong>

        </div>


        <div>

          <Pill size={20} />

          <span>
            Tratamientos
          </span>

          <strong>
            {tratamientos.length}
          </strong>

        </div>

      </div>


      {evento.descripcion && (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Descripción del evento
              </h3>

            </div>

          </div>

          <p className="texto-secundario">
            {evento.descripcion}
          </p>

        </div>

      )}


      {/* =====================================================
          TRATAMIENTOS
      ===================================================== */}

      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Tratamientos
            </h3>

            <span>
              {tratamientos.length} registrados
            </span>

          </div>


          {evento.estado === "abierto" && (

            <button
              type="button"
              className="boton-principal"
              onClick={() => {

                setMostrarFormularioTratamiento(
                  true
                );

                setErrorTratamiento("");
                setMensajeTratamiento("");

              }}
            >

              <Plus size={17} />

              Nuevo tratamiento

            </button>

          )}

        </div>


        {mensajeTratamiento && (

          <div className="mensaje-exito">
            {mensajeTratamiento}
          </div>

        )}


        {tratamientoEstado && (

          <form
            className="formulario-estado-tratamiento"
            onSubmit={
              manejarCambiarEstadoTratamiento
            }
          >

            <div>

              <p className="dashboard-label">
                Cambiar estado
              </p>

              <h4>
                {tratamientoEstado.descripcion}
              </h4>

              <p>
                Estado actual:{" "}

                <strong>
                  {tratamientoEstado.estado}
                </strong>
              </p>

            </div>


            <div className="form-grid">

              <div className="campo-formulario">

                <label>
                  Nuevo estado
                </label>

                <select
                  value={
                    nuevoEstadoTratamiento
                  }
                  onChange={(e) =>
                    setNuevoEstadoTratamiento(
                      e.target.value
                    )
                  }
                  required
                >

                  <option
                    value=""
                    disabled
                  >
                    Seleccionar
                  </option>


                  {tratamientoEstado.estado ===
                    "activo" && (

                    <>

                      <option value="finalizado">
                        Finalizado
                      </option>

                      <option value="suspendido">
                        Suspendido
                      </option>

                    </>

                  )}


                  {tratamientoEstado.estado ===
                    "suspendido" && (

                    <option value="activo">
                      Reactivar
                    </option>

                  )}

                </select>

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Motivo
                </label>

                <textarea
                  rows="3"
                  placeholder="Ej: Tratamiento completado según lo programado"
                  value={
                    motivoEstadoTratamiento
                  }
                  onChange={(e) =>
                    setMotivoEstadoTratamiento(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {errorEstadoTratamiento && (

              <p className="formulario-error">
                {errorEstadoTratamiento}
              </p>

            )}


            <div className="formulario-acciones">

              <button
                type="button"
                className="boton-secundario"
                onClick={() => {

                  setTratamientoEstado(null);
                  setNuevoEstadoTratamiento("");
                  setMotivoEstadoTratamiento("");
                  setErrorEstadoTratamiento("");

                }}
              >
                Cancelar
              </button>


              <button
                type="submit"
                className="boton-principal"
                disabled={
                  cambiandoEstadoTratamiento
                }
              >

                {cambiandoEstadoTratamiento
                  ? "Actualizando..."
                  : "Actualizar estado"}

              </button>

            </div>

          </form>

        )}


        {mostrarFormularioTratamiento && (

          <form
            className="formulario-tratamiento"
            onSubmit={
              manejarRegistrarTratamiento
            }
          >

            <div className="form-grid">

              <div className="campo-formulario campo-completo">

                <label>
                  Tratamiento *
                </label>

                <input
                  type="text"
                  name="descripcion"
                  value={
                    formTratamiento.descripcion
                  }
                  onChange={
                    manejarCambioTratamiento
                  }
                  placeholder="Ej: Aplicación de antibiótico"
                  required
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Fecha de inicio
                </label>

                <input
                  type="date"
                  name="fecha_inicio"
                  value={
                    formTratamiento.fecha_inicio
                  }
                  onChange={
                    manejarCambioTratamiento
                  }
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Fecha de finalización
                </label>

                <input
                  type="date"
                  name="fecha_fin"
                  value={
                    formTratamiento.fecha_fin
                  }
                  onChange={
                    manejarCambioTratamiento
                  }
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
                    formTratamiento.observacion
                  }
                  onChange={
                    manejarCambioTratamiento
                  }
                />

              </div>

            </div>


            {errorTratamiento && (

              <p className="formulario-error">
                {errorTratamiento}
              </p>

            )}


            <div className="formulario-acciones">

              <button
                type="button"
                className="boton-secundario"
                onClick={() => {

                  setMostrarFormularioTratamiento(
                    false
                  );

                  setErrorTratamiento("");

                }}
              >
                Cancelar
              </button>


              <button
                type="submit"
                className="boton-principal"
                disabled={guardandoTratamiento}
              >

                {guardandoTratamiento
                  ? "Guardando..."
                  : "Guardar tratamiento"}

              </button>

            </div>

          </form>

        )}


        {tratamientos.length === 0 ? (

          <p className="texto-secundario">
            Este evento no tiene tratamientos registrados.
          </p>

        ) : (

          <div className="tabla-contenedor">

            <table className="tabla-ganatec">

              <thead>

                <tr>
                  <th>Tratamiento</th>
                  <th>Inicio</th>
                  <th>Finalización</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>

              </thead>


              <tbody>

                {tratamientos.map(
                  (tratamiento) => (

                    <tr key={tratamiento.id}>

                      <td>

                        <strong>
                          {tratamiento.descripcion}
                        </strong>

                        {tratamiento.observacion && (

                          <div className="descripcion-tabla">
                            {tratamiento.observacion}
                          </div>

                        )}

                      </td>


                      <td>

                        {tratamiento.fecha_inicio
                          ? new Date(
                              tratamiento.fecha_inicio
                            ).toLocaleDateString(
                              "es-CO",
                              {
                                timeZone: "UTC",
                              }
                            )
                          : "-"}

                      </td>


                      <td>

                        {tratamiento.fecha_fin
                          ? new Date(
                              tratamiento.fecha_fin
                            ).toLocaleDateString(
                              "es-CO",
                              {
                                timeZone: "UTC",
                              }
                            )
                          : "-"}

                      </td>


                      <td>

                        <span
                          className={
                            `estado-tratamiento ${
                              tratamiento.estado
                            }`
                          }
                        >
                          {tratamiento.estado}
                        </span>

                      </td>


                      <td>

                        <div className="acciones-tabla">

                          {tratamiento.estado !==
                            "finalizado" && (

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() => {

                                setTratamientoEstado(
                                  tratamiento
                                );

                                setNuevoEstadoTratamiento(
                                  ""
                                );

                                setMotivoEstadoTratamiento(
                                  ""
                                );

                                setErrorEstadoTratamiento(
                                  ""
                                );

                              }}
                            >
                              Cambiar estado
                            </button>

                          )}


                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() => {

                              setTratamientoMedicamentos(
                                tratamiento
                              );

                              setMostrarFormularioMedicamento(
                                false
                              );

                              setErrorMedicamento("");
                              setMensajeMedicamento("");

                            }}
                          >

                            <Pill size={14} />

                            Medicamentos

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


      {/* =====================================================
          MEDICAMENTOS
      ===================================================== */}

      {tratamientoMedicamentos && (

        <div className="medicamentos-panel">

          <div className="medicamentos-header">

            <div>

              <p className="dashboard-label">
                Medicamentos
              </p>

              <h4>
                {tratamientoMedicamentos.descripcion}
              </h4>

              <span>

                {Array.isArray(
                  tratamientoMedicamentos.medicamentos
                )
                  ? tratamientoMedicamentos
                      .medicamentos.length
                  : 0}

                {" "}

                medicamentos registrados

              </span>

            </div>


            <button
              type="button"
              className="boton-cerrar"
              onClick={() => {

                setTratamientoMedicamentos(
                  null
                );

                setMostrarFormularioMedicamento(
                  false
                );

                setErrorMedicamento("");
                setMensajeMedicamento("");

              }}
            >
              ×
            </button>

          </div>


          {tratamientoMedicamentos.estado ===
            "activo" && (

            <div className="medicamentos-acciones">

              <button
                type="button"
                className="boton-principal"
                onClick={() =>
                  setMostrarFormularioMedicamento(
                    true
                  )
                }
              >

                <Plus size={17} />

                Agregar medicamento

              </button>

            </div>

          )}


          {mensajeMedicamento && (

            <div className="mensaje-exito">
              {mensajeMedicamento}
            </div>

          )}


          {mostrarFormularioMedicamento && (

            <form
              className="formulario-medicamento"
              onSubmit={
                manejarRegistrarMedicamento
              }
            >

              <div className="form-grid">

                <div className="campo-formulario">

                  <label>
                    Medicamento *
                  </label>

                  <input
                    type="text"
                    name="medicamento"
                    value={
                      formMedicamento.medicamento
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
                    placeholder="Ej: Penicilina"
                    required
                  />

                </div>


                <div className="campo-formulario">

                  <label>
                    Dosis
                  </label>

                  <input
                    type="text"
                    name="dosis"
                    value={
                      formMedicamento.dosis
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
                    placeholder="Ej: 5 ml"
                  />

                </div>


                <div className="campo-formulario">

                  <label>
                    Frecuencia
                  </label>

                  <input
                    type="text"
                    name="frecuencia"
                    value={
                      formMedicamento.frecuencia
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
                    placeholder="Ej: Cada 12 horas"
                  />

                </div>


                <div className="campo-formulario">

                  <label>
                    Vía de administración
                  </label>

                  <input
                    type="text"
                    name="via_administracion"
                    value={
                      formMedicamento.via_administracion
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
                    placeholder="Ej: Intramuscular"
                  />

                </div>


                <div className="campo-formulario">

                  <label>
                    Duración en días
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="duracion_dias"
                    value={
                      formMedicamento.duracion_dias
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
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
                      formMedicamento.observacion
                    }
                    onChange={
                      manejarCambioMedicamento
                    }
                  />

                </div>

              </div>


              {errorMedicamento && (

                <p className="formulario-error">
                  {errorMedicamento}
                </p>

              )}


              <div className="formulario-acciones">

                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => {

                    setMostrarFormularioMedicamento(
                      false
                    );

                    setErrorMedicamento("");

                  }}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="boton-principal"
                  disabled={
                    guardandoMedicamento
                  }
                >

                  {guardandoMedicamento
                    ? "Guardando..."
                    : "Guardar medicamento"}

                </button>

              </div>

            </form>

          )}


          {Array.isArray(
            tratamientoMedicamentos.medicamentos
          ) &&
          tratamientoMedicamentos
            .medicamentos.length > 0 ? (

            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <thead>

                  <tr>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                    <th>Vía</th>
                    <th>Duración</th>
                  </tr>

                </thead>


                <tbody>

                  {tratamientoMedicamentos
                    .medicamentos
                    .map(
                      (medicamento) => (

                        <tr
                          key={medicamento.id}
                        >

                          <td>

                            <strong>
                              {medicamento.medicamento}
                            </strong>

                            {medicamento.observacion && (

                              <div className="descripcion-tabla">
                                {medicamento.observacion}
                              </div>

                            )}

                          </td>


                          <td>
                            {medicamento.dosis || "-"}
                          </td>


                          <td>
                            {medicamento.frecuencia || "-"}
                          </td>


                          <td>
                            {medicamento.via_administracion || "-"}
                          </td>


                          <td>

                            {medicamento.duracion_dias
                              ? `${medicamento.duracion_dias} días`
                              : "-"}

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          ) : (

            <p className="texto-secundario">
              Este tratamiento no tiene medicamentos registrados.
            </p>

          )}

        </div>

      )}

    </DashboardLayout>

  );

};


export default SaludEvento;
