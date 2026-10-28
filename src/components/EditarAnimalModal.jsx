
import { useEffect, useState } from "react";
import ModalGanatec from "./ModalGanatec";

import {
  actualizarAnimal,
  obtenerAnimalPorId,
} from "../services/animales.service";

// Convierte los datos del animal al formato del formulario.
const prepararFormulario = (animal) => ({
  nombre: animal?.nombre ?? "",
  identificacion: animal?.identificacion ?? "",
  sexo: String(animal?.sexo ?? "").toLowerCase(),
  raza: animal?.raza ?? "",
  fecha_nacimiento: animal?.fecha_nacimiento
    ? String(animal.fecha_nacimiento).slice(0, 10)
    : "",
  notas: animal?.notas ?? "",
});

const EditarAnimalModal = ({
  abierto,
  animal,
  onClose,
  onActualizado,
}) => {
  const [formulario, setFormulario] = useState(
    () => prepararFormulario(animal)
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Cargar los valores actuales al abrir el modal.
  useEffect(() => {
    if (abierto && animal) {
      setFormulario(prepararFormulario(animal));
      setError("");
    }
  }, [abierto, animal]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const cerrar = () => {
    if (!guardando) onClose();
  };

  // Guardar los datos y comprobar que PostgreSQL los conserve.
  const guardar = async (e) => {
    e.preventDefault();
    if (guardando || !animal) return;

    setError("");

    if (!formulario.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!formulario.identificacion.trim()) {
      setError("La identificación es obligatoria.");
      return;
    }

    if (!["macho", "hembra"].includes(formulario.sexo)) {
      setError("Selecciona el sexo del animal.");
      return;
    }

    if (
      formulario.fecha_nacimiento &&
      new Date(`${formulario.fecha_nacimiento}T12:00:00`) >
        new Date()
    ) {
      setError("La fecha de nacimiento no puede ser futura.");
      return;
    }

    const datos = {
      nombre: formulario.nombre.trim(),
      identificacion: formulario.identificacion.trim(),
      sexo: formulario.sexo,
      raza: formulario.raza.trim() || null,
      fecha_nacimiento: formulario.fecha_nacimiento || null,
      notas: formulario.notas.trim() || null,
    };

    try {
      setGuardando(true);

      // Actualizar mediante el servicio existente.
      await actualizarAnimal(animal.id, datos);

      // Consultar nuevamente para verificar lo guardado.
      const respuesta = await obtenerAnimalPorId(animal.id);
      const actualizado = respuesta?.animal || respuesta;

      if (!actualizado || String(actualizado.id) !== String(animal.id)) {
        throw new Error("No fue posible verificar la actualización.");
      }

      const normalizar = (v) => String(v ?? "").trim();

      const diferencias = [
        "nombre",
        "identificacion",
        "sexo",
        "raza",
        "fecha_nacimiento",
        "notas",
      ].filter((campo) => {
        // Comprobar únicamente campos que la API devuelve.
        if (!Object.prototype.hasOwnProperty.call(actualizado, campo)) {
          return false;
        }

        const esperado =
          campo === "fecha_nacimiento"
            ? String(datos[campo] ?? "").slice(0, 10)
            : normalizar(datos[campo]);

        const recibido =
          campo === "fecha_nacimiento"
            ? String(actualizado[campo] ?? "").slice(0, 10)
            : normalizar(actualizado[campo]);

        return esperado !== recibido;
      });

      if (diferencias.length > 0) {
        throw new Error(
          `El servidor no confirmó estos cambios: ${diferencias.join(", ")}.`
        );
      }

      onActualizado(actualizado);
    } catch (err) {
      console.error("Error editando animal:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "No fue posible actualizar el animal."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalGanatec
      abierto={abierto}
      titulo="Editar información del animal"
      onClose={cerrar}
    >
      <form onSubmit={guardar}>
        <div className="form-grid">
          <div className="campo-formulario">
            <label htmlFor="editar-animal-nombre">Nombre *</label>
            <input
              id="editar-animal-nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              disabled={guardando}
              maxLength={100}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="editar-animal-identificacion">
              Identificación *
            </label>
            <input
              id="editar-animal-identificacion"
              name="identificacion"
              value={formulario.identificacion}
              onChange={manejarCambio}
              disabled={guardando}
              maxLength={50}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="editar-animal-sexo">Sexo *</label>
            <select
              id="editar-animal-sexo"
              name="sexo"
              value={formulario.sexo}
              onChange={manejarCambio}
              disabled={guardando}
              required
            >
              <option value="">Seleccionar</option>
              <option value="hembra">Hembra</option>
              <option value="macho">Macho</option>
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="editar-animal-raza">Raza</label>
            <input
              id="editar-animal-raza"
              name="raza"
              value={formulario.raza}
              onChange={manejarCambio}
              disabled={guardando}
              placeholder="Ej. Brahman Rojo"
              maxLength={100}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="editar-animal-nacimiento">
              Fecha de nacimiento
            </label>
            <input
              id="editar-animal-nacimiento"
              type="date"
              name="fecha_nacimiento"
              value={formulario.fecha_nacimiento}
              onChange={manejarCambio}
              disabled={guardando}
            />
          </div>

          <div className="campo-formulario">
            <label>Estado actual</label>
            <input
              value={animal?.estado || "Sin registrar"}
              disabled
              readOnly
            />
          </div>

          <div className="campo-formulario campo-completo">
            <label htmlFor="editar-animal-notas">
              Notas u observaciones
            </label>
            <textarea
              id="editar-animal-notas"
              name="notas"
              rows={3}
              value={formulario.notas}
              onChange={manejarCambio}
              disabled={guardando}
              placeholder="Información adicional del animal..."
            />
          </div>
        </div>

        <p className="editar-animal-ayuda">
          El estado del animal se modifica por separado
          para conservar el historial de cambios.
        </p>

        {error && (
          <p role="alert" className="formulario-error">
            {error}
          </p>
        )}

        <div className="formulario-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={cerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="boton-principal"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </ModalGanatec>
  );
};

export default EditarAnimalModal;
