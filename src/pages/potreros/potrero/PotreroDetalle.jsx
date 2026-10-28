import { useEffect, useState } from "react";

import { ArrowLeft, Layers3, Users } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  obtenerPotreros,
  obtenerDescansosPotrero,
  obtenerLotesPotrero,
} from "../../../services/potreros/potreros.service";

const PotreroDetalle = () => {
  const { potreroId } = useParams();

  const navigate = useNavigate();

  /* =========================================================
     ESTADOS
  ========================================================= */

  const [potrero, setPotrero] = useState(null);

  const [lotes, setLotes] = useState([]);

  const [descansos, setDescansos] = useState([]);

  const [descansoActual, setDescansoActual] = useState(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     CARGAR INFORMACIÓN
  ========================================================= */

  const cargarDatos = async () => {
    try {
      setCargando(true);

      setError("");

      const [respuestaPotreros, respuestaDescansos, respuestaLotes] =
        await Promise.all([
          obtenerPotreros(),

          obtenerDescansosPotrero(potreroId),

          obtenerLotesPotrero(potreroId),
        ]);

      

      /* -----------------------------------------------------
         POTRERO
      ----------------------------------------------------- */

      const listaPotreros = Array.isArray(respuestaPotreros?.potreros)
        ? respuestaPotreros.potreros
        : [];

      const encontrado =
        listaPotreros.find((item) => String(item.id) === String(potreroId)) ||
        respuestaLotes?.potrero ||
        null;

      setPotrero(encontrado);

      /* -----------------------------------------------------
         LOTES ACTUALES
      ----------------------------------------------------- */

      setLotes(
        Array.isArray(respuestaLotes?.lotes) ? respuestaLotes.lotes : [],
      );

      /* -----------------------------------------------------
         DESCANSOS
      ----------------------------------------------------- */

      setDescansos(
        Array.isArray(respuestaDescansos?.historial)
          ? respuestaDescansos.historial
          : [],
      );

      setDescansoActual(respuestaDescansos?.descanso_actual || null);
    } catch (error) {
      console.error("Error cargando potrero:", error);

      setError(
        error.response?.data?.message || "No fue posible cargar el potrero.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [potreroId]);

  /* =========================================================
     INDICADORES
  ========================================================= */

  const totalAnimales = lotes.reduce(
    (acumulado, lote) => acumulado + Number(lote.total_animales || 0),
    0,
  );

  /* =========================================================
     ESTADOS DE CARGA
  ========================================================= */

  if (cargando) {
    return <div className="dashboard-loading">Cargando potrero...</div>;
  }

  if (error && !potrero) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!potrero) {
    return <div className="dashboard-error">Potrero no encontrado.</div>;
  }

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="modulo-subheader">
        <div>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navigate("/potreros")}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <h2>{potrero.nombre}</h2>

          <p>Información, ocupación y manejo del potrero.</p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* =====================================================
          INFORMACIÓN GENERAL
      ===================================================== */}

      <div className="potreros-resumen">
        <div>
          <span>Estado</span>

          <strong className="texto-capitalizado">
            {potrero.estado || "-"}
          </strong>

          <small>Estado actual</small>
        </div>

        <div>
          <span>Área</span>

          <strong>
            {potrero.area_hectareas
              ? `${Number(potrero.area_hectareas)} hectáreas`
              : "-"}
          </strong>

          <small>Superficie</small>
        </div>

        <div>
          <span>Capacidad</span>

          <strong>{potrero.capacidad_animales || "-"}</strong>

          <small>Animales</small>
        </div>

        <div>
          <span>Animales actuales</span>

          <strong>{totalAnimales}</strong>

          <small>En los lotes del potrero</small>
        </div>
      </div>

      {/* =====================================================
          TIPO DE PASTO Y OBSERVACIÓN
      ===================================================== */}

      <div className="dashboard-panel">
        <div className="lista-header">
          <div>
            <h3>Información del terreno</h3>
          </div>
        </div>

        <div className="potrero-descanso-actual">
          <div>
            <span>Tipo de pasto</span>

            <strong>{potrero.tipo_pasto || "-"}</strong>
          </div>

          <div>
            <span>Observación</span>

            <strong>{potrero.observacion || "Sin observaciones"}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOTES ACTUALES DEL POTRERO
      ===================================================== */}

      <div className="dashboard-panel">
        <div className="lista-header">
          <div>
            <h3>Lotes actuales</h3>

            <span>
              {lotes.length} lote{lotes.length === 1 ? "" : "s"} ubicado
              {lotes.length === 1 ? "" : "s"} aquí
            </span>
          </div>
        </div>

        {lotes.length === 0 ? (
          <div className="estado-vacio">
            <Layers3 size={28} />

            <p>
              {potrero.estado === "ocupado"
                ? "El potrero figura como ocupado, pero no tiene un lote activo asociado."
                : "Actualmente no hay lotes ubicados en este potrero."}
            </p>
          </div>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla-ganatec">
              <thead>
                <tr>
                  <th>Lote</th>

                  <th>Animales</th>

                  <th>Fecha de ingreso</th>

                  <th>Permanencia</th>

                  <th>Estado</th>

                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {lotes.map((lote) => (
                  <tr key={lote.id}>
                    <td>
                      <strong>{lote.nombre}</strong>

                      {lote.descripcion && (
                        <div className="descripcion-tabla">
                          {lote.descripcion}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="lote-total-animales">
                        <Users size={15} />

                        <span>{Number(lote.total_animales || 0)}</span>
                      </div>
                    </td>

                    <td>
                      {lote.fecha_ingreso
                        ? new Date(lote.fecha_ingreso).toLocaleDateString(
                            "es-CO",
                          )
                        : "-"}
                    </td>

                    <td>{Number(lote.dias_permanencia || 0)} días</td>

                    <td>
                      <span className={`estado-potrero ${lote.estado || ""}`}>
                        {lote.estado || "-"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="boton-tabla"
                        onClick={() => navigate(`/potreros/lotes/${lote.id}`)}
                      >
                        Gestionar lote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          DESCANSO ACTUAL
      ===================================================== */}

      {descansoActual && (
        <div className="dashboard-panel">
          <div className="lista-header">
            <div>
              <h3>Descanso actual</h3>

              <span>Recuperación de la pastura</span>
            </div>

            <button
              type="button"
              className="boton-principal"
              onClick={() =>
                navigate(`/potreros/${potreroId}/descanso/finalizar`)
              }
            >
              Finalizar descanso
            </button>
          </div>

          <div className="potrero-descanso-actual">
            <div>
              <span>Inicio</span>

              <strong>
                {descansoActual.fecha_inicio
                  ? new Date(descansoActual.fecha_inicio).toLocaleDateString(
                      "es-CO",
                      {
                        timeZone: "UTC",
                      },
                    )
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Días de descanso</span>

              <strong>{descansoActual.dias_descanso || 0}</strong>
            </div>

            <div>
              <span>Motivo</span>

              <strong>{descansoActual.motivo || "-"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HISTORIAL DE DESCANSOS
      ===================================================== */}

      <div className="dashboard-panel">
        <div className="lista-header">
          <div>
            <h3>Historial de descansos</h3>

            <span>{descansos.length} registros</span>
          </div>
        </div>

        {descansos.length === 0 ? (
          <p className="texto-secundario">
            Este potrero todavía no tiene descansos registrados.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla-ganatec">
              <thead>
                <tr>
                  <th>Inicio</th>

                  <th>Fin</th>

                  <th>Días</th>

                  <th>Motivo</th>

                  <th>Observación</th>
                </tr>
              </thead>

              <tbody>
                {descansos.map((descanso) => (
                  <tr key={descanso.id}>
                    <td>
                      {descanso.fecha_inicio
                        ? new Date(descanso.fecha_inicio).toLocaleDateString(
                            "es-CO",
                            {
                              timeZone: "UTC",
                            },
                          )
                        : "-"}
                    </td>

                    <td>
                      {descanso.fecha_fin
                        ? new Date(descanso.fecha_fin).toLocaleDateString(
                            "es-CO",
                            {
                              timeZone: "UTC",
                            },
                          )
                        : "Actual"}
                    </td>

                    <td>{descanso.dias_descanso || 0}</td>

                    <td>{descanso.motivo || "-"}</td>

                    <td>{descanso.observacion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default PotreroDetalle;
