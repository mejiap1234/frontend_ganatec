import {
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  crearPotrero,
} from "../../../services/potreros/potreros.service";


const PotreroNuevo = ({ modoModal = false, onClose, onSuccess }) => {

  const navigate =
    useNavigate();


  /* =========================================================
     FORMULARIO
  ========================================================= */

  const [formulario, setFormulario] =
    useState({
      nombre: "",
      area_hectareas: "",
      tipo_pasto: "",
      capacidad_animales: "",
      observacion: "",
    });


  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CAMBIOS DEL FORMULARIO
  ========================================================= */

  const manejarCambio = (e) => {

    const { name, value } =
      e.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );

  };


  /* =========================================================
     GUARDAR POTRERO
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!formulario.nombre.trim()) {

      setError(
        "El nombre del potrero es obligatorio."
      );

      return;

    }


    if (
      formulario.area_hectareas
      &&
      Number(
        formulario.area_hectareas
      ) <= 0
    ) {

      setError(
        "El área debe ser mayor que cero."
      );

      return;

    }


    if (
      formulario.capacidad_animales
      &&
      (
        !Number.isInteger(
          Number(
            formulario.capacidad_animales
          )
        )
        ||
        Number(
          formulario.capacidad_animales
        ) <= 0
      )
    ) {

      setError(
        "La capacidad debe ser un número entero mayor que cero."
      );

      return;

    }


    try {

      setGuardando(true);


      const datos = {

        nombre:
          formulario.nombre.trim(),

        ...(formulario.area_hectareas && {
          area_hectareas:
            Number(
              formulario.area_hectareas
            ),
        }),

        ...(formulario.tipo_pasto.trim() && {
          tipo_pasto:
            formulario.tipo_pasto.trim(),
        }),

        ...(formulario.capacidad_animales && {
          capacidad_animales:
            Number(
              formulario.capacidad_animales
            ),
        }),

        ...(formulario.observacion.trim() && {
          observacion:
            formulario.observacion.trim(),
        }),

      };


      await crearPotrero(
        datos
      );


      if (modoModal) onSuccess?.();
      else navigate("/potreros");


    } catch (error) {

      console.error(
        "Error creando potrero:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible registrar el potrero."
      );


    } finally {

      setGuardando(false);

    }

  };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      {!modoModal && (
      <div className="modulo-subheader">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() => modoModal ? onClose?.() : navigate("/potreros")}
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Nuevo potrero
          </h2>

          <p>
            Registra la información básica
            del potrero.
          </p>

        </div>

      </div>
      )}
      <div className={modoModal ? "registro-modal-contenido" : "dashboard-panel"}>

        <form
          className={modoModal ? "formulario-reproduccion registro-modal-form" : "formulario-reproduccion"}
          onSubmit={manejarGuardar}
        >

          <div className="form-grid">

            <div className="campo-formulario">

              <label>
                Nombre *
              </label>

              <input
                type="text"
                name="nombre"
                value={
                  formulario.nombre
                }
                onChange={manejarCambio}
                placeholder="Ej: Potrero Norte"
                required
              />

            </div>


            <div className="campo-formulario">

              <label>
                Área (hectáreas)
              </label>

              <input
                type="number"
                step="0.01"
                min="0.01"
                name="area_hectareas"
                value={
                  formulario.area_hectareas
                }
                onChange={manejarCambio}
                placeholder="Ej: 5.5"
              />

            </div>


            <div className="campo-formulario">

              <label>
                Tipo de pasto
              </label>

              <input
                type="text"
                name="tipo_pasto"
                value={
                  formulario.tipo_pasto
                }
                onChange={manejarCambio}
                placeholder="Ej: Brachiaria"
              />

            </div>


            <div className="campo-formulario">

              <label>
                Capacidad de animales
              </label>

              <input
                type="number"
                min="1"
                step="1"
                name="capacidad_animales"
                value={
                  formulario.capacidad_animales
                }
                onChange={manejarCambio}
                placeholder="Ej: 20"
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
                  formulario.observacion
                }
                onChange={manejarCambio}
                placeholder="Información adicional del potrero..."
              />

            </div>

          </div>


          {error && (

            <p className="formulario-error">
              {error}
            </p>

          )}


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={() => modoModal ? onClose?.() : navigate("/potreros")}
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={guardando}
            >

              {
                guardando
                  ? "Guardando..."
                  : "Guardar potrero"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default PotreroNuevo;