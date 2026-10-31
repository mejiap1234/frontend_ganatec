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
  crearLote,
} from "../../../services/potreros/potreros.service";


const LoteNuevo = ({ modoModal = false, onClose, onSuccess }) => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [formulario, setFormulario] =
    useState({
      nombre: "",
      descripcion: "",
    });

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     CAMBIOS DEL FORMULARIO
  ========================================================= */

  const manejarCambio = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );

  };


  /* =========================================================
     CREAR LOTE
  ========================================================= */

  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    if (!formulario.nombre.trim()) {

      setError(
        "El nombre del lote es obligatorio."
      );

      return;

    }


    try {

      setGuardando(true);


      await crearLote({
        nombre:
          formulario.nombre.trim(),

        descripcion:
          formulario.descripcion.trim()
          ||
          undefined,
      });


      if (modoModal) onSuccess?.();
      else navigate("/potreros/lotes");


    } catch (error) {

      console.error(
        "Error creando lote:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible crear el lote."
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
            onClick={() => modoModal ? onClose?.() : navigate("/potreros/lotes")}
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Nuevo lote
          </h2>

          <p>
            Crea un grupo para organizar
            los animales de la finca.
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
                placeholder="Ej: Novillas"
                required
              />

            </div>


            <div className="campo-formulario campo-completo">

              <label>
                Descripción
              </label>

              <textarea
                rows="4"
                name="descripcion"
                value={
                  formulario.descripcion
                }
                onChange={manejarCambio}
                placeholder="Ej: Hembras jóvenes en crecimiento..."
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
              onClick={() => modoModal ? onClose?.() : navigate("/potreros/lotes")}
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
                  : "Crear lote"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default LoteNuevo;