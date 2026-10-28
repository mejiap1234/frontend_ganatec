/* =========================================================
   IMPORTS
========================================================= */

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  LayoutDashboard,
  Scale,
  HeartPulse,
  Dna,
  Milk,
  Plus,
  Pill,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import EditarAnimalModal from "../components/EditarAnimalModal";
import ModalGanatec from "../components/ModalGanatec";

import {
  obtenerAnimalPorId,
  obtenerAnimales,
  actualizarAnimal,
} from "../services/animales.service";

import {
  obtenerPesajesAnimal,
  registrarPesaje,
} from "../services/pesajes.service";

import {
  obtenerEventosSalud,
  registrarEventoSalud,
  cerrarEventoSalud,
  obtenerTratamientosEvento,
  registrarTratamiento,
  cambiarEstadoTratamiento,
  agregarMedicamentoTratamiento,
} from "../services/salud.service";

import {
  obtenerServiciosReproductivos,
  obtenerGestaciones,
  registrarServicioReproductivo,
  registrarDiagnosticoGestacion,
  registrarParto,
  obtenerPartos,
} from "../services/reproduccion.service";

import {
  obtenerProduccionLeche,
  obtenerLactancias,
  compararLactancias,
  registrarOrdenio,
  corregirRegistroLeche,
  finalizarLactancia,
  obtenerLecheLactancia,
} from "../services/leche.service";

const AnimalDetalle = () => {
  /* =========================================================
     DATOS GENERALES DEL COMPONENTE
  ========================================================= */

  const { id } = useParams();

  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
   EDICIÓN GENERAL DEL ANIMAL
========================================================= */

  const [editandoAnimal, setEditandoAnimal] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState("");

  /* =========================================================
     NAVEGACIÓN ENTRE PESTAÑAS
  ========================================================= */

  const [pestanaActiva, setPestanaActiva] = useState("resumen");

  /* =========================================================
     ESTADOS: PESAJES
  ========================================================= */

  const [pesajes, setPesajes] = useState([]);

  const [cargandoPesajes, setCargandoPesajes] = useState(false);

  const [mostrarFormularioPesaje, setMostrarFormularioPesaje] = useState(false);

  const [formPesaje, setFormPesaje] = useState({
    peso_kg: "",
    fecha_pesaje: "",
    observacion: "",
  });

  const [guardandoPesaje, setGuardandoPesaje] = useState(false);

  const [errorPesaje, setErrorPesaje] = useState("");

  const [mensajePesaje, setMensajePesaje] = useState("");

  /* =========================================================
     ESTADOS: SALUD
  ========================================================= */

  const [eventosSalud, setEventosSalud] = useState([]);

  const [cargandoSalud, setCargandoSalud] = useState(false);

  const [mostrarFormularioSalud, setMostrarFormularioSalud] = useState(false);

  const [formSalud, setFormSalud] = useState({
    tipo_evento: "",
    titulo: "",
    descripcion: "",
    gravedad: "",
    fecha_evento: "",
  });

  const [guardandoSalud, setGuardandoSalud] = useState(false);

  const [errorSalud, setErrorSalud] = useState("");

  const [mensajeSalud, setMensajeSalud] = useState("");

  // Evento que el usuario quiere cerrar
  const [eventoCerrar, setEventoCerrar] = useState(null);

  // Motivo del cierre
  const [motivoCierre, setMotivoCierre] = useState("");

  // Estado mientras se guarda el cierre
  const [cerrandoEvento, setCerrandoEvento] = useState(false);

  const [errorCierre, setErrorCierre] = useState("");

  /* =========================================================
     ESTADOS: TRATAMIENTOS
  ========================================================= */

  // Evento de salud seleccionado
  const [eventoTratamientos, setEventoTratamientos] = useState(null);

  // Tratamientos del evento seleccionado
  const [tratamientos, setTratamientos] = useState([]);

  // Estado de carga
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false);

  // Mostrar u ocultar formulario
  const [mostrarFormularioTratamiento, setMostrarFormularioTratamiento] =
    useState(false);

  // Datos del formulario
  const [formTratamiento, setFormTratamiento] = useState({
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    observacion: "",
  });

  // Estado al guardar
  const [guardandoTratamiento, setGuardandoTratamiento] = useState(false);

  // Mensajes
  const [errorTratamiento, setErrorTratamiento] = useState("");

  const [mensajeTratamiento, setMensajeTratamiento] = useState("");

  // Tratamiento al que se le cambiará el estado
  const [tratamientoEstado, setTratamientoEstado] = useState(null);

  // Nuevo estado seleccionado
  const [nuevoEstadoTratamiento, setNuevoEstadoTratamiento] = useState("");

  // Motivo del cambio
  const [motivoEstadoTratamiento, setMotivoEstadoTratamiento] = useState("");

  // Estado mientras se procesa el cambio
  const [cambiandoEstadoTratamiento, setCambiandoEstadoTratamiento] =
    useState(false);

  // Error del cambio de estado
  const [errorEstadoTratamiento, setErrorEstadoTratamiento] = useState("");

  /* =========================================================
     ESTADOS: MEDICAMENTOS
  ========================================================= */

  // Tratamiento cuyos medicamentos estamos viendo
  const [tratamientoMedicamentos, setTratamientoMedicamentos] = useState(null);

  // Mostrar formulario
  const [mostrarFormularioMedicamento, setMostrarFormularioMedicamento] =
    useState(false);

  // Datos del medicamento
  const [formMedicamento, setFormMedicamento] = useState({
    medicamento: "",
    dosis: "",
    frecuencia: "",
    via_administracion: "",
    duracion_dias: "",
    observacion: "",
  });

  // Estado mientras se guarda
  const [guardandoMedicamento, setGuardandoMedicamento] = useState(false);

  // Mensajes
  const [errorMedicamento, setErrorMedicamento] = useState("");

  const [mensajeMedicamento, setMensajeMedicamento] = useState("");

  /* =========================================================
     ESTADOS: REPRODUCCIÓN
  ========================================================= */

  const [serviciosReproductivos, setServiciosReproductivos] = useState([]);

  const [gestaciones, setGestaciones] = useState([]);

  const [cargandoReproduccion, setCargandoReproduccion] = useState(false);

  const [errorReproduccion, setErrorReproduccion] = useState("");

  /*
  Controla si el formulario para registrar
  un servicio reproductivo está visible.
*/
  const [mostrarFormularioServicio, setMostrarFormularioServicio] =
    useState(false);

  /*
  Controla si el reproductor utilizado
  está registrado dentro de GANATEC
  o si es un reproductor externo.
*/
  const [origenReproductor, setOrigenReproductor] = useState("externo");

  /*
  Datos que realmente espera el backend
  para registrar un servicio reproductivo.

  reproductor_id:
  se usa cuando el macho está registrado en GANATEC.

  reproductor_externo:
  se usa cuando el reproductor no pertenece
  a los animales registrados de la finca.

  Nunca se deben enviar los dos al mismo tiempo.
*/
  const [formServicioReproductivo, setFormServicioReproductivo] = useState({
    tipo_servicio: "",

    fecha_servicio: "",

    reproductor_id: "",

    reproductor_externo: "",

    codigo_semen: "",

    responsable: "",

    observacion: "",
  });

  /*
  Se utilizará mientras el servicio
  se está enviando al backend.
*/
  const [guardandoServicioReproductivo, setGuardandoServicioReproductivo] =
    useState(false);

  /*
  Mensajes propios del formulario
  de reproducción.
*/
  const [errorServicioReproductivo, setErrorServicioReproductivo] =
    useState("");

  const [mensajeServicioReproductivo, setMensajeServicioReproductivo] =
    useState("");

  /*
  Guarda los machos activos registrados en la finca.

  Esta lista se utilizará cuando el usuario seleccione
  "Registrado en GANATEC" como origen del reproductor.
*/
  const [reproductoresDisponibles, setReproductoresDisponibles] = useState([]);

  /*
  Indica si la lista de reproductores
  se está cargando desde el backend.
*/
  const [cargandoReproductores, setCargandoReproductores] = useState(false);

  /* =========================================================
   DIAGNÓSTICO DE GESTACIÓN
========================================================= */

  /*
  Guarda el servicio reproductivo sobre el cual
  vamos a registrar un diagnóstico.
*/
  const [servicioDiagnostico, setServicioDiagnostico] = useState(null);

  /*
  Datos del formulario de diagnóstico.

  resultado:
  - prenada
  - vacia
  - dudosa

  metodo:
  - palpacion
  - ecografia
  - otro
*/
  const [formDiagnostico, setFormDiagnostico] = useState({
    fecha_diagnostico: "",
    resultado: "",
    metodo: "",
    responsable: "",
    observacion: "",
  });

  /*
  Controla el estado mientras el diagnóstico
  se está enviando al backend.
*/
  const [guardandoDiagnostico, setGuardandoDiagnostico] = useState(false);

  /* Mensajes del diagnóstico */
  const [errorDiagnostico, setErrorDiagnostico] = useState("");

  const [mensajeDiagnostico, setMensajeDiagnostico] = useState("");

  /* =========================================================
   ESTADOS: PARTO
========================================================= */

  /*
  Historial de partos de la hembra.
*/
  const [partos, setPartos] = useState([]);

  /*
  Guarda la gestación activa sobre la cual
  vamos a registrar el parto.
*/
  const [gestacionParto, setGestacionParto] = useState(null);

  /*
  Información general del parto.

  El arreglo "crias" permite registrar uno
  o varios nacimientos dentro del mismo parto.
*/
  const [formParto, setFormParto] = useState({
    fecha_parto: "",

    tipo_parto: "normal",

    complicaciones: "",

    observacion: "",

    crias: [
      {
        sexo: "",
        estado_nacimiento: "viva",
        peso_nacimiento_kg: "",
        identificacion_temporal: "",
        nombre: "",
        raza: "",
        observacion: "",
      },
    ],
  });

  const [guardandoParto, setGuardandoParto] = useState(false);

  const [errorParto, setErrorParto] = useState("");

  const [mensajeParto, setMensajeParto] = useState("");

  /* =========================================================
   ESTADOS: LECHE Y LACTANCIAS
========================================================= */

  const [produccionLeche, setProduccionLeche] = useState(null);

  const [lactancias, setLactancias] = useState([]);

  const [comparacionLactancias, setComparacionLactancias] = useState(null);

  const [cargandoLeche, setCargandoLeche] = useState(false);

  const [errorLeche, setErrorLeche] = useState("");

  const [mensajeLeche, setMensajeLeche] = useState("");

  /* Formulario para registrar ordeño */
  const [mostrarFormularioOrdenio, setMostrarFormularioOrdenio] =
    useState(false);

  const [formOrdenio, setFormOrdenio] = useState({
    litros: "",
    turno: "manana",
    fecha_ordenio: "",
    observacion: "",
  });

  const [guardandoOrdenio, setGuardandoOrdenio] = useState(false);

  /* Fecha utilizada para consultar producción */
  const [fechaConsultaLeche, setFechaConsultaLeche] = useState(() => {
    const fecha = new Date();

    const anio = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  });

  /* =========================================================
   ESTADOS: CORRECCIÓN DE ORDEÑO
========================================================= */

  const [registroCorreccion, setRegistroCorreccion] = useState(null);

  const [formCorreccionLeche, setFormCorreccionLeche] = useState({
    litros: "",
    turno: "manana",
    fecha_ordenio: "",
    observacion: "",
    motivo_correccion: "",
  });

  const [corrigiendoLeche, setCorrigiendoLeche] = useState(false);

  const [errorCorreccionLeche, setErrorCorreccionLeche] = useState("");

  /* =========================================================
   ESTADOS: FINALIZAR LACTANCIA
========================================================= */

  const [mostrarFinalizarLactancia, setMostrarFinalizarLactancia] =
    useState(false);

  const [formFinalizarLactancia, setFormFinalizarLactancia] = useState({
    fecha_fin: "",
    motivo_fin: "secado",
    observacion: "",
  });

  const [finalizandoLactancia, setFinalizandoLactancia] = useState(false);

  const [errorFinalizarLactancia, setErrorFinalizarLactancia] = useState("");

  /* =========================================================
   ESTADOS: HISTORIAL DE UNA LACTANCIA
========================================================= */

  const [lactanciaHistorialSeleccionada, setLactanciaHistorialSeleccionada] =
    useState(null);

  const [produccionLactanciaHistorial, setProduccionLactanciaHistorial] =
    useState(null);

  const [cargandoHistorialLactancia, setCargandoHistorialLactancia] =
    useState(false);

  const [errorHistorialLactancia, setErrorHistorialLactancia] = useState("");

  /* =========================================================
     CARGA INICIAL DEL ANIMAL
  ========================================================= */

  useEffect(() => {
    const cargarAnimal = async () => {
      try {
        const respuesta = await obtenerAnimalPorId(id);

        console.log("Animal:", respuesta);

        if (respuesta?.animal) {
          setAnimal(respuesta.animal);
        } else {
          setAnimal(respuesta);
        }
      } catch (error) {
        console.error("Error cargando animal:", error);

        setError("No fue posible cargar el animal.");
      } finally {
        setCargando(false);
      }
    };

    cargarAnimal();
  }, [id]);

  /* =========================================================
     PESAJES: CARGA DE INFORMACIÓN
  ========================================================= */

  const cargarPesajes = async () => {
    try {
      setCargandoPesajes(true);

      const respuesta = await obtenerPesajesAnimal(id);

      console.log("Pesajes:", respuesta);

      if (Array.isArray(respuesta)) {
        setPesajes(respuesta);
      } else if (Array.isArray(respuesta?.pesajes)) {
        setPesajes(respuesta.pesajes);
      } else {
        setPesajes([]);
      }
    } catch (error) {
      console.error("Error cargando pesajes:", error);
    } finally {
      setCargandoPesajes(false);
    }
  };

  /* =========================================================
   LECHE: CARGA DE INFORMACIÓN
========================================================= */

  const cargarLeche = async (fechaReferencia = fechaConsultaLeche) => {
    try {
      setCargandoLeche(true);

      setErrorLeche("");

      /*
      El historial de lactancias no depende
      de la fecha que estamos consultando.
    */
      const [respuestaLactancias, respuestaComparacion] = await Promise.all([
        obtenerLactancias(id),

        compararLactancias(id),
      ]);

      const listaLactancias = Array.isArray(respuestaLactancias?.lactancias)
        ? respuestaLactancias.lactancias
        : Array.isArray(respuestaLactancias)
          ? respuestaLactancias
          : [];

      setLactancias(listaLactancias);

      setComparacionLactancias(respuestaComparacion || null);

      /*
      Para consultar producción necesitamos
      que exista una lactancia activa.
    */
      const tieneLactanciaActiva = listaLactancias.some(
        (lactancia) => lactancia.estado === "activa",
      );

      if (tieneLactanciaActiva) {
        /*
        Enviamos al backend la fecha seleccionada.

        Ejemplo:
        ?fecha=2027-08-01
      */
        const respuestaProduccion = await obtenerProduccionLeche(
          id,
          fechaReferencia,
        );

        setProduccionLeche(respuestaProduccion);
      } else {
        setProduccionLeche(null);
      }
    } catch (error) {
      console.error("Error cargando leche:", error);

      setErrorLeche(
        error.response?.data?.message ||
          "No fue posible cargar la información de leche.",
      );
    } finally {
      setCargandoLeche(false);
    }
  };

  /* =========================================================
   LECHE: CAMBIAR FECHA DE CONSULTA
========================================================= */

  const manejarCambioFechaLeche = async (e) => {
    const nuevaFecha = e.target.value;

    if (!nuevaFecha) {
      return;
    }

    setFechaConsultaLeche(nuevaFecha);

    /*
    Recargamos los indicadores usando
    inmediatamente la nueva fecha.
  */
    await cargarLeche(nuevaFecha);
  };

  /* =========================================================
   LECHE: REGISTRAR ORDEÑO
========================================================= */

  const manejarCambioOrdenio = (e) => {
    const { name, value } = e.target;

    setFormOrdenio((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const manejarRegistrarOrdenio = async (e) => {
    e.preventDefault();

    setErrorLeche("");
    setMensajeLeche("");

    const litros = Number(formOrdenio.litros);

    if (!Number.isFinite(litros) || litros <= 0) {
      setErrorLeche("La cantidad de litros debe ser mayor que cero.");

      return;
    }

    if (!formOrdenio.turno) {
      setErrorLeche("Selecciona el turno del ordeño.");

      return;
    }

    try {
      setGuardandoOrdenio(true);

      const datos = {
        litros,

        turno: formOrdenio.turno,

        ...(formOrdenio.fecha_ordenio && {
          fecha_ordenio: formOrdenio.fecha_ordenio,
        }),

        ...(formOrdenio.observacion.trim() && {
          observacion: formOrdenio.observacion.trim(),
        }),
      };

      const respuesta = await registrarOrdenio(id, datos);

      /*
      Volvemos a consultar toda la producción
      para actualizar los totales automáticamente.
    */
      /*
        Si el usuario registró el ordeño con una fecha,
        hacemos que los indicadores salten automáticamente
        a ese día.
      */
      let fechaRegistro = formOrdenio.fecha_ordenio;

      if (!fechaRegistro) {
        const hoy = new Date();

        const anio = hoy.getFullYear();

        const mes = String(hoy.getMonth() + 1).padStart(2, "0");

        const dia = String(hoy.getDate()).padStart(2, "0");

        fechaRegistro = `${anio}-${mes}-${dia}`;
      }

      setFechaConsultaLeche(fechaRegistro);

      await cargarLeche(fechaRegistro);

      setFormOrdenio({
        litros: "",
        turno: "manana",
        fecha_ordenio: "",
        observacion: "",
      });

      setMostrarFormularioOrdenio(false);

      setMensajeLeche(respuesta?.message || "Ordeño registrado correctamente.");
    } catch (error) {
      console.error("Error registrando ordeño:", error);

      setErrorLeche(
        error.response?.data?.message || "No fue posible registrar el ordeño.",
      );
    } finally {
      setGuardandoOrdenio(false);
    }
  };

  /* =========================================================
   LECHE: ABRIR CORRECCIÓN DE ORDEÑO
========================================================= */

  const abrirCorreccionRegistro = (registro) => {
    setRegistroCorreccion(registro);

    setErrorCorreccionLeche("");

    setFormCorreccionLeche({
      litros: String(registro.litros ?? ""),

      turno: registro.turno || "manana",

      fecha_ordenio: registro.fecha_ordenio
        ? String(registro.fecha_ordenio).slice(0, 10)
        : "",

      observacion: registro.observacion || "",

      motivo_correccion: "",
    });
  };

  /* =========================================================
   LECHE: CAMBIAR DATOS DE LA CORRECCIÓN
========================================================= */

  const manejarCambioCorreccionLeche = (e) => {
    const { name, value } = e.target;

    setFormCorreccionLeche((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* =========================================================
   LECHE: GUARDAR CORRECCIÓN
========================================================= */

  const manejarCorregirRegistroLeche = async (e) => {
    e.preventDefault();

    setErrorCorreccionLeche("");
    setMensajeLeche("");

    if (!registroCorreccion) {
      setErrorCorreccionLeche("No se ha seleccionado un ordeño.");

      return;
    }

    const litros = Number(formCorreccionLeche.litros);

    if (!Number.isFinite(litros) || litros <= 0) {
      setErrorCorreccionLeche("La cantidad de litros debe ser mayor que cero.");

      return;
    }

    if (!formCorreccionLeche.motivo_correccion.trim()) {
      setErrorCorreccionLeche("Debes indicar el motivo de la corrección.");

      return;
    }

    try {
      setCorrigiendoLeche(true);

      const datos = {
        litros,

        turno: formCorreccionLeche.turno,

        fecha_ordenio: formCorreccionLeche.fecha_ordenio,

        observacion: formCorreccionLeche.observacion.trim(),

        motivo_correccion: formCorreccionLeche.motivo_correccion.trim(),
      };

      const respuesta = await corregirRegistroLeche(
        id,
        registroCorreccion.id,
        datos,
      );

      await cargarLeche(fechaConsultaLeche);

      setRegistroCorreccion(null);

      setMensajeLeche(
        respuesta?.message || "Registro de ordeño corregido correctamente.",
      );
    } catch (error) {
      console.error("Error corrigiendo ordeño:", error);

      setErrorCorreccionLeche(
        error.response?.data?.message || "No fue posible corregir el ordeño.",
      );
    } finally {
      setCorrigiendoLeche(false);
    }
  };

  /* =========================================================
   LACTANCIA: ABRIR FINALIZACIÓN
========================================================= */

  const abrirFinalizarLactancia = () => {
    setErrorFinalizarLactancia("");

    const fechaInicio = produccionLeche?.lactancia?.fecha_inicio
      ? String(produccionLeche.lactancia.fecha_inicio).slice(0, 10)
      : "";

    /*
    Como estamos utilizando datos de prueba
    con fechas futuras, usamos la fecha consultada
    siempre que no sea anterior al inicio.
  */
    const fechaSugerida =
      fechaConsultaLeche && (!fechaInicio || fechaConsultaLeche >= fechaInicio)
        ? fechaConsultaLeche
        : fechaInicio;

    setFormFinalizarLactancia({
      fecha_fin: fechaSugerida,

      motivo_fin: "secado",

      observacion: "",
    });

    setMostrarFinalizarLactancia(true);
  };

  /* =========================================================
   LACTANCIA: CAMBIAR DATOS DE FINALIZACIÓN
========================================================= */

  const manejarCambioFinalizarLactancia = (e) => {
    const { name, value } = e.target;

    setFormFinalizarLactancia((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* =========================================================
   LACTANCIA: FINALIZAR
========================================================= */

  const manejarFinalizarLactancia = async (e) => {
    e.preventDefault();

    setErrorFinalizarLactancia("");
    setMensajeLeche("");

    const lactanciaId = produccionLeche?.lactancia?.id;

    if (!lactanciaId) {
      setErrorFinalizarLactancia("No existe una lactancia activa.");

      return;
    }

    if (!formFinalizarLactancia.motivo_fin) {
      setErrorFinalizarLactancia("Selecciona el motivo de finalización.");

      return;
    }

    try {
      setFinalizandoLactancia(true);

      const datos = {
        motivo_fin: formFinalizarLactancia.motivo_fin,

        ...(formFinalizarLactancia.fecha_fin && {
          fecha_fin: formFinalizarLactancia.fecha_fin,
        }),

        ...(formFinalizarLactancia.observacion.trim() && {
          observacion: formFinalizarLactancia.observacion.trim(),
        }),
      };

      const respuesta = await finalizarLactancia(id, lactanciaId, datos);

      setMostrarFinalizarLactancia(false);

      /*
      Volvemos a consultar.

      Al no existir ya lactancia activa,
      GANATEC dejará de mostrar el botón
      para registrar ordeños.
    */
      await cargarLeche(fechaConsultaLeche);

      setMensajeLeche(
        respuesta?.message || "Lactancia finalizada correctamente.",
      );
    } catch (error) {
      console.error("Error finalizando lactancia:", error);

      setErrorFinalizarLactancia(
        error.response?.data?.message ||
          "No fue posible finalizar la lactancia.",
      );
    } finally {
      setFinalizandoLactancia(false);
    }
  };

  /* =========================================================
     NAVEGACIÓN: CAMBIO DE PESTAÑA
  ========================================================= */

  const cambiarPestana = async (pestana) => {
    setPestanaActiva(pestana);

    if (pestana === "pesajes") {
      await cargarPesajes();
    }

    if (pestana === "salud") {
      await cargarSalud();
    }

    if (pestana === "reproduccion") {
      await cargarReproduccion();
    }

    if (pestana === "leche") {
      await cargarLeche();
    }
  };

  /* =========================================================
     PESAJES: FORMULARIO Y REGISTRO
  ========================================================= */

  const manejarCambioPesaje = (e) => {
    const { name, value } = e.target;

    setFormPesaje((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const manejarRegistrarPesaje = async (e) => {
    e.preventDefault();

    setErrorPesaje("");
    setMensajePesaje("");

    const peso = Number(formPesaje.peso_kg);

    if (!peso || peso <= 0) {
      setErrorPesaje("Ingresa un peso válido.");

      return;
    }

    try {
      setGuardandoPesaje(true);

      const datos = {
        peso_kg: peso,

        ...(formPesaje.fecha_pesaje && {
          fecha_pesaje: formPesaje.fecha_pesaje,
        }),

        ...(formPesaje.observacion.trim() && {
          observacion: formPesaje.observacion.trim(),
        }),
      };

      await registrarPesaje(id, datos);

      // Volver a cargar el historial
      await cargarPesajes();

      // Limpiar formulario
      setFormPesaje({
        peso_kg: "",
        fecha_pesaje: "",
        observacion: "",
      });

      setMostrarFormularioPesaje(false);

      setMensajePesaje("Pesaje registrado correctamente.");
    } catch (error) {
      console.error("Error registrando pesaje:", error);

      setErrorPesaje(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible registrar el pesaje.",
      );
    } finally {
      setGuardandoPesaje(false);
    }
  };

  /* =========================================================
     PESAJES: CÁLCULOS E INDICADORES
  ========================================================= */

  // Calcular resumen de los pesajes
  const pesajesOrdenados = [...pesajes].sort(
    (a, b) => new Date(b.fecha_pesaje) - new Date(a.fecha_pesaje),
  );

  const ultimoPesaje = pesajesOrdenados[0] || null;

  const pesajeAnterior = pesajesOrdenados[1] || null;

  const pesoActual = ultimoPesaje
    ? Number(ultimoPesaje.peso_kg ?? ultimoPesaje.peso ?? 0)
    : null;

  const pesoAnterior = pesajeAnterior
    ? Number(pesajeAnterior.peso_kg ?? pesajeAnterior.peso ?? 0)
    : null;

  const diferenciaPeso =
    pesoActual !== null && pesoAnterior !== null
      ? pesoActual - pesoAnterior
      : null;

  const diasEntrePesajes =
    ultimoPesaje && pesajeAnterior
      ? Math.round(
          (new Date(ultimoPesaje.fecha_pesaje) -
            new Date(pesajeAnterior.fecha_pesaje)) /
            (1000 * 60 * 60 * 24),
        )
      : null;

  const gananciaDiaria =
    diferenciaPeso !== null && diasEntrePesajes > 0
      ? diferenciaPeso / diasEntrePesajes
      : null;

  /* =========================================================
     SALUD: CARGA DE EVENTOS
  ========================================================= */

  const cargarSalud = async () => {
    try {
      setCargandoSalud(true);

      const respuesta = await obtenerEventosSalud(id);

      console.log("Eventos de salud:", respuesta);

      if (Array.isArray(respuesta?.eventos)) {
        setEventosSalud(respuesta.eventos);
      } else if (Array.isArray(respuesta)) {
        setEventosSalud(respuesta);
      } else {
        setEventosSalud([]);
      }
    } catch (error) {
      console.error("Error cargando salud:", error);
    } finally {
      setCargandoSalud(false);
    }
  };

  /* =========================================================
     SALUD: FORMULARIO Y REGISTRO
  ========================================================= */

  const manejarCambioSalud = (e) => {
    const { name, value } = e.target;

    setFormSalud((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const manejarRegistrarSalud = async (e) => {
    e.preventDefault();

    setErrorSalud("");
    setMensajeSalud("");

    if (!formSalud.tipo_evento || !formSalud.titulo.trim()) {
      setErrorSalud("El tipo de evento y el título son obligatorios.");

      return;
    }

    try {
      setGuardandoSalud(true);

      const datos = {
        tipo_evento: formSalud.tipo_evento,

        titulo: formSalud.titulo.trim(),

        ...(formSalud.descripcion.trim() && {
          descripcion: formSalud.descripcion.trim(),
        }),

        ...(formSalud.gravedad && {
          gravedad: formSalud.gravedad,
        }),

        ...(formSalud.fecha_evento && {
          fecha_evento: formSalud.fecha_evento,
        }),
      };

      await registrarEventoSalud(id, datos);

      // Actualizar historial
      await cargarSalud();

      // Limpiar formulario
      setFormSalud({
        tipo_evento: "",
        titulo: "",
        descripcion: "",
        gravedad: "",
        fecha_evento: "",
      });

      setMostrarFormularioSalud(false);

      setMensajeSalud("Evento de salud registrado correctamente.");
    } catch (error) {
      console.error("Error registrando evento de salud:", error);

      setErrorSalud(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible registrar el evento.",
      );
    } finally {
      setGuardandoSalud(false);
    }
  };

  /* =========================================================
   REPRODUCCIÓN: CARGA DE INFORMACIÓN

   Carga en conjunto:
   - servicios reproductivos
   - gestaciones
   - historial de partos
========================================================= */
  const cargarReproduccion = async () => {
    try {
      setCargandoReproduccion(true);

      setErrorReproduccion("");

      /*
      Consultamos en paralelo toda la información
      reproductiva del animal.
    */
      const [respuestaServicios, respuestaGestaciones, respuestaPartos] =
        await Promise.all([
          obtenerServiciosReproductivos(id),

          obtenerGestaciones(id),

          obtenerPartos(id),
        ]);

      /* =====================================================
       SERVICIOS REPRODUCTIVOS
    ===================================================== */

      if (Array.isArray(respuestaServicios?.servicios)) {
        setServiciosReproductivos(respuestaServicios.servicios);
      } else if (Array.isArray(respuestaServicios)) {
        setServiciosReproductivos(respuestaServicios);
      } else {
        setServiciosReproductivos([]);
      }

      /* =====================================================
       GESTACIONES
    ===================================================== */

      if (Array.isArray(respuestaGestaciones?.gestaciones)) {
        setGestaciones(respuestaGestaciones.gestaciones);
      } else if (Array.isArray(respuestaGestaciones)) {
        setGestaciones(respuestaGestaciones);
      } else {
        setGestaciones([]);
      }

      /* =====================================================
       HISTORIAL DE PARTOS
    ===================================================== */

      if (Array.isArray(respuestaPartos?.partos)) {
        setPartos(respuestaPartos.partos);
      } else if (Array.isArray(respuestaPartos)) {
        setPartos(respuestaPartos);
      } else {
        setPartos([]);
      }
    } catch (error) {
      console.error("Error cargando reproducción:", error);

      setErrorReproduccion(
        error.response?.data?.message ||
          "No fue posible cargar la información reproductiva.",
      );
    } finally {
      setCargandoReproduccion(false);
    }
  };

  /* =========================================================
   REPRODUCCIÓN: CARGAR REPRODUCTORES DISPONIBLES
========================================================= */

  const cargarReproductores = async () => {
    try {
      setCargandoReproductores(true);

      const respuesta = await obtenerAnimales();

      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.animales)
          ? respuesta.animales
          : [];

      console.log("Animales disponibles para reproducción:", lista);

      const machosActivos = lista.filter((animalLista) => {
        const sexo = String(animalLista.sexo || "")
          .trim()
          .toLowerCase();

        const estado = String(animalLista.estado || "")
          .trim()
          .toLowerCase();

        return sexo === "macho" && estado === "activo";
      });

      console.log("Machos activos encontrados:", machosActivos);

      setReproductoresDisponibles(machosActivos);
    } catch (error) {
      console.error("Error cargando reproductores:", error);

      setReproductoresDisponibles([]);
    } finally {
      setCargandoReproductores(false);
    }
  };

  /* =========================================================
   REPRODUCCIÓN: FORMULARIO DE SERVICIO
========================================================= */

  /*
  Actualiza automáticamente el campo correspondiente
  cuando el usuario escribe o selecciona una opción.

  Ejemplo:
  name="tipo_servicio"
  actualiza formServicioReproductivo.tipo_servicio.
*/
  const manejarCambioServicioReproductivo = (e) => {
    const { name, value } = e.target;

    setFormServicioReproductivo((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* =========================================================
   REGISTRAR SERVICIO REPRODUCTIVO

   Valida el formulario, prepara solamente los
   campos necesarios y envía la información al backend.

   Después actualiza automáticamente el historial
   reproductivo que aparece en pantalla.
========================================================= */
  const manejarRegistrarServicioReproductivo = async (e) => {
    e.preventDefault();

    /* Limpiar mensajes anteriores */
    setErrorServicioReproductivo("");
    setMensajeServicioReproductivo("");

    /* -----------------------------------------
       Validaciones básicas del formulario
    ----------------------------------------- */

    if (!formServicioReproductivo.tipo_servicio) {
      setErrorServicioReproductivo("Selecciona el tipo de servicio.");

      return;
    }

    /*
      El backend obliga a conocer el reproductor.

      Si seleccionamos reproductor externo,
      debemos escribir su identificación o nombre.
    */
    if (
      origenReproductor === "externo" &&
      !formServicioReproductivo.reproductor_externo.trim()
    ) {
      setErrorServicioReproductivo("Debes indicar el reproductor utilizado.");

      return;
    }

    /*
  Si el reproductor pertenece a GANATEC,
  es obligatorio seleccionar uno de la lista.
*/
    if (
      origenReproductor === "registrado" &&
      !formServicioReproductivo.reproductor_id
    ) {
      setErrorServicioReproductivo("Selecciona un reproductor registrado.");

      return;
    }

    try {
      setGuardandoServicioReproductivo(true);

      /* -----------------------------------------
         Construir los datos para el backend
      ----------------------------------------- */

      const datos = {
        tipo_servicio: formServicioReproductivo.tipo_servicio,

        /*
          La fecha es opcional en el backend.
          Si no se envía, PostgreSQL utiliza
          la fecha y hora actual.
        */
        ...(formServicioReproductivo.fecha_servicio && {
          fecha_servicio: formServicioReproductivo.fecha_servicio,
        }),

        /*
          Solo enviamos reproductor externo
          cuando esa fue la opción elegida.
        */
        ...(origenReproductor === "externo" && {
          reproductor_externo:
            formServicioReproductivo.reproductor_externo.trim(),
        }),

        /*
          Si seleccionamos un reproductor registrado,
          enviamos su ID al backend.

          Convertimos el valor del select a número
          porque los inputs HTML entregan texto.
        */
        ...(origenReproductor === "registrado" && {
          reproductor_id: Number(formServicioReproductivo.reproductor_id),
        }),

        /*
          Este campo es especialmente útil
          para inseminación artificial.
        */
        ...(formServicioReproductivo.codigo_semen.trim() && {
          codigo_semen: formServicioReproductivo.codigo_semen.trim(),
        }),

        ...(formServicioReproductivo.responsable.trim() && {
          responsable: formServicioReproductivo.responsable.trim(),
        }),

        ...(formServicioReproductivo.observacion.trim() && {
          observacion: formServicioReproductivo.observacion.trim(),
        }),
      };

      /* Registrar en PostgreSQL */
      await registrarServicioReproductivo(id, datos);

      /*
        Volvemos a consultar reproducción para que
        el nuevo servicio aparezca inmediatamente
        en la tabla sin recargar la página.
      */
      await cargarReproduccion();

      /* -----------------------------------------
         Limpiar formulario
      ----------------------------------------- */

      setFormServicioReproductivo({
        tipo_servicio: "",

        fecha_servicio: "",

        reproductor_id: "",

        reproductor_externo: "",

        codigo_semen: "",

        responsable: "",

        observacion: "",
      });

      setOrigenReproductor("externo");

      setMostrarFormularioServicio(false);

      setMensajeServicioReproductivo(
        "Servicio reproductivo registrado correctamente.",
      );
    } catch (error) {
      console.error("Error registrando servicio reproductivo:", error);

      /*
        Si el backend envía un mensaje específico,
        por ejemplo "el animal debe ser una hembra",
        mostramos exactamente ese mensaje.
      */
      setErrorServicioReproductivo(
        error.response?.data?.message ||
          "No fue posible registrar el servicio reproductivo.",
      );
    } finally {
      setGuardandoServicioReproductivo(false);
    }
  };

  /* =========================================================
   REPRODUCCIÓN: DIAGNÓSTICO DE GESTACIÓN
========================================================= */

  /*
  Actualiza automáticamente los campos
  del formulario de diagnóstico.
*/
  const manejarCambioDiagnostico = (e) => {
    const { name, value } = e.target;

    setFormDiagnostico((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /*
  Registra el diagnóstico del servicio seleccionado.

  Después de guardar volvemos a consultar reproducción,
  porque un resultado "prenada" puede crear automáticamente
  una nueva gestación en el backend.
*/
  const manejarRegistrarDiagnostico = async (e) => {
    e.preventDefault();

    setErrorDiagnostico("");
    setMensajeDiagnostico("");

    /* El resultado es obligatorio en el backend */
    if (!formDiagnostico.resultado) {
      setErrorDiagnostico("Selecciona el resultado del diagnóstico.");

      return;
    }

    if (!servicioDiagnostico) {
      setErrorDiagnostico("No se ha seleccionado un servicio reproductivo.");

      return;
    }

    try {
      setGuardandoDiagnostico(true);

      /*
      Solo enviamos campos opcionales cuando
      realmente tienen información.
    */
      const datos = {
        resultado: formDiagnostico.resultado,

        ...(formDiagnostico.fecha_diagnostico && {
          fecha_diagnostico: formDiagnostico.fecha_diagnostico,
        }),

        ...(formDiagnostico.metodo && {
          metodo: formDiagnostico.metodo,
        }),

        ...(formDiagnostico.responsable.trim() && {
          responsable: formDiagnostico.responsable.trim(),
        }),

        ...(formDiagnostico.observacion.trim() && {
          observacion: formDiagnostico.observacion.trim(),
        }),
      };

      const respuesta = await registrarDiagnosticoGestacion(
        id,
        servicioDiagnostico.id,
        datos,
      );

      /*
      Actualizamos servicios y gestaciones.

      Esto es especialmente importante si el resultado
      fue "prenada", porque el backend habrá creado
      automáticamente una nueva gestación.
    */
      await cargarReproduccion();

      /* Limpiar el formulario */
      setFormDiagnostico({
        fecha_diagnostico: "",
        resultado: "",
        metodo: "",
        responsable: "",
        observacion: "",
      });

      setServicioDiagnostico(null);

      /*
      Utilizamos el mensaje que devuelve el backend.

      Ejemplo:
      "Diagnóstico registrado y gestación creada correctamente".
    */
      setMensajeDiagnostico(
        respuesta?.message || "Diagnóstico registrado correctamente.",
      );
    } catch (error) {
      console.error("Error registrando diagnóstico de gestación:", error);

      setErrorDiagnostico(
        error.response?.data?.message ||
          "No fue posible registrar el diagnóstico.",
      );
    } finally {
      setGuardandoDiagnostico(false);
    }
  };

  /* =========================================================
   REPRODUCCIÓN: PARTO
========================================================= */

  /*
  Actualiza los datos generales del parto.
*/
  const manejarCambioParto = (e) => {
    const { name, value } = e.target;

    setFormParto((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /*
  Actualiza una cría específica dentro
  del arreglo de nacimientos.
*/
  const manejarCambioCria = (indice, e) => {
    const { name, value } = e.target;

    setFormParto((anterior) => {
      const nuevasCrias = [...anterior.crias];

      nuevasCrias[indice] = {
        ...nuevasCrias[indice],
        [name]: value,
      };

      return {
        ...anterior,
        crias: nuevasCrias,
      };
    });
  };

  /*
  Agrega otra cría al mismo parto.

  Esto permite registrar partos gemelares
  o múltiples.
*/
  const agregarCria = () => {
    setFormParto((anterior) => ({
      ...anterior,

      crias: [
        ...anterior.crias,

        {
          sexo: "",
          estado_nacimiento: "viva",
          peso_nacimiento_kg: "",
          identificacion_temporal: "",
          nombre: "",
          raza: "",
          observacion: "",
        },
      ],
    }));
  };

  /*
  Elimina una cría del formulario.

  Siempre debe quedar como mínimo una.
*/
  const quitarCria = (indice) => {
    setFormParto((anterior) => {
      if (anterior.crias.length === 1) {
        return anterior;
      }

      return {
        ...anterior,

        crias: anterior.crias.filter((_, posicion) => posicion !== indice),
      };
    });
  };

  /* =========================================================
   REGISTRAR PARTO
========================================================= */

  const manejarRegistrarParto = async (e) => {
    e.preventDefault();

    setErrorParto("");
    setMensajeParto("");

    if (!gestacionParto) {
      setErrorParto("No se ha seleccionado una gestación.");

      return;
    }

    /*
    Validamos cada nacimiento antes
    de enviarlo al backend.
  */
    for (const cria of formParto.crias) {
      if (!cria.sexo) {
        setErrorParto("Debes indicar el sexo de todas las crías.");

        return;
      }

      /*
      Una cría viva debe ser macho o hembra,
      porque GANATEC creará automáticamente
      su ficha como animal.
    */
      if (
        cria.estado_nacimiento === "viva" &&
        !["macho", "hembra"].includes(cria.sexo)
      ) {
        setErrorParto("Una cría viva debe indicar si es macho o hembra.");

        return;
      }
    }

    try {
      setGuardandoParto(true);

      const datos = {
        ...(formParto.fecha_parto && {
          fecha_parto: formParto.fecha_parto,
        }),

        tipo_parto: formParto.tipo_parto,

        ...(formParto.complicaciones.trim() && {
          complicaciones: formParto.complicaciones.trim(),
        }),

        ...(formParto.observacion.trim() && {
          observacion: formParto.observacion.trim(),
        }),

        /*
        Preparamos cada nacimiento para el backend.
      */
        crias: formParto.crias.map((cria) => ({
          sexo: cria.sexo,

          estado_nacimiento: cria.estado_nacimiento,

          ...(cria.peso_nacimiento_kg && {
            peso_nacimiento_kg: Number(cria.peso_nacimiento_kg),
          }),

          ...(cria.identificacion_temporal.trim() && {
            identificacion_temporal: cria.identificacion_temporal.trim(),
          }),

          ...(cria.nombre.trim() && {
            nombre: cria.nombre.trim(),
          }),

          ...(cria.raza.trim() && {
            raza: cria.raza.trim(),
          }),

          ...(cria.observacion.trim() && {
            observacion: cria.observacion.trim(),
          }),
        })),
      };

      const respuesta = await registrarParto(id, gestacionParto.id, datos);

      /*
      Recargamos toda la reproducción porque:
      - la gestación habrá finalizado;
      - aparecerá el parto;
      - se habrá creado una lactancia.
    */
      await cargarReproduccion();

      setFormParto({
        fecha_parto: "",

        tipo_parto: "normal",

        complicaciones: "",

        observacion: "",

        crias: [
          {
            sexo: "",
            estado_nacimiento: "viva",
            peso_nacimiento_kg: "",
            identificacion_temporal: "",
            nombre: "",
            raza: "",
            observacion: "",
          },
        ],
      });

      setGestacionParto(null);

      setMensajeParto(respuesta?.message || "Parto registrado correctamente.");
    } catch (error) {
      console.error("Error registrando parto:", error);

      setErrorParto(
        error.response?.data?.message || "No fue posible registrar el parto.",
      );
    } finally {
      setGuardandoParto(false);
    }
  };

  /* =========================================================
     SALUD: CIERRE DE EVENTOS
  ========================================================= */

  const manejarCerrarEvento = async (e) => {
    e.preventDefault();

    setErrorCierre("");

    if (!motivoCierre.trim()) {
      setErrorCierre("Debes indicar el motivo del cierre.");

      return;
    }

    try {
      setCerrandoEvento(true);

      await cerrarEventoSalud(id, eventoCerrar.id, motivoCierre.trim());

      // Volver a consultar el historial
      await cargarSalud();

      // Limpiar formulario
      setEventoCerrar(null);
      setMotivoCierre("");

      setMensajeSalud("Evento de salud cerrado correctamente.");
    } catch (error) {
      console.error("Error cerrando evento:", error);

      setErrorCierre(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible cerrar el evento.",
      );
    } finally {
      setCerrandoEvento(false);
    }
  };

  /* =========================================================
     TRATAMIENTOS: CARGA Y REGISTRO
  ========================================================= */

  /* Cargar tratamientos del evento seleccionado */
  const cargarTratamientos = async (evento) => {
    try {
      setEventoTratamientos(evento);

      setCargandoTratamientos(true);

      setErrorTratamiento("");

      const respuesta = await obtenerTratamientosEvento(id, evento.id);

      console.log("Tratamientos:", respuesta);

      if (Array.isArray(respuesta?.tratamientos)) {
        setTratamientos(respuesta.tratamientos);
      } else if (Array.isArray(respuesta)) {
        setTratamientos(respuesta);
      } else {
        setTratamientos([]);
      }
    } catch (error) {
      console.error("Error cargando tratamientos:", error);

      setTratamientos([]);

      setErrorTratamiento("No fue posible cargar los tratamientos.");
    } finally {
      setCargandoTratamientos(false);
    }
  };

  /* Actualizar campos del formulario */
  const manejarCambioTratamiento = (e) => {
    const { name, value } = e.target;

    setFormTratamiento((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* Registrar tratamiento */
  const manejarRegistrarTratamiento = async (e) => {
    e.preventDefault();

    setErrorTratamiento("");
    setMensajeTratamiento("");

    if (!formTratamiento.descripcion.trim()) {
      setErrorTratamiento("La descripción del tratamiento es obligatoria.");

      return;
    }

    try {
      setGuardandoTratamiento(true);

      const datos = {
        descripcion: formTratamiento.descripcion.trim(),

        ...(formTratamiento.fecha_inicio && {
          fecha_inicio: formTratamiento.fecha_inicio,
        }),

        ...(formTratamiento.fecha_fin && {
          fecha_fin: formTratamiento.fecha_fin,
        }),

        ...(formTratamiento.observacion.trim() && {
          observacion: formTratamiento.observacion.trim(),
        }),
      };

      await registrarTratamiento(id, eventoTratamientos.id, datos);

      // Actualizar tratamientos
      await cargarTratamientos(eventoTratamientos);

      // Limpiar formulario
      setFormTratamiento({
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        observacion: "",
      });

      setMostrarFormularioTratamiento(false);

      setMensajeTratamiento("Tratamiento registrado correctamente.");
    } catch (error) {
      console.error("Error registrando tratamiento:", error);

      setErrorTratamiento(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible registrar el tratamiento.",
      );
    } finally {
      setGuardandoTratamiento(false);
    }
  };

  /* =========================================================
     TRATAMIENTOS: CAMBIO DE ESTADO
  ========================================================= */

  /* Cambiar estado de un tratamiento */
  const manejarCambiarEstadoTratamiento = async (e) => {
    e.preventDefault();

    setErrorEstadoTratamiento("");

    if (!tratamientoEstado || !nuevoEstadoTratamiento) {
      setErrorEstadoTratamiento("Selecciona un estado.");

      return;
    }

    if (!motivoEstadoTratamiento.trim()) {
      setErrorEstadoTratamiento("Debes indicar el motivo del cambio.");

      return;
    }

    try {
      setCambiandoEstadoTratamiento(true);

      await cambiarEstadoTratamiento(
        id,
        eventoTratamientos.id,
        tratamientoEstado.id,
        nuevoEstadoTratamiento,
        motivoEstadoTratamiento.trim(),
      );

      // Actualizar lista
      await cargarTratamientos(eventoTratamientos);

      // Limpiar formulario
      setTratamientoEstado(null);

      setNuevoEstadoTratamiento("");

      setMotivoEstadoTratamiento("");

      setMensajeTratamiento(
        "Estado del tratamiento actualizado correctamente.",
      );
    } catch (error) {
      console.error("Error cambiando estado del tratamiento:", error);

      setErrorEstadoTratamiento(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible cambiar el estado del tratamiento.",
      );
    } finally {
      setCambiandoEstadoTratamiento(false);
    }
  };

  /* =========================================================
     MEDICAMENTOS: REGISTRO
  ========================================================= */

  /* Actualizar campos del medicamento */
  const manejarCambioMedicamento = (e) => {
    const { name, value } = e.target;

    setFormMedicamento((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  /* Registrar medicamento en el tratamiento */
  const manejarRegistrarMedicamento = async (e) => {
    e.preventDefault();

    setErrorMedicamento("");
    setMensajeMedicamento("");

    if (!formMedicamento.medicamento.trim()) {
      setErrorMedicamento("El nombre del medicamento es obligatorio.");

      return;
    }

    if (
      formMedicamento.duracion_dias &&
      Number(formMedicamento.duracion_dias) <= 0
    ) {
      setErrorMedicamento("La duración debe ser mayor que cero.");

      return;
    }

    try {
      setGuardandoMedicamento(true);

      const datos = {
        medicamento: formMedicamento.medicamento.trim(),

        ...(formMedicamento.dosis.trim() && {
          dosis: formMedicamento.dosis.trim(),
        }),

        ...(formMedicamento.frecuencia.trim() && {
          frecuencia: formMedicamento.frecuencia.trim(),
        }),

        ...(formMedicamento.via_administracion.trim() && {
          via_administracion: formMedicamento.via_administracion.trim(),
        }),

        ...(formMedicamento.duracion_dias && {
          duracion_dias: Number(formMedicamento.duracion_dias),
        }),

        ...(formMedicamento.observacion.trim() && {
          observacion: formMedicamento.observacion.trim(),
        }),
      };

      const respuesta = await agregarMedicamentoTratamiento(
        id,
        eventoTratamientos.id,
        tratamientoMedicamentos.id,
        datos,
      );

      /*
      El backend devuelve el medicamento
      recién creado en respuesta.medicamento.
    */
      if (respuesta?.medicamento) {
        setTratamientoMedicamentos((anterior) => ({
          ...anterior,

          medicamentos: [
            ...(Array.isArray(anterior?.medicamentos)
              ? anterior.medicamentos
              : []),

            respuesta.medicamento,
          ],
        }));
      }

      // Actualizar también la lista de tratamientos
      await cargarTratamientos(eventoTratamientos);

      // Limpiar formulario
      setFormMedicamento({
        medicamento: "",
        dosis: "",
        frecuencia: "",
        via_administracion: "",
        duracion_dias: "",
        observacion: "",
      });

      setMostrarFormularioMedicamento(false);

      setMensajeMedicamento("Medicamento agregado correctamente.");
    } catch (error) {
      console.error("Error agregando medicamento:", error);

      setErrorMedicamento(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "No fue posible agregar el medicamento.",
      );
    } finally {
      setGuardandoMedicamento(false);
    }
  };

  /* =========================================================
   LACTANCIA: CONSULTAR HISTORIAL DE ORDEÑOS
========================================================= */

  const abrirHistorialLactancia = async (lactancia) => {
    setLactanciaHistorialSeleccionada(lactancia);

    setProduccionLactanciaHistorial(null);

    setErrorHistorialLactancia("");

    try {
      setCargandoHistorialLactancia(true);

      const respuesta = await obtenerLecheLactancia(id, lactancia.id);

      setProduccionLactanciaHistorial(respuesta);
    } catch (error) {
      console.error("Error consultando historial de lactancia:", error);

      setErrorHistorialLactancia(
        error.response?.data?.message ||
          "No fue posible consultar los ordeños de esta lactancia.",
      );
    } finally {
      setCargandoHistorialLactancia(false);
    }
  };

  /* =========================================================
     RENDER DEL COMPONENTE
  ========================================================= */

  return (
    <DashboardLayout>
      <button className="boton-volver" onClick={() => navigate("/animales")}>
        <ArrowLeft size={17} />
        Volver a animales
      </button>

      {cargando && <div className="dashboard-panel">Cargando animal...</div>}

      {error && <div className="dashboard-error">{error}</div>}

      {!cargando && !error && animal && (
        <>
          {/* =====================================================
              ENCABEZADO DEL ANIMAL
          ===================================================== */}

          <section className="pagina-header">
            <div>
              <p className="dashboard-label">Ficha del animal</p>

              {/* =====================================================
                  NOMBRE DEL ANIMAL
              ===================================================== */}

              <div className="nombre-animal-linea">
                <h1>{animal.nombre || animal.identificacion}</h1>

                <button
                  type="button"
                  className="boton-editar-nombre"
                  onClick={() => {
                    setMensajeEdicion("");
                    setEditandoAnimal(true);
                  }}
                  title="Editar información del animal"
                >
                  <Pencil size={14} />
                  Editar información
                </button>
              </div>

              {mensajeEdicion && (
                <p className="mensaje-nombre-animal">{mensajeEdicion}</p>
              )}

              <EditarAnimalModal
                abierto={editandoAnimal}
                animal={animal}
                onClose={() => setEditandoAnimal(false)}
                onActualizado={(animalActualizado) => {
                  setAnimal(animalActualizado);
                  setEditandoAnimal(false);
                  setMensajeEdicion(
                    "Información del animal actualizada correctamente.",
                  );
                }}
              />

              <p>Identificación: {animal.identificacion}</p>
            </div>
          </section>

          {/* =====================================================
            RESUMEN GENERAL DEL ANIMAL
        ===================================================== */}

          <div className="animal-resumen">
            <div>
              <span>Sexo</span>

              <strong>{animal.sexo || "-"}</strong>
            </div>

            <div>
              <span>Raza</span>

              <strong>{animal.raza || "No registrada"}</strong>
            </div>

            <div>
              <span>Estado</span>

              <strong>{animal.estado || "-"}</strong>
            </div>

            <div>
              <span>Fecha de nacimiento</span>

              <strong>
                {animal.fecha_nacimiento
                  ? new Date(animal.fecha_nacimiento).toLocaleDateString(
                      "es-CO",
                    )
                  : "No registrada"}
              </strong>
            </div>
          </div>
          {/* =========================================================
                  PESTAÑAS DE LA FICHA DEL ANIMAL
              ========================================================= */}

          <div className="animal-tabs">
            <button
              className={
                pestanaActiva === "resumen" ? "animal-tab activo" : "animal-tab"
              }
              onClick={() => cambiarPestana("resumen")}
            >
              <LayoutDashboard size={17} />
              Resumen
            </button>

            <button
              className={
                pestanaActiva === "pesajes" ? "animal-tab activo" : "animal-tab"
              }
              onClick={() => cambiarPestana("pesajes")}
            >
              <Scale size={17} />
              Pesajes
            </button>

            <button
              type="button"
              className={
                pestanaActiva === "salud" ? "animal-tab activo" : "animal-tab"
              }
              onClick={() => cambiarPestana("salud")}
            >
              <HeartPulse size={17} />
              Salud
            </button>

            <button
              type="button"
              className={
                pestanaActiva === "reproduccion"
                  ? "animal-tab activo"
                  : "animal-tab"
              }
              onClick={() => cambiarPestana("reproduccion")}
            >
              <Dna size={17} />
              Reproducción
            </button>

            <button
              type="button"
              className={
                pestanaActiva === "leche" ? "animal-tab activo" : "animal-tab"
              }
              onClick={() => cambiarPestana("leche")}
            >
              <Milk size={17} />
              Leche
            </button>
          </div>

          {/* =========================================================
    CONTENIDO DE LAS PESTAÑAS
========================================================= */}

          <div className="animal-contenido">
            {/* -------------------------
                PESTAÑA: RESUMEN
            ------------------------- */}

            {pestanaActiva === "resumen" && (
              <div className="dashboard-panel">
                <h3>Resumen del animal</h3>

                <p>
                  Consulta la información general y selecciona una sección para
                  ver su historial.
                </p>
              </div>
            )}

            {/* -------------------------
                PESTAÑA: PESAJES
            ------------------------- */}

            {pestanaActiva === "pesajes" && (
              <div className="dashboard-panel">
                <div className="lista-header">
                  <div>
                    <h3>Historial de pesajes</h3>

                    <span>{pesajes.length} registros</span>
                  </div>

                  <div className="pesajes-resumen">
                    <div className="pesaje-indicador">
                      <span>Último peso</span>

                      <strong>
                        {pesoActual !== null
                          ? `${pesoActual.toFixed(1)} kg`
                          : "-"}
                      </strong>

                      <small>
                        {ultimoPesaje?.fecha_pesaje
                          ? new Date(
                              ultimoPesaje.fecha_pesaje,
                            ).toLocaleDateString("es-CO")
                          : "Sin registros"}
                      </small>
                    </div>

                    <div className="pesaje-indicador">
                      <span>Cambio</span>

                      <strong
                        className={
                          diferenciaPeso > 0
                            ? "peso-positivo"
                            : diferenciaPeso < 0
                              ? "peso-negativo"
                              : ""
                        }
                      >
                        {diferenciaPeso !== null
                          ? `${
                              diferenciaPeso > 0 ? "+" : ""
                            }${diferenciaPeso.toFixed(1)} kg`
                          : "-"}
                      </strong>

                      <small>Respecto al pesaje anterior</small>
                    </div>

                    <div className="pesaje-indicador">
                      <span>Tiempo entre pesajes</span>

                      <strong>
                        {diasEntrePesajes !== null
                          ? `${diasEntrePesajes} días`
                          : "-"}
                      </strong>

                      <small>Entre los últimos registros</small>
                    </div>

                    <div className="pesaje-indicador">
                      <span>Cambio diario</span>

                      <strong
                        className={
                          gananciaDiaria > 0
                            ? "peso-positivo"
                            : gananciaDiaria < 0
                              ? "peso-negativo"
                              : ""
                        }
                      >
                        {gananciaDiaria !== null
                          ? `${
                              gananciaDiaria > 0 ? "+" : ""
                            }${gananciaDiaria.toFixed(2)} kg/día`
                          : "-"}
                      </strong>

                      <small>Promedio entre pesajes</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="boton-principal"
                    onClick={() => setMostrarFormularioPesaje(true)}
                  >
                    <Plus size={17} />
                    Registrar pesaje
                  </button>
                </div>

                {mensajePesaje && (
                  <div className="mensaje-exito">{mensajePesaje}</div>
                )}

                <ModalGanatec
                  abierto={Boolean(mostrarFormularioPesaje)}
                  titulo="Registrar pesaje"
                  onClose={() => {
                    setMostrarFormularioPesaje(false);
                  }}
                >
                  {mostrarFormularioPesaje && (
                    <form
                      className="formulario-pesaje"
                      onSubmit={manejarRegistrarPesaje}
                    >
                      <div className="form-grid">
                        <div className="campo-formulario">
                          <label>Peso (kg)</label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="peso_kg"
                            placeholder="Ej: 355"
                            value={formPesaje.peso_kg}
                            onChange={manejarCambioPesaje}
                            required
                          />
                        </div>

                        <div className="campo-formulario">
                          <label>Fecha del pesaje</label>

                          <input
                            type="date"
                            name="fecha_pesaje"
                            value={formPesaje.fecha_pesaje}
                            onChange={manejarCambioPesaje}
                          />
                        </div>

                        <div className="campo-formulario campo-completo">
                          <label>Observación</label>

                          <input
                            type="text"
                            name="observacion"
                            placeholder="Ej: Buen estado corporal"
                            value={formPesaje.observacion}
                            onChange={manejarCambioPesaje}
                          />
                        </div>
                      </div>

                      {errorPesaje && (
                        <p className="formulario-error">{errorPesaje}</p>
                      )}

                      <div className="formulario-acciones">
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => setMostrarFormularioPesaje(false)}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="boton-principal"
                          disabled={guardandoPesaje}
                        >
                          {guardandoPesaje ? "Guardando..." : "Guardar pesaje"}
                        </button>
                      </div>
                    </form>
                  )}
                </ModalGanatec>

                {cargandoPesajes ? (
                  <p>Cargando pesajes...</p>
                ) : pesajes.length === 0 ? (
                  <p>Este animal no tiene pesajes registrados.</p>
                ) : (
                  <div className="tabla-contenedor">
                    <table className="tabla-ganatec">
                      <thead>
                        <tr>
                          <th>Fecha</th>

                          <th>Peso</th>

                          <th>Observación</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pesajes.map((pesaje) => (
                          <tr key={pesaje.id}>
                            <td>
                              {pesaje.fecha_pesaje
                                ? new Date(
                                    pesaje.fecha_pesaje,
                                  ).toLocaleDateString("es-CO")
                                : "-"}
                            </td>

                            <td>{pesaje.peso_kg ?? pesaje.peso ?? "-"} kg</td>

                            <td>{pesaje.observacion || "Sin observación"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------
                PESTAÑA: SALUD
            ------------------------- */}

            {pestanaActiva === "salud" && (
              <div className="dashboard-panel">
                {/* Encabezado */}

                <div className="lista-header">
                  <div>
                    <h3>Historial de salud</h3>

                    <span>{eventosSalud.length} eventos</span>
                  </div>

                  <button
                    type="button"
                    className="boton-principal"
                    onClick={() => setMostrarFormularioSalud(true)}
                  >
                    <Plus size={17} />
                    Registrar evento
                  </button>
                </div>

                {/* Mensaje de éxito */}

                {mensajeSalud && (
                  <div className="mensaje-exito">{mensajeSalud}</div>
                )}

                {/* Formulario para cerrar un evento abierto */}

                <ModalGanatec
                  abierto={Boolean(eventoCerrar)}
                  titulo="Cerrar evento de salud"
                  onClose={() => {
                    setEventoCerrar(null);
                    setMotivoCierre("");
                    setErrorCierre("");
                  }}
                >
                  {eventoCerrar && (
                    <form
                      className="formulario-cierre-salud"
                      onSubmit={manejarCerrarEvento}
                    >
                      <div>
                        <p className="dashboard-label">Cerrar evento</p>

                        <h4>{eventoCerrar.titulo}</h4>

                        <p>
                          Indica por qué se considera finalizado este evento de
                          salud.
                        </p>
                      </div>

                      <div className="campo-formulario">
                        <label>Motivo del cierre</label>

                        <textarea
                          rows="3"
                          placeholder="Ej: Animal recuperado y con apetito normal"
                          value={motivoCierre}
                          onChange={(e) => setMotivoCierre(e.target.value)}
                        />
                      </div>

                      {errorCierre && (
                        <p className="formulario-error">{errorCierre}</p>
                      )}

                      <div className="formulario-acciones">
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => {
                            setEventoCerrar(null);
                            setMotivoCierre("");
                            setErrorCierre("");
                          }}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="boton-principal"
                          disabled={cerrandoEvento}
                        >
                          {cerrandoEvento ? "Cerrando..." : "Cerrar evento"}
                        </button>
                      </div>
                    </form>
                  )}
                </ModalGanatec>

                {/* Formulario */}

                <ModalGanatec
                  abierto={Boolean(mostrarFormularioSalud)}
                  titulo="Registrar evento de salud"
                  onClose={() => {
                    setMostrarFormularioSalud(false);
                  }}
                >
                  {mostrarFormularioSalud && (
                    <form
                      className="formulario-salud"
                      onSubmit={manejarRegistrarSalud}
                    >
                      <div className="form-grid">
                        <div className="campo-formulario">
                          <label>Tipo de evento</label>

                          <select
                            name="tipo_evento"
                            value={formSalud.tipo_evento}
                            onChange={manejarCambioSalud}
                            required
                          >
                            <option value="" disabled>
                              Seleccionar
                            </option>

                            <option value="revision">Revisión</option>

                            <option value="sintoma">Síntoma</option>

                            <option value="diagnostico">Diagnóstico</option>

                            <option value="enfermedad">Enfermedad</option>

                            <option value="accidente">Accidente</option>

                            <option value="otro">Otro</option>
                          </select>
                        </div>

                        <div className="campo-formulario">
                          <label>Gravedad</label>

                          <select
                            name="gravedad"
                            value={formSalud.gravedad}
                            onChange={manejarCambioSalud}
                          >
                            <option value="">Sin especificar</option>

                            <option value="leve">Leve</option>

                            <option value="moderada">Moderada</option>

                            <option value="grave">Grave</option>
                          </select>
                        </div>

                        <div className="campo-formulario">
                          <label>Fecha</label>

                          <input
                            type="date"
                            name="fecha_evento"
                            value={formSalud.fecha_evento}
                            onChange={manejarCambioSalud}
                          />
                        </div>

                        <div className="campo-formulario">
                          <label>Título</label>

                          <input
                            type="text"
                            name="titulo"
                            placeholder="Ej: Pérdida de apetito"
                            value={formSalud.titulo}
                            onChange={manejarCambioSalud}
                            required
                          />
                        </div>

                        <div className="campo-formulario campo-completo">
                          <label>Descripción</label>

                          <textarea
                            name="descripcion"
                            placeholder="Describe lo ocurrido..."
                            value={formSalud.descripcion}
                            onChange={manejarCambioSalud}
                            rows="3"
                          />
                        </div>
                      </div>

                      {errorSalud && (
                        <p className="formulario-error">{errorSalud}</p>
                      )}

                      <div className="formulario-acciones">
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => setMostrarFormularioSalud(false)}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="boton-principal"
                          disabled={guardandoSalud}
                        >
                          {guardandoSalud ? "Guardando..." : "Guardar evento"}
                        </button>
                      </div>
                    </form>
                  )}
                </ModalGanatec>

                {/* =========================================
                        TRATAMIENTOS DEL EVENTO
                    ========================================= */}

                <ModalGanatec
                  abierto={Boolean(eventoTratamientos)}
                  titulo="Tratamientos del evento"
                  onClose={() => {
                    setEventoTratamientos(null);
                    setTratamientoMedicamentos(null);
                    setTratamientoEstado(null);
                    setMostrarFormularioTratamiento(false);
                    setMostrarFormularioMedicamento(false);
                  }}
                >
                  {eventoTratamientos && (
                    <div className="tratamientos-panel">
                      {/* Encabezado */}

                      <div className="tratamientos-header">
                        <div>
                          <p className="dashboard-label">Tratamientos</p>

                          <h4>{eventoTratamientos.titulo}</h4>

                          <span>
                            {tratamientos.length} tratamientos registrados
                          </span>
                        </div>

                        <button
                          type="button"
                          className="boton-cerrar"
                          onClick={() => {
                            setEventoTratamientos(null);

                            setMostrarFormularioTratamiento(false);

                            setErrorTratamiento("");
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Botón para crear tratamiento */}

                      {eventoTratamientos.estado === "abierto" && (
                        <div className="tratamientos-acciones">
                          <button
                            type="button"
                            className="boton-principal"
                            onClick={() =>
                              setMostrarFormularioTratamiento(true)
                            }
                          >
                            <Plus size={17} />
                            Nuevo tratamiento
                          </button>
                        </div>
                      )}

                      {/* Mensaje de éxito */}

                      {mensajeTratamiento && (
                        <div className="mensaje-exito">
                          {mensajeTratamiento}
                        </div>
                      )}

                      {/* Cambiar estado del tratamiento */}

                      {tratamientoEstado && (
                        <form
                          className="formulario-estado-tratamiento"
                          onSubmit={manejarCambiarEstadoTratamiento}
                        >
                          <div>
                            <p className="dashboard-label">Cambiar estado</p>

                            <h4>{tratamientoEstado.descripcion}</h4>

                            <p>
                              Estado actual:{" "}
                              <strong>{tratamientoEstado.estado}</strong>
                            </p>
                          </div>

                          <div className="form-grid">
                            <div className="campo-formulario">
                              <label>Nuevo estado</label>

                              <select
                                value={nuevoEstadoTratamiento}
                                onChange={(e) =>
                                  setNuevoEstadoTratamiento(e.target.value)
                                }
                                required
                              >
                                <option value="" disabled>
                                  Seleccionar
                                </option>

                                {tratamientoEstado.estado === "activo" && (
                                  <>
                                    <option value="finalizado">
                                      Finalizado
                                    </option>

                                    <option value="suspendido">
                                      Suspendido
                                    </option>
                                  </>
                                )}

                                {tratamientoEstado.estado === "suspendido" && (
                                  <option value="activo">Reactivar</option>
                                )}
                              </select>
                            </div>

                            <div className="campo-formulario campo-completo">
                              <label>Motivo</label>

                              <textarea
                                rows="3"
                                placeholder="Ej: Tratamiento completado según lo programado"
                                value={motivoEstadoTratamiento}
                                onChange={(e) =>
                                  setMotivoEstadoTratamiento(e.target.value)
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
                              disabled={cambiandoEstadoTratamiento}
                            >
                              {cambiandoEstadoTratamiento
                                ? "Actualizando..."
                                : "Actualizar estado"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Formulario */}

                      {mostrarFormularioTratamiento && (
                        <form
                          className="formulario-tratamiento"
                          onSubmit={manejarRegistrarTratamiento}
                        >
                          <div className="form-grid">
                            <div className="campo-formulario campo-completo">
                              <label>Tratamiento</label>

                              <input
                                type="text"
                                name="descripcion"
                                placeholder="Ej: Terapia antibiótica durante 5 días"
                                value={formTratamiento.descripcion}
                                onChange={manejarCambioTratamiento}
                                required
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Fecha de inicio</label>

                              <input
                                type="date"
                                name="fecha_inicio"
                                value={formTratamiento.fecha_inicio}
                                onChange={manejarCambioTratamiento}
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Fecha prevista de finalización</label>

                              <input
                                type="date"
                                name="fecha_fin"
                                value={formTratamiento.fecha_fin}
                                onChange={manejarCambioTratamiento}
                              />
                            </div>

                            <div className="campo-formulario campo-completo">
                              <label>Observaciones</label>

                              <textarea
                                rows="3"
                                name="observacion"
                                placeholder="Indicaciones u observaciones del tratamiento..."
                                value={formTratamiento.observacion}
                                onChange={manejarCambioTratamiento}
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
                              onClick={() =>
                                setMostrarFormularioTratamiento(false)
                              }
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

                      {/* =========================================
                          MEDICAMENTOS DEL TRATAMIENTO
                      ========================================= */}

                      {tratamientoMedicamentos && (
                        <div className="medicamentos-panel">
                          {/* Encabezado */}

                          <div className="medicamentos-header">
                            <div>
                              <p className="dashboard-label">Medicamentos</p>

                              <h4>{tratamientoMedicamentos.descripcion}</h4>

                              <span>
                                {Array.isArray(
                                  tratamientoMedicamentos.medicamentos,
                                )
                                  ? tratamientoMedicamentos.medicamentos.length
                                  : 0}{" "}
                                medicamentos registrados
                              </span>
                            </div>

                            <button
                              type="button"
                              className="boton-cerrar"
                              onClick={() => {
                                setTratamientoMedicamentos(null);

                                setMostrarFormularioMedicamento(false);

                                setErrorMedicamento("");
                                setMensajeMedicamento("");
                              }}
                            >
                              ×
                            </button>
                          </div>

                          {/* Solo tratamientos activos pueden recibir medicamentos */}

                          {tratamientoMedicamentos.estado === "activo" && (
                            <div className="medicamentos-acciones">
                              <button
                                type="button"
                                className="boton-principal"
                                onClick={() =>
                                  setMostrarFormularioMedicamento(true)
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

                          {/* FORMULARIO */}

                          {mostrarFormularioMedicamento && (
                            <form
                              className="formulario-medicamento"
                              onSubmit={manejarRegistrarMedicamento}
                            >
                              <div className="form-grid">
                                <div className="campo-formulario">
                                  <label>Medicamento</label>

                                  <input
                                    type="text"
                                    name="medicamento"
                                    placeholder="Ej: Oxitetraciclina"
                                    value={formMedicamento.medicamento}
                                    onChange={manejarCambioMedicamento}
                                    required
                                  />
                                </div>

                                <div className="campo-formulario">
                                  <label>Dosis</label>

                                  <input
                                    type="text"
                                    name="dosis"
                                    placeholder="Ej: 10 ml"
                                    value={formMedicamento.dosis}
                                    onChange={manejarCambioMedicamento}
                                  />
                                </div>

                                <div className="campo-formulario">
                                  <label>Frecuencia</label>

                                  <input
                                    type="text"
                                    name="frecuencia"
                                    placeholder="Ej: Cada 24 horas"
                                    value={formMedicamento.frecuencia}
                                    onChange={manejarCambioMedicamento}
                                  />
                                </div>

                                <div className="campo-formulario">
                                  <label>Vía de administración</label>

                                  <input
                                    type="text"
                                    name="via_administracion"
                                    placeholder="Ej: Intramuscular"
                                    value={formMedicamento.via_administracion}
                                    onChange={manejarCambioMedicamento}
                                  />
                                </div>

                                <div className="campo-formulario">
                                  <label>Duración (días)</label>

                                  <input
                                    type="number"
                                    min="1"
                                    name="duracion_dias"
                                    placeholder="Ej: 5"
                                    value={formMedicamento.duracion_dias}
                                    onChange={manejarCambioMedicamento}
                                  />
                                </div>

                                <div className="campo-formulario campo-completo">
                                  <label>Observaciones</label>

                                  <textarea
                                    rows="3"
                                    name="observacion"
                                    placeholder="Indicaciones adicionales..."
                                    value={formMedicamento.observacion}
                                    onChange={manejarCambioMedicamento}
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
                                    setMostrarFormularioMedicamento(false);

                                    setErrorMedicamento("");
                                  }}
                                >
                                  Cancelar
                                </button>

                                <button
                                  type="submit"
                                  className="boton-principal"
                                  disabled={guardandoMedicamento}
                                >
                                  {guardandoMedicamento
                                    ? "Guardando..."
                                    : "Guardar medicamento"}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* MEDICAMENTOS REGISTRADOS */}

                          {Array.isArray(
                            tratamientoMedicamentos.medicamentos,
                          ) &&
                          tratamientoMedicamentos.medicamentos.length > 0 ? (
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
                                  {tratamientoMedicamentos.medicamentos.map(
                                    (medicamento) => (
                                      <tr key={medicamento.id}>
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

                                        <td>{medicamento.dosis || "-"}</td>

                                        <td>{medicamento.frecuencia || "-"}</td>

                                        <td>
                                          {medicamento.via_administracion ||
                                            "-"}
                                        </td>

                                        <td>
                                          {medicamento.duracion_dias
                                            ? `${medicamento.duracion_dias} días`
                                            : "-"}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="texto-secundario">
                              Este tratamiento no tiene medicamentos
                              registrados.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Historial de tratamientos */}

                      {cargandoTratamientos ? (
                        <p>Cargando tratamientos...</p>
                      ) : tratamientos.length === 0 ? (
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
                              {tratamientos.map((tratamiento) => (
                                <tr key={tratamiento.id}>
                                  <td>
                                    <strong>{tratamiento.descripcion}</strong>

                                    {tratamiento.observacion && (
                                      <div className="descripcion-tabla">
                                        {tratamiento.observacion}
                                      </div>
                                    )}
                                  </td>

                                  <td>
                                    {tratamiento.fecha_inicio
                                      ? new Date(
                                          tratamiento.fecha_inicio,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    {tratamiento.fecha_fin
                                      ? new Date(
                                          tratamiento.fecha_fin,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    <span
                                      className={`estado-tratamiento ${
                                        tratamiento.estado
                                      }`}
                                    >
                                      {tratamiento.estado}
                                    </span>
                                  </td>

                                  <td>
                                    <div className="acciones-tabla">
                                      {tratamiento.estado !== "finalizado" ? (
                                        <button
                                          type="button"
                                          className="boton-tabla"
                                          onClick={() => {
                                            setTratamientoEstado(tratamiento);

                                            setNuevoEstadoTratamiento("");

                                            setMotivoEstadoTratamiento("");

                                            setErrorEstadoTratamiento("");
                                          }}
                                        >
                                          Cambiar estado
                                        </button>
                                      ) : (
                                        <span className="texto-secundario">
                                          Completado
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        className="boton-tabla"
                                        onClick={() => {
                                          setTratamientoMedicamentos(
                                            tratamiento,
                                          );

                                          setMostrarFormularioMedicamento(
                                            false,
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </ModalGanatec>

                {/* Historial */}

                {cargandoSalud ? (
                  <p>Cargando eventos de salud...</p>
                ) : eventosSalud.length === 0 ? (
                  <p>Este animal no tiene eventos de salud registrados.</p>
                ) : (
                  <div className="tabla-contenedor">
                    <table className="tabla-ganatec">
                      <thead>
                        <tr>
                          <th>Fecha</th>

                          <th>Tipo</th>

                          <th>Evento</th>

                          <th>Gravedad</th>

                          <th>Estado</th>

                          <th>Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {eventosSalud.map((evento) => (
                          <tr key={evento.id}>
                            <td>
                              {evento.fecha_evento
                                ? new Date(
                                    evento.fecha_evento,
                                  ).toLocaleDateString("es-CO")
                                : "-"}
                            </td>

                            <td className="texto-capitalizado">
                              {evento.tipo_evento}
                            </td>

                            <td>
                              <strong>{evento.titulo}</strong>

                              {evento.descripcion && (
                                <div className="descripcion-tabla">
                                  {evento.descripcion}
                                </div>
                              )}
                            </td>

                            <td>
                              <span
                                className={`gravedad-salud ${
                                  evento.gravedad || ""
                                }`}
                              >
                                {evento.gravedad || "Sin especificar"}
                              </span>
                            </td>

                            <td>
                              <span className={`estado-salud ${evento.estado}`}>
                                {evento.estado}
                              </span>
                            </td>

                            <td>
                              <div className="acciones-tabla">
                                {evento.estado === "abierto" ? (
                                  <button
                                    type="button"
                                    className="boton-tabla"
                                    onClick={() => {
                                      setEventoCerrar(evento);

                                      setMotivoCierre("");
                                      setErrorCierre("");
                                    }}
                                  >
                                    Cerrar
                                  </button>
                                ) : (
                                  <span className="texto-secundario">
                                    Finalizado
                                  </span>
                                )}

                                <button
                                  type="button"
                                  className="boton-tabla"
                                  onClick={() => cargarTratamientos(evento)}
                                >
                                  Tratamientos
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
            )}

            {/* -------------------------
                PESTAÑA: REPRODUCCIÓN
            ------------------------- */}

            {pestanaActiva === "reproduccion" && (
              <div className="dashboard-panel">
                {/* Encabezado de la sección de reproducción */}
                <div className="lista-header">
                  <div>
                    <h3>Reproducción</h3>

                    <span>Historial reproductivo del animal</span>
                  </div>

                  {/* Abre el formulario para registrar un servicio */}
                  <button
                    type="button"
                    className="boton-principal"
                    onClick={async () => {
                      /*
                        Abrimos el formulario y limpiamos
                        los mensajes de intentos anteriores.
                      */
                      setMostrarFormularioServicio(true);

                      setErrorServicioReproductivo("");
                      setMensajeServicioReproductivo("");

                      /*
                        Cargamos los machos activos de la finca
                        para tenerlos disponibles en el selector.
                      */
                      await cargarReproductores();
                    }}
                  >
                    <Plus size={17} />
                    Registrar servicio
                  </button>
                </div>

                {/* Confirmación después de registrar correctamente */}
                {mensajeServicioReproductivo && (
                  <div className="mensaje-reproduccion">
                    {mensajeServicioReproductivo}
                  </div>
                )}

                {/* Resultado del registro de diagnóstico */}
                {mensajeDiagnostico && (
                  <div className="mensaje-reproduccion">
                    {mensajeDiagnostico}
                  </div>
                )}

                {errorReproduccion && (
                  <p className="formulario-error">{errorReproduccion}</p>
                )}

                {/* ======================================================
                    FORMULARIO PARA REGISTRAR SERVICIO REPRODUCTIVO
                ====================================================== */}

                <ModalGanatec
                  abierto={Boolean(mostrarFormularioServicio)}
                  titulo="Registrar servicio reproductivo"
                  onClose={() => {
                    setMostrarFormularioServicio(false);
                  }}
                >
                  {mostrarFormularioServicio && (
                    <form
                      className="formulario-reproduccion"
                      onSubmit={manejarRegistrarServicioReproductivo}
                    >
                      {/* Encabezado del formulario */}
                      <div className="formulario-reproduccion-header">
                        <div>
                          <p className="dashboard-label">Nuevo servicio</p>

                          <h4>Registrar servicio reproductivo</h4>

                          <span>
                            Registra una inseminación artificial o monta
                            natural.
                          </span>
                        </div>

                        {/* Cierra el formulario sin guardar */}
                        <button
                          type="button"
                          className="boton-cerrar"
                          onClick={() => setMostrarFormularioServicio(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="form-grid">
                        {/* Tipo de servicio */}
                        <div className="campo-formulario">
                          <label>Tipo de servicio</label>

                          <select
                            name="tipo_servicio"
                            value={formServicioReproductivo.tipo_servicio}
                            onChange={manejarCambioServicioReproductivo}
                          >
                            <option value="" disabled>
                              Seleccionar
                            </option>

                            <option value="inseminacion_artificial">
                              Inseminación artificial
                            </option>

                            <option value="monta_natural">Monta natural</option>
                          </select>
                        </div>

                        {/* Fecha en que se realizó el servicio */}
                        <div className="campo-formulario">
                          <label>Fecha del servicio</label>

                          <input
                            type="date"
                            name="fecha_servicio"
                            value={formServicioReproductivo.fecha_servicio}
                            onChange={manejarCambioServicioReproductivo}
                          />
                        </div>

                        {/* ------------------------------------------------------
                            ORIGEN DEL REPRODUCTOR

                            El usuario debe indicar si el reproductor
                            está registrado en GANATEC o es externo.
                        ------------------------------------------------------ */}

                        <div className="campo-formulario">
                          <label>Origen del reproductor</label>

                          <select
                            value={origenReproductor}
                            onChange={async (e) => {
                              const nuevoOrigen = e.target.value;

                              /*
                              Guardamos el tipo de reproductor seleccionado:
                              registrado en GANATEC o externo.
                            */
                              setOrigenReproductor(nuevoOrigen);
                              setFormServicioReproductivo((anterior) => ({
                                ...anterior,

                                reproductor_id: "",

                                reproductor_externo: "",
                              }));

                              /*
                              Si el usuario selecciona un reproductor
                              registrado en GANATEC, consultamos nuevamente
                              los animales de la finca.

                              Así siempre tendremos actualizada la lista
                              de machos activos disponibles.
                            */
                              if (nuevoOrigen === "registrado") {
                                await cargarReproductores();
                              }
                            }}
                          >
                            <option value="externo">Reproductor externo</option>

                            <option value="registrado">
                              Registrado en GANATEC
                            </option>
                          </select>
                        </div>

                        {/* ------------------------------------------------------
                          REPRODUCTOR REGISTRADO EN GANATEC

                          Este selector aparece únicamente cuando
                          el usuario elige un reproductor de la finca.
                      ------------------------------------------------------ */}

                        {origenReproductor === "registrado" && (
                          <div className="campo-formulario">
                            <label>Reproductor registrado</label>

                            <select
                              name="reproductor_id"
                              value={formServicioReproductivo.reproductor_id}
                              onChange={manejarCambioServicioReproductivo}
                              required
                            >
                              <option value="" disabled>
                                {cargandoReproductores
                                  ? "Cargando reproductores..."
                                  : "Seleccionar reproductor"}
                              </option>

                              {reproductoresDisponibles.map((reproductor) => (
                                <option
                                  key={reproductor.id}
                                  value={reproductor.id}
                                >
                                  {reproductor.nombre || "Sin nombre"}

                                  {" - "}

                                  {reproductor.identificacion}

                                  {reproductor.raza
                                    ? ` - ${reproductor.raza}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            {/*
                            Si no existen machos activos en la finca,
                            informamos al usuario.
                          */}
                            {!cargandoReproductores &&
                              reproductoresDisponibles.length === 0 && (
                                <small className="texto-secundario">
                                  No hay reproductores machos activos
                                  registrados.
                                </small>
                              )}
                          </div>
                        )}

                        {/* El reproductor no está registrado en GANATEC */}

                        {origenReproductor === "externo" && (
                          <div className="campo-formulario">
                            <label>Reproductor externo</label>

                            <input
                              type="text"
                              name="reproductor_externo"
                              placeholder="Ej: Toro Brahman BR-125"
                              value={
                                formServicioReproductivo.reproductor_externo
                              }
                              onChange={manejarCambioServicioReproductivo}
                              required
                            />
                          </div>
                        )}

                        {formServicioReproductivo.tipo_servicio ===
                          "inseminacion_artificial" && (
                          <div className="campo-formulario">
                            <label>Código de semen</label>

                            <input
                              type="text"
                              name="codigo_semen"
                              placeholder="Ej: SEM-BR-2026-001"
                              value={formServicioReproductivo.codigo_semen}
                              onChange={manejarCambioServicioReproductivo}
                            />
                          </div>
                        )}

                        {/* Persona responsable */}
                        <div className="campo-formulario">
                          <label>Responsable</label>

                          <input
                            type="text"
                            name="responsable"
                            placeholder="Persona que realizó el servicio"
                            value={formServicioReproductivo.responsable}
                            onChange={manejarCambioServicioReproductivo}
                          />
                        </div>

                        {/* Información adicional */}
                        <div className="campo-formulario campo-completo">
                          <label>Observación</label>

                          <textarea
                            rows="3"
                            name="observacion"
                            placeholder="Información adicional del servicio..."
                            value={formServicioReproductivo.observacion}
                            onChange={manejarCambioServicioReproductivo}
                          />
                        </div>
                      </div>

                      {/* Error propio del formulario */}
                      {errorServicioReproductivo && (
                        <p className="formulario-error">
                          {errorServicioReproductivo}
                        </p>
                      )}

                      <div className="formulario-acciones">
                        {/* Cancelar */}
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => setMostrarFormularioServicio(false)}
                        >
                          Cancelar
                        </button>

                        {/* Envía el formulario al backend */}
                        <button
                          type="submit"
                          className="boton-principal"
                          disabled={guardandoServicioReproductivo}
                        >
                          {guardandoServicioReproductivo
                            ? "Guardando..."
                            : "Guardar servicio"}
                        </button>
                      </div>
                    </form>
                  )}
                </ModalGanatec>

                {/* ======================================================
                  DIAGNÓSTICO DE GESTACIÓN

                  Se muestra únicamente cuando el usuario pulsa
                  "Diagnóstico" sobre un servicio reproductivo.
               ====================================================== */}

                <ModalGanatec
                  abierto={Boolean(servicioDiagnostico)}
                  titulo="Registrar diagnóstico"
                  onClose={() => {
                    setServicioDiagnostico(null);
                  }}
                >
                  {servicioDiagnostico && (
                    <form
                      className="formulario-diagnostico"
                      onSubmit={manejarRegistrarDiagnostico}
                    >
                      {/* Encabezado del diagnóstico */}
                      <div className="formulario-diagnostico-header">
                        <div>
                          <p className="dashboard-label">
                            Diagnóstico de gestación
                          </p>

                          <h4>Registrar diagnóstico</h4>

                          <span>
                            Servicio del{" "}
                            {servicioDiagnostico.fecha_servicio
                              ? new Date(
                                  servicioDiagnostico.fecha_servicio,
                                ).toLocaleDateString("es-CO", {
                                  timeZone: "UTC",
                                })
                              : "sin fecha"}
                          </span>
                        </div>

                        {/* Cerrar formulario */}
                        <button
                          type="button"
                          className="boton-cerrar"
                          onClick={() => {
                            setServicioDiagnostico(null);

                            setErrorDiagnostico("");
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <div className="form-grid">
                        {/* Fecha del diagnóstico */}
                        <div className="campo-formulario">
                          <label>Fecha del diagnóstico</label>

                          <input
                            type="date"
                            name="fecha_diagnostico"
                            value={formDiagnostico.fecha_diagnostico}
                            onChange={manejarCambioDiagnostico}
                          />
                        </div>

                        {/* Resultado obligatorio */}
                        <div className="campo-formulario">
                          <label>Resultado</label>

                          <select
                            name="resultado"
                            value={formDiagnostico.resultado}
                            onChange={manejarCambioDiagnostico}
                            required
                          >
                            <option value="" disabled>
                              Seleccionar
                            </option>

                            <option value="prenada">Preñada</option>

                            <option value="vacia">Vacía</option>

                            <option value="dudosa">Dudosa</option>
                          </select>
                        </div>

                        {/* Método utilizado */}
                        <div className="campo-formulario">
                          <label>Método</label>

                          <select
                            name="metodo"
                            value={formDiagnostico.metodo}
                            onChange={manejarCambioDiagnostico}
                          >
                            <option value="">Sin especificar</option>

                            <option value="palpacion">Palpación</option>

                            <option value="ecografia">Ecografía</option>

                            <option value="otro">Otro</option>
                          </select>
                        </div>

                        {/* Persona que realizó el diagnóstico */}
                        <div className="campo-formulario">
                          <label>Responsable</label>

                          <input
                            type="text"
                            name="responsable"
                            placeholder="Ej: Médico veterinario"
                            value={formDiagnostico.responsable}
                            onChange={manejarCambioDiagnostico}
                          />
                        </div>

                        {/* Observaciones adicionales */}
                        <div className="campo-formulario campo-completo">
                          <label>Observación</label>

                          <textarea
                            rows="3"
                            name="observacion"
                            placeholder="Información adicional del diagnóstico..."
                            value={formDiagnostico.observacion}
                            onChange={manejarCambioDiagnostico}
                          />
                        </div>
                      </div>

                      {/* Error del diagnóstico */}
                      {errorDiagnostico && (
                        <p className="formulario-error">{errorDiagnostico}</p>
                      )}

                      <div className="formulario-acciones">
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => {
                            setServicioDiagnostico(null);

                            setErrorDiagnostico("");
                          }}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="boton-principal"
                          disabled={guardandoDiagnostico}
                        >
                          {guardandoDiagnostico
                            ? "Guardando..."
                            : "Guardar diagnóstico"}
                        </button>
                      </div>
                    </form>
                  )}
                </ModalGanatec>

                {cargandoReproduccion ? (
                  <p>Cargando información reproductiva...</p>
                ) : (
                  <>
                    {/* =========================
                                           RESUMEN
                      ========================= */}

                    <div className="reproduccion-resumen">
                      <div>
                        <span>Servicios</span>

                        <strong>{serviciosReproductivos.length}</strong>

                        <small>Registrados</small>
                      </div>

                      <div>
                        <span>Gestaciones</span>

                        <strong>{gestaciones.length}</strong>

                        <small>Históricas</small>
                      </div>

                      <div>
                        <span>Gestación activa</span>

                        <strong>
                          {gestaciones.some(
                            (gestacion) => gestacion.estado === "activa",
                          )
                            ? "Sí"
                            : "No"}
                        </strong>

                        <small>Estado actual</small>
                      </div>
                    </div>

                    {/* =========================
                              SERVICIOS REPRODUCTIVOS
                          ========================= */}

                    <div className="seccion-reproduccion">
                      <h4>Servicios reproductivos</h4>

                      {serviciosReproductivos.length === 0 ? (
                        <p className="texto-secundario">
                          No hay servicios reproductivos registrados.
                        </p>
                      ) : (
                        <div className="tabla-contenedor">
                          <table className="tabla-ganatec">
                            <thead>
                              <tr>
                                <th>Fecha</th>

                                <th>Tipo</th>

                                <th>Reproductor</th>

                                <th>Responsable</th>

                                <th>Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {serviciosReproductivos.map((servicio) => (
                                <tr key={servicio.id}>
                                  <td>
                                    {servicio.fecha_servicio
                                      ? new Date(
                                          servicio.fecha_servicio,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    {servicio.tipo_servicio ===
                                    "inseminacion_artificial"
                                      ? "Inseminación artificial"
                                      : servicio.tipo_servicio ===
                                          "monta_natural"
                                        ? "Monta natural"
                                        : servicio.tipo_servicio}
                                  </td>

                                  <td>
                                    {servicio.reproductor_nombre ||
                                      servicio.reproductor_externo ||
                                      "-"}
                                  </td>

                                  <td>{servicio.responsable || "-"}</td>

                                  <td>
                                    {/* Abre el diagnóstico para este servicio específico */}
                                    <button
                                      type="button"
                                      className="boton-tabla"
                                      onClick={() => {
                                        /*
                                          Guardamos el servicio seleccionado para saber
                                          a cuál servicio reproductivo pertenecerá
                                          el nuevo diagnóstico.
                                        */
                                        setServicioDiagnostico(servicio);

                                        /* Limpiar mensajes anteriores */
                                        setErrorDiagnostico("");
                                        setMensajeDiagnostico("");

                                        /* Limpiar formulario anterior */
                                        setFormDiagnostico({
                                          fecha_diagnostico: "",
                                          resultado: "",
                                          metodo: "",
                                          responsable: "",
                                          observacion: "",
                                        });
                                      }}
                                    >
                                      Diagnóstico
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* ======================================================
                          REGISTRAR PARTO
                      ====================================================== */}

                    {mensajeParto && (
                      <div className="mensaje-exito">{mensajeParto}</div>
                    )}

                    <ModalGanatec
                      abierto={Boolean(gestacionParto)}
                      titulo="Registrar parto"
                      onClose={() => {
                        setGestacionParto(null);
                      }}
                    >
                      {gestacionParto && (
                        <form
                          className="formulario-reproduccion"
                          onSubmit={manejarRegistrarParto}
                        >
                          <div className="formulario-reproduccion-header">
                            <div>
                              <p className="dashboard-label">
                                Finalizar gestación
                              </p>

                              <h4>Registrar parto</h4>

                              <span>
                                Se registrarán también las crías nacidas.
                              </span>
                            </div>

                            <button
                              type="button"
                              className="boton-cerrar"
                              onClick={() => setGestacionParto(null)}
                            >
                              ×
                            </button>
                          </div>

                          <div className="form-grid">
                            <div className="campo-formulario">
                              <label>Fecha del parto</label>

                              <input
                                type="date"
                                name="fecha_parto"
                                value={formParto.fecha_parto}
                                onChange={manejarCambioParto}
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Tipo de parto</label>

                              <select
                                name="tipo_parto"
                                value={formParto.tipo_parto}
                                onChange={manejarCambioParto}
                              >
                                <option value="normal">Normal</option>

                                <option value="asistido">Asistido</option>

                                <option value="cesarea">Cesárea</option>

                                <option value="otro">Otro</option>
                              </select>
                            </div>

                            <div className="campo-formulario campo-completo">
                              <label>Complicaciones</label>

                              <textarea
                                name="complicaciones"
                                rows="2"
                                placeholder="Si existieron complicaciones, descríbelas..."
                                value={formParto.complicaciones}
                                onChange={manejarCambioParto}
                              />
                            </div>
                          </div>

                          {/* ==================================================
                            CRÍAS DEL PARTO
                        ================================================== */}

                          {formParto.crias.map((cria, indice) => (
                            <div className="cria-parto" key={indice}>
                              <div className="cria-parto-header">
                                <h4>Cría {indice + 1}</h4>

                                {formParto.crias.length > 1 && (
                                  <button
                                    type="button"
                                    className="boton-secundario"
                                    onClick={() => quitarCria(indice)}
                                  >
                                    Quitar
                                  </button>
                                )}
                              </div>

                              <div className="form-grid">
                                <div className="campo-formulario">
                                  <label>Estado al nacer</label>

                                  <select
                                    name="estado_nacimiento"
                                    value={cria.estado_nacimiento}
                                    onChange={(e) =>
                                      manejarCambioCria(indice, e)
                                    }
                                  >
                                    <option value="viva">Viva</option>

                                    <option value="muerta">Muerta</option>
                                  </select>
                                </div>

                                <div className="campo-formulario">
                                  <label>Sexo</label>

                                  <select
                                    name="sexo"
                                    value={cria.sexo}
                                    onChange={(e) =>
                                      manejarCambioCria(indice, e)
                                    }
                                    required
                                  >
                                    <option value="">Seleccionar</option>

                                    <option value="macho">Macho</option>

                                    <option value="hembra">Hembra</option>

                                    {cria.estado_nacimiento === "muerta" && (
                                      <option value="desconocido">
                                        Desconocido
                                      </option>
                                    )}
                                  </select>
                                </div>

                                <div className="campo-formulario">
                                  <label>Peso al nacer (kg)</label>

                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="peso_nacimiento_kg"
                                    value={cria.peso_nacimiento_kg}
                                    onChange={(e) =>
                                      manejarCambioCria(indice, e)
                                    }
                                  />
                                </div>

                                {cria.estado_nacimiento === "viva" && (
                                  <>
                                    <div className="campo-formulario">
                                      <label>Nombre</label>

                                      <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Opcional"
                                        value={cria.nombre}
                                        onChange={(e) =>
                                          manejarCambioCria(indice, e)
                                        }
                                      />
                                    </div>

                                    <div className="campo-formulario">
                                      <label>Identificación</label>

                                      <input
                                        type="text"
                                        name="identificacion_temporal"
                                        placeholder="Opcional"
                                        value={cria.identificacion_temporal}
                                        onChange={(e) =>
                                          manejarCambioCria(indice, e)
                                        }
                                      />
                                    </div>

                                    <div className="campo-formulario">
                                      <label>Raza</label>

                                      <input
                                        type="text"
                                        name="raza"
                                        placeholder="Ej: Brahman"
                                        value={cria.raza}
                                        onChange={(e) =>
                                          manejarCambioCria(indice, e)
                                        }
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="reproduccion-acciones">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={agregarCria}
                            >
                              <Plus size={16} />
                              Agregar otra cría
                            </button>
                          </div>

                          {errorParto && (
                            <p className="formulario-error">{errorParto}</p>
                          )}

                          <div className="formulario-acciones">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={() => setGestacionParto(null)}
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="boton-principal"
                              disabled={guardandoParto}
                            >
                              {guardandoParto
                                ? "Registrando..."
                                : "Registrar parto"}
                            </button>
                          </div>
                        </form>
                      )}
                    </ModalGanatec>

                    {/* =========================
                          GESTACIONES
                      ========================= */}

                    <div className="seccion-reproduccion">
                      <h4>Gestaciones</h4>

                      {gestaciones.length === 0 ? (
                        <p className="texto-secundario">
                          No hay gestaciones registradas.
                        </p>
                      ) : (
                        <div className="tabla-contenedor">
                          <table className="tabla-ganatec">
                            <thead>
                              <tr>
                                <th>Inicio</th>

                                <th>Parto estimado</th>

                                <th>Estado</th>

                                <th>Días</th>

                                <th>Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {gestaciones.map((gestacion) => (
                                <tr key={gestacion.id}>
                                  <td>
                                    {gestacion.fecha_inicio
                                      ? new Date(
                                          gestacion.fecha_inicio,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    {gestacion.fecha_probable_parto
                                      ? new Date(
                                          gestacion.fecha_probable_parto,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    <span
                                      className={`estado-gestacion ${
                                        gestacion.estado
                                      }`}
                                    >
                                      {gestacion.estado}
                                    </span>
                                  </td>

                                  <td>{gestacion.dias_gestacion ?? "-"}</td>

                                  <td>
                                    {gestacion.estado === "activa" ? (
                                      <button
                                        type="button"
                                        className="boton-tabla"
                                        onClick={() => {
                                          /*
                                            Seleccionamos la gestación sobre
                                            la cual registraremos el parto.
                                          */
                                          setGestacionParto(gestacion);

                                          setErrorParto("");

                                          setMensajeParto("");
                                        }}
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {/* ======================================================
                          HISTORIAL DE PARTOS
                      ====================================================== */}

                    <div className="seccion-reproduccion">
                      <div className="lista-header">
                        <div>
                          <h4>Historial de partos</h4>

                          <span>{partos.length} registros</span>
                        </div>
                      </div>

                      {partos.length === 0 ? (
                        <p className="texto-secundario">
                          No hay partos registrados para este animal.
                        </p>
                      ) : (
                        <div className="tabla-contenedor">
                          <table className="tabla-ganatec">
                            <thead>
                              <tr>
                                <th>Fecha</th>

                                <th>Tipo</th>

                                <th>Crías</th>

                                <th>Lactancia</th>

                                <th>Observación</th>
                              </tr>
                            </thead>

                            <tbody>
                              {partos.map((parto) => (
                                <tr key={parto.id}>
                                  {/* FECHA */}
                                  <td>
                                    {parto.fecha_parto
                                      ? new Date(
                                          parto.fecha_parto,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  {/* TIPO DE PARTO */}
                                  <td>
                                    {parto.tipo_parto
                                      ? parto.tipo_parto.replace("_", " ")
                                      : "-"}
                                  </td>

                                  {/* CRÍAS */}
                                  <td>
                                    {Array.isArray(parto.crias)
                                      ? parto.crias.length
                                      : 0}
                                  </td>

                                  {/* LACTANCIA */}
                                  <td>
                                    {parto.lactancia_id ? (
                                      <span className="estado-gestacion activa">
                                        {parto.lactancia_estado || "activa"}
                                      </span>
                                    ) : (
                                      <span className="texto-secundario">
                                        Sin lactancia
                                      </span>
                                    )}
                                  </td>

                                  {/* OBSERVACIÓN */}
                                  <td>{parto.observacion || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* =========================================================
                PESTAÑA: LECHE
            ========================================================= */}

            {pestanaActiva === "leche" && (
              <div className="dashboard-panel">
                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="lista-header">
                  <div>
                    <h3>Producción de leche</h3>

                    <span>Control de ordeños y lactancias</span>
                  </div>

                  {produccionLeche?.lactancia && (
                    <div className="leche-acciones-header">
                      <button
                        type="button"
                        className="boton-principal"
                        onClick={() => setMostrarFormularioOrdenio(true)}
                      >
                        <Plus size={17} />
                        Registrar ordeño
                      </button>

                      <button
                        type="button"
                        className="boton-secundario"
                        onClick={abrirFinalizarLactancia}
                      >
                        Finalizar lactancia
                      </button>
                    </div>
                  )}
                </div>

                {/* =====================================================
                    FECHA DE CONSULTA
                ===================================================== */}

                <div className="leche-filtro-fecha">
                  <div>
                    <label>Fecha de consulta</label>

                    <span>
                      Los indicadores se calcularán tomando este día como
                      referencia.
                    </span>
                  </div>

                  <input
                    type="date"
                    value={fechaConsultaLeche}
                    onChange={manejarCambioFechaLeche}
                  />
                </div>

                {mensajeLeche && (
                  <div className="mensaje-exito">{mensajeLeche}</div>
                )}

                {errorLeche && <p className="formulario-error">{errorLeche}</p>}

                {cargandoLeche ? (
                  <p>Cargando información de leche...</p>
                ) : (
                  <>
                    {/* =================================================
                      LACTANCIA ACTIVA
                    ================================================ */}

                    {produccionLeche?.lactancia ? (
                      <>
                        <div className="leche-lactancia-actual">
                          <div>
                            <span>Lactancia actual</span>

                            <strong>Activa</strong>
                          </div>

                          <div>
                            <span>Inicio</span>

                            <strong>
                              {produccionLeche.lactancia.fecha_inicio
                                ? new Date(
                                    produccionLeche.lactancia.fecha_inicio,
                                  ).toLocaleDateString("es-CO", {
                                    timeZone: "UTC",
                                  })
                                : "-"}
                            </strong>
                          </div>
                        </div>

                        {/* =============================================
                            INDICADORES
                        ============================================= */}

                        <div className="leche-resumen">
                          <div>
                            <span>Día consultado</span>

                            <strong>
                              {Number(
                                produccionLeche.resumen?.total_dia || 0,
                              ).toFixed(2)}{" "}
                              L
                            </strong>
                          </div>

                          <div>
                            <span>Semana</span>

                            <strong>
                              {Number(
                                produccionLeche.resumen?.total_semana || 0,
                              ).toFixed(2)}{" "}
                              L
                            </strong>
                          </div>

                          <div>
                            <span>Mes</span>

                            <strong>
                              {Number(
                                produccionLeche.resumen?.total_mes || 0,
                              ).toFixed(2)}{" "}
                              L
                            </strong>
                          </div>

                          <div>
                            <span>Total lactancia</span>

                            <strong>
                              {Number(
                                produccionLeche.resumen?.total_lactancia || 0,
                              ).toFixed(2)}{" "}
                              L
                            </strong>
                          </div>

                          <div>
                            <span>Promedio diario</span>

                            <strong>
                              {Number(
                                produccionLeche.resumen?.promedio_diario || 0,
                              ).toFixed(2)}{" "}
                              L
                            </strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="leche-sin-lactancia">
                        <strong>Sin lactancia activa</strong>

                        <p>
                          Este animal no tiene actualmente una lactancia
                          disponible para registrar ordeños.
                        </p>
                      </div>
                    )}

                    {/* =================================================
                        FINALIZAR LACTANCIA
                    ================================================= */}

                    <ModalGanatec
                      abierto={Boolean(mostrarFinalizarLactancia)}
                      titulo="Finalizar lactancia"
                      onClose={() => {
                        setMostrarFinalizarLactancia(false);
                      }}
                    >
                      {mostrarFinalizarLactancia && (
                        <form
                          className="formulario-reproduccion"
                          onSubmit={manejarFinalizarLactancia}
                        >
                          <div className="formulario-reproduccion-header">
                            <div>
                              <p className="dashboard-label">Lactancia</p>

                              <h4>Finalizar lactancia</h4>

                              <span>
                                Después de finalizar no se podrán registrar
                                nuevos ordeños en esta lactancia.
                              </span>
                            </div>

                            <button
                              type="button"
                              className="boton-cerrar"
                              onClick={() =>
                                setMostrarFinalizarLactancia(false)
                              }
                            >
                              ×
                            </button>
                          </div>

                          <div className="form-grid">
                            <div className="campo-formulario">
                              <label>Fecha de finalización</label>

                              <input
                                type="date"
                                name="fecha_fin"
                                value={formFinalizarLactancia.fecha_fin}
                                onChange={manejarCambioFinalizarLactancia}
                                min={
                                  produccionLeche?.lactancia?.fecha_inicio
                                    ? String(
                                        produccionLeche.lactancia.fecha_inicio,
                                      ).slice(0, 10)
                                    : undefined
                                }
                                required
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Motivo</label>

                              <select
                                name="motivo_fin"
                                value={formFinalizarLactancia.motivo_fin}
                                onChange={manejarCambioFinalizarLactancia}
                                required
                              >
                                <option value="secado">Secado</option>

                                <option value="venta">Venta</option>

                                <option value="muerte">Muerte</option>

                                <option value="otro">Otro</option>
                              </select>
                            </div>

                            <div className="campo-formulario campo-completo">
                              <label>Observación</label>

                              <textarea
                                name="observacion"
                                rows="2"
                                placeholder="Información adicional..."
                                value={formFinalizarLactancia.observacion}
                                onChange={manejarCambioFinalizarLactancia}
                              />
                            </div>
                          </div>

                          {errorFinalizarLactancia && (
                            <p className="formulario-error">
                              {errorFinalizarLactancia}
                            </p>
                          )}

                          <div className="formulario-acciones">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={() =>
                                setMostrarFinalizarLactancia(false)
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="boton-principal"
                              disabled={finalizandoLactancia}
                            >
                              {finalizandoLactancia
                                ? "Finalizando..."
                                : "Finalizar lactancia"}
                            </button>
                          </div>
                        </form>
                      )}
                    </ModalGanatec>

                    {/* =================================================
                        FORMULARIO DE ORDEÑO
                    ================================================= */}

                    <ModalGanatec
                      abierto={Boolean(mostrarFormularioOrdenio)}
                      titulo="Registrar ordeño"
                      onClose={() => {
                        setMostrarFormularioOrdenio(false);
                      }}
                    >
                      {mostrarFormularioOrdenio && (
                        <form
                          className="formulario-pesaje"
                          onSubmit={manejarRegistrarOrdenio}
                        >
                          <div className="formulario-reproduccion-header">
                            <div>
                              <p className="dashboard-label">Producción</p>

                              <h4>Registrar ordeño</h4>
                            </div>

                            <button
                              type="button"
                              className="boton-cerrar"
                              onClick={() => setMostrarFormularioOrdenio(false)}
                            >
                              ×
                            </button>
                          </div>

                          <div className="form-grid">
                            <div className="campo-formulario">
                              <label>Litros</label>

                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                name="litros"
                                placeholder="Ej: 7.5"
                                value={formOrdenio.litros}
                                onChange={manejarCambioOrdenio}
                                required
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Turno</label>

                              <select
                                name="turno"
                                value={formOrdenio.turno}
                                onChange={manejarCambioOrdenio}
                                required
                              >
                                <option value="manana">Mañana</option>

                                <option value="tarde">Tarde</option>

                                <option value="noche">Noche</option>

                                <option value="otro">Otro</option>
                              </select>
                            </div>

                            <div className="campo-formulario">
                              <label>Fecha</label>

                              <input
                                type="date"
                                name="fecha_ordenio"
                                value={formOrdenio.fecha_ordenio}
                                onChange={manejarCambioOrdenio}
                              />
                            </div>

                            <div className="campo-formulario">
                              <label>Observación</label>

                              <input
                                type="text"
                                name="observacion"
                                placeholder="Opcional"
                                value={formOrdenio.observacion}
                                onChange={manejarCambioOrdenio}
                              />
                            </div>
                          </div>

                          <div className="formulario-acciones">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={() => setMostrarFormularioOrdenio(false)}
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              className="boton-principal"
                              disabled={guardandoOrdenio}
                            >
                              {guardandoOrdenio
                                ? "Registrando..."
                                : "Registrar ordeño"}
                            </button>
                          </div>
                        </form>
                      )}
                    </ModalGanatec>

                    {/* =================================================
                        HISTORIAL DE ORDEÑOS
                    ================================================= */}

                    <div className="seccion-leche">
                      <h4>Historial de ordeños</h4>

                      <ModalGanatec
                        abierto={Boolean(registroCorreccion)}
                        titulo="Corregir ordeño"
                        onClose={() => {
                          setRegistroCorreccion(null);
                        }}
                      >
                        {registroCorreccion && (
                          <form
                            className="formulario-reproduccion"
                            onSubmit={manejarCorregirRegistroLeche}
                          >
                            <div className="formulario-reproduccion-header">
                              <div>
                                <p className="dashboard-label">Corrección</p>

                                <h4>Corregir ordeño</h4>

                                <span>
                                  El motivo de la corrección quedará registrado
                                  en la auditoría.
                                </span>
                              </div>

                              <button
                                type="button"
                                className="boton-cerrar"
                                onClick={() => setRegistroCorreccion(null)}
                              >
                                ×
                              </button>
                            </div>

                            <div className="form-grid">
                              <div className="campo-formulario">
                                <label>Litros</label>

                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  name="litros"
                                  value={formCorreccionLeche.litros}
                                  onChange={manejarCambioCorreccionLeche}
                                  required
                                />
                              </div>

                              <div className="campo-formulario">
                                <label>Turno</label>

                                <select
                                  name="turno"
                                  value={formCorreccionLeche.turno}
                                  onChange={manejarCambioCorreccionLeche}
                                >
                                  <option value="manana">Mañana</option>

                                  <option value="tarde">Tarde</option>

                                  <option value="noche">Noche</option>

                                  <option value="otro">Otro</option>
                                </select>
                              </div>

                              <div className="campo-formulario">
                                <label>Fecha</label>

                                <input
                                  type="date"
                                  name="fecha_ordenio"
                                  value={formCorreccionLeche.fecha_ordenio}
                                  onChange={manejarCambioCorreccionLeche}
                                  required
                                />
                              </div>

                              <div className="campo-formulario">
                                <label>Observación</label>

                                <input
                                  type="text"
                                  name="observacion"
                                  value={formCorreccionLeche.observacion}
                                  onChange={manejarCambioCorreccionLeche}
                                />
                              </div>

                              <div className="campo-formulario campo-completo">
                                <label>Motivo de la corrección</label>

                                <textarea
                                  name="motivo_correccion"
                                  rows="2"
                                  placeholder="Ej: Se digitó incorrectamente la cantidad de litros"
                                  value={formCorreccionLeche.motivo_correccion}
                                  onChange={manejarCambioCorreccionLeche}
                                  required
                                />
                              </div>
                            </div>

                            {errorCorreccionLeche && (
                              <p className="formulario-error">
                                {errorCorreccionLeche}
                              </p>
                            )}

                            <div className="formulario-acciones">
                              <button
                                type="button"
                                className="boton-secundario"
                                onClick={() => setRegistroCorreccion(null)}
                              >
                                Cancelar
                              </button>

                              <button
                                type="submit"
                                className="boton-principal"
                                disabled={corrigiendoLeche}
                              >
                                {corrigiendoLeche
                                  ? "Corrigiendo..."
                                  : "Guardar corrección"}
                              </button>
                            </div>
                          </form>
                        )}
                      </ModalGanatec>

                      {!Array.isArray(produccionLeche?.registros) ||
                      produccionLeche.registros.length === 0 ? (
                        <p className="texto-secundario">
                          No hay ordeños registrados en la lactancia actual.
                        </p>
                      ) : (
                        <div className="tabla-contenedor">
                          <table className="tabla-ganatec">
                            <thead>
                              <tr>
                                <th>Fecha</th>

                                <th>Turno</th>

                                <th>Litros</th>

                                <th>Observación</th>

                                <th>Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {produccionLeche.registros.map((registro) => (
                                <tr key={registro.id}>
                                  <td>
                                    {registro.fecha_ordenio
                                      ? new Date(
                                          registro.fecha_ordenio,
                                        ).toLocaleDateString("es-CO")
                                      : "-"}
                                  </td>

                                  <td>
                                    {registro.turno === "manana"
                                      ? "Mañana"
                                      : registro.turno
                                          ?.charAt(0)
                                          .toUpperCase() +
                                        registro.turno?.slice(1)}
                                  </td>

                                  <td>
                                    {Number(registro.litros || 0).toFixed(2)} L
                                  </td>

                                  <td>{registro.observacion || "-"}</td>

                                  <td>
                                    <button
                                      type="button"
                                      className="boton-tabla"
                                      onClick={() =>
                                        abrirCorreccionRegistro(registro)
                                      }
                                    >
                                      Corregir
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
                        HISTORIAL DE LACTANCIAS
                    ================================================= */}

                    <div className="seccion-leche">
                      <h4>Historial de lactancias</h4>

                      {/* =================================================
    DETALLE DE LACTANCIA SELECCIONADA
================================================= */}

                      <ModalGanatec
                        abierto={Boolean(lactanciaHistorialSeleccionada)}
                        titulo="Historial de lactancia"
                        onClose={() => {
                          setLactanciaHistorialSeleccionada(null);
                          setProduccionLactanciaHistorial(null);
                          setErrorHistorialLactancia("");
                        }}
                      >
                        {lactanciaHistorialSeleccionada && (
                          <div className="historial-lactancia-detalle">
                            <div className="formulario-reproduccion-header">
                              <div>
                                <p className="dashboard-label">Historial</p>

                                <h4>Ordeños de la lactancia</h4>

                                <span>
                                  Inicio:{" "}
                                  {lactanciaHistorialSeleccionada.fecha_inicio
                                    ? new Date(
                                        lactanciaHistorialSeleccionada.fecha_inicio,
                                      ).toLocaleDateString("es-CO", {
                                        timeZone: "UTC",
                                      })
                                    : "-"}
                                  {" · "}
                                  Estado:{" "}
                                  {lactanciaHistorialSeleccionada.estado}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="boton-cerrar"
                                onClick={() => {
                                  setLactanciaHistorialSeleccionada(null);

                                  setProduccionLactanciaHistorial(null);

                                  setErrorHistorialLactancia("");
                                }}
                              >
                                ×
                              </button>
                            </div>

                            {cargandoHistorialLactancia && (
                              <p>Cargando ordeños...</p>
                            )}

                            {errorHistorialLactancia && (
                              <p className="formulario-error">
                                {errorHistorialLactancia}
                              </p>
                            )}

                            {produccionLactanciaHistorial && (
                              <>
                                {/* =============================================
            RESUMEN
        ============================================= */}

                                <div className="leche-resumen historial">
                                  <div>
                                    <span>Total producido</span>

                                    <strong>
                                      {Number(
                                        produccionLactanciaHistorial.resumen
                                          ?.litros_totales || 0,
                                      ).toFixed(2)}{" "}
                                      L
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Ordeños</span>

                                    <strong>
                                      {produccionLactanciaHistorial.resumen
                                        ?.total_ordenios || 0}
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Promedio por ordeño</span>

                                    <strong>
                                      {Number(
                                        produccionLactanciaHistorial.resumen
                                          ?.promedio_por_ordenio || 0,
                                      ).toFixed(2)}{" "}
                                      L
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Promedio diario</span>

                                    <strong>
                                      {Number(
                                        produccionLactanciaHistorial.resumen
                                          ?.promedio_diario || 0,
                                      ).toFixed(2)}{" "}
                                      L
                                    </strong>
                                  </div>
                                </div>

                                {/* =============================================
            ORDEÑOS
        ============================================= */}

                                {!Array.isArray(
                                  produccionLactanciaHistorial.registros,
                                ) ||
                                produccionLactanciaHistorial.registros
                                  .length === 0 ? (
                                  <p className="texto-secundario">
                                    Esta lactancia no tiene ordeños registrados.
                                  </p>
                                ) : (
                                  <div className="tabla-contenedor">
                                    <table className="tabla-ganatec">
                                      <thead>
                                        <tr>
                                          <th>Fecha</th>

                                          <th>Turno</th>

                                          <th>Litros</th>

                                          <th>Observación</th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {produccionLactanciaHistorial.registros.map(
                                          (registro) => (
                                            <tr key={registro.id}>
                                              <td>
                                                {registro.fecha_ordenio
                                                  ? new Date(
                                                      registro.fecha_ordenio,
                                                    ).toLocaleDateString(
                                                      "es-CO",
                                                    )
                                                  : "-"}
                                              </td>

                                              <td>
                                                {registro.turno === "manana"
                                                  ? "Mañana"
                                                  : registro.turno
                                                      ?.charAt(0)
                                                      .toUpperCase() +
                                                    registro.turno?.slice(1)}
                                              </td>

                                              <td>
                                                {Number(
                                                  registro.litros || 0,
                                                ).toFixed(2)}{" "}
                                                L
                                              </td>

                                              <td>
                                                {registro.observacion || "-"}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </ModalGanatec>

                      {lactancias.length === 0 ? (
                        <p className="texto-secundario">
                          No hay lactancias registradas.
                        </p>
                      ) : (
                        <div className="tabla-contenedor">
                          <table className="tabla-ganatec">
                            <thead>
                              <tr>
                                <th>Inicio</th>

                                <th>Fin</th>

                                <th>Estado</th>

                                <th>Ordeños</th>

                                <th>Litros</th>

                                <th>Promedio</th>

                                <th>Duración</th>

                                <th>Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {lactancias.map((lactancia) => (
                                <tr key={lactancia.id}>
                                  <td>
                                    {lactancia.fecha_inicio
                                      ? new Date(
                                          lactancia.fecha_inicio,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    {lactancia.fecha_fin
                                      ? new Date(
                                          lactancia.fecha_fin,
                                        ).toLocaleDateString("es-CO", {
                                          timeZone: "UTC",
                                        })
                                      : "-"}
                                  </td>

                                  <td>
                                    <span
                                      className={`estado-gestacion ${
                                        lactancia.estado === "activa"
                                          ? "activa"
                                          : "finalizada"
                                      }`}
                                    >
                                      {lactancia.estado}
                                    </span>
                                  </td>

                                  <td>{lactancia.total_ordenios}</td>

                                  <td>
                                    {Number(
                                      lactancia.litros_totales || 0,
                                    ).toFixed(2)}{" "}
                                    L
                                  </td>

                                  <td>
                                    {Number(
                                      lactancia.promedio_por_ordenio || 0,
                                    ).toFixed(2)}{" "}
                                    L
                                  </td>

                                  <td>
                                    {lactancia.duracion_dias
                                      ? `${lactancia.duracion_dias} días`
                                      : "-"}
                                  </td>

                                  <td>
                                    <button
                                      type="button"
                                      className="boton-tabla"
                                      onClick={() =>
                                        abrirHistorialLactancia(lactancia)
                                      }
                                    >
                                      Ver ordeños
                                    </button>
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
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AnimalDetalle;
