
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Controla los modales abiertos y el desplazamiento de la página.
const pilaModales = [];
let overflowOriginal = "";

export default function ModalGanatec({
  abierto,
  titulo,
  onClose,
  children,
}) {
  const id = useId();
  const dialogoRef = useRef(null);
  const cerrarRef = useRef(onClose);

  cerrarRef.current = onClose;

  useEffect(() => {
    if (!abierto) return;

    const elementoPrevio = document.activeElement;

    // Bloquear el desplazamiento de la página de fondo.
    if (pilaModales.length === 0) {
      overflowOriginal = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    pilaModales.push(id);
    dialogoRef.current?.focus();

    const manejarTeclas = (event) => {
      if (pilaModales[pilaModales.length - 1] !== id) {
        return;
      }

      // Cerrar mediante Escape.
      if (event.key === "Escape") {
        event.preventDefault();
        cerrarRef.current?.();
      }

      // Mantener la navegación de teclado dentro del modal.
      if (event.key === "Tab") {
        const elementos = Array.from(
          dialogoRef.current?.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          ) || []
        ).filter((el) => el.getClientRects().length > 0);

        if (!elementos.length) {
          event.preventDefault();
          dialogoRef.current?.focus();
          return;
        }

        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === primero
        ) {
          event.preventDefault();
          ultimo.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === ultimo
        ) {
          event.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener("keydown", manejarTeclas);

    return () => {
      document.removeEventListener("keydown", manejarTeclas);

      const posicion = pilaModales.lastIndexOf(id);

      if (posicion !== -1) {
        pilaModales.splice(posicion, 1);
      }

      if (!pilaModales.length) {
        document.body.style.overflow = overflowOriginal;
      }

      elementoPrevio?.focus?.();
    };
  }, [abierto, id]);

  if (!abierto) return null;

  // El modal se dibuja fuera del contenedor del Dashboard.
  return createPortal(
    <div
      className="ganatec-modal-fondo"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          pilaModales[pilaModales.length - 1] === id
        ) {
          cerrarRef.current?.();
        }
      }}
    >
      <section
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="ganatec-modal-ventana"
      >
        <header className="ganatec-modal-cabecera">
          <h2>{titulo}</h2>

          <button
            type="button"
            aria-label="Cerrar ventana"
            onClick={() => cerrarRef.current?.()}
          >
            <X size={20} />
          </button>
        </header>

        <div className="ganatec-modal-cuerpo">
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
