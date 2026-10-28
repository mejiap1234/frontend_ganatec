import { useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { Bot, Send, User, LoaderCircle, Sparkles } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { preguntarCopiloto } from "../../services/ia.service";

const IAGanatec = () => {
  const [pregunta, setPregunta] = useState("");

  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState("");

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      tipo: "ia",
      contenido:
        "Hola. Soy IA GANATEC. Puedo ayudarte a consultar información de tu finca, analizar registros y orientarte sobre manejo ganadero.",
    },
  ]);

  const preguntasSugeridas = [
    "¿Cómo va la finca?",
    "¿Qué alertas requieren atención?",
    "¿Cómo va la producción de leche?",
    "¿Qué ventajas tiene el pastoreo rotacional?",
  ];

  /* =========================================================
   DESPLAZAMIENTO AUTOMÁTICO DEL CHAT
========================================================= */

  const finalChatRef = useRef(null);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensajes, cargando]);

  /* =========================================================
     ENVIAR PREGUNTA
  ========================================================= */

  const enviarPregunta = async (textoPregunta = pregunta) => {
    const texto = textoPregunta.trim();

    if (!texto || cargando) {
      return;
    }

    const mensajeUsuario = {
      id: Date.now(),

      tipo: "usuario",

      contenido: texto,
    };

    setMensajes((anteriores) => [...anteriores, mensajeUsuario]);

    setPregunta("");
    setError("");
    setCargando(true);

    /* =========================================================
   CONTEXTO RECIENTE DE LA CONVERSACIÓN
========================================================= */

    const historialReciente = mensajes
      .filter((mensaje) => mensaje.tipo === "usuario" || mensaje.tipo === "ia")
      .slice(-4)
      .map((mensaje) => ({
        tipo: mensaje.tipo,

        contenido: mensaje.contenido,
      }));

    try {
      const respuesta = await preguntarCopiloto(
        textoPregunta,
        historialReciente,
      );

      const mensajeIA = {
        id: Date.now() + 1,

        tipo: "ia",

        contenido:
          respuesta?.respuesta || "No fue posible generar una respuesta.",
      };

      setMensajes((anteriores) => [...anteriores, mensajeIA]);
    } catch (error) {
      console.error("Error consultando IA GANATEC:", error);

      const mensaje =
        error.response?.data?.message ||
        "No fue posible comunicarse con IA GANATEC.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  /* =========================================================
     ENVIAR CON ENTER
  ========================================================= */

  const manejarTeclado = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      enviarPregunta();
    }
  };

  return (
    <DashboardLayout>
      <div className="ia-ganatec-page">
        <div className="ia-ganatec-header">
          <div className="ia-ganatec-identidad">
            <div className="ia-ganatec-icono">
              <Bot size={28} />
            </div>

            <div>
              <span className="ia-ganatec-etiqueta">
                Inteligencia artificial
              </span>

              <h1>IA GANATEC</h1>

              <p>
                Consulta tu finca, analiza información y recibe orientación para
                apoyar tus decisiones ganaderas.
              </p>
            </div>
          </div>
        </div>

        <div className="ia-ganatec-contenedor">
          <section className="ia-ganatec-chat">
            <div className="ia-ganatec-mensajes">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={
                    mensaje.tipo === "usuario"
                      ? "ia-mensaje ia-mensaje-usuario"
                      : "ia-mensaje ia-mensaje-asistente"
                  }
                >
                  <div className="ia-mensaje-avatar">
                    {mensaje.tipo === "usuario" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={19} />
                    )}
                  </div>

                  <div className="ia-mensaje-contenido">
                    <span className="ia-mensaje-autor">
                      {mensaje.tipo === "usuario" ? "Tú" : "IA GANATEC"}
                    </span>

                    <div className="ia-mensaje-texto">
                      {mensaje.tipo === "ia" ? (
                        <div className="ia-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Tablas adaptables a pantallas pequeñas
                              table: ({ children }) => (
                                <div className="ia-tabla-scroll">
                                  <table className="ia-tabla">{children}</table>
                                </div>
                              ),
                            }}
                          >
                            {mensaje.contenido}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        mensaje.contenido
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {cargando && (
                <div className="ia-mensaje ia-mensaje-asistente">
                  <div className="ia-mensaje-avatar">
                    <Bot size={19} />
                  </div>

                  <div className="ia-mensaje-contenido">
                    <span className="ia-mensaje-autor">IA GANATEC</span>

                    <div className="ia-mensaje-cargando">
                      <LoaderCircle size={17} className="ia-spinner" />

                      <span>Analizando la información...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={finalChatRef} />
            </div>

            {mensajes.length === 1 && (
              <div className="ia-sugerencias">
                <div className="ia-sugerencias-titulo">
                  <Sparkles size={16} />

                  <span>Puedes preguntarme</span>
                </div>

                <div className="ia-sugerencias-grid">
                  {preguntasSugeridas.map((sugerencia) => (
                    <button
                      key={sugerencia}
                      type="button"
                      onClick={() => enviarPregunta(sugerencia)}
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="ia-ganatec-error">{error}</div>}

            <div className="ia-ganatec-input">
              <textarea
                value={pregunta}
                onChange={(event) => setPregunta(event.target.value)}
                onKeyDown={manejarTeclado}
                placeholder="Pregúntale algo a IA GANATEC..."
                rows={1}
                maxLength={500}
                disabled={cargando}
              />

              <button
                type="button"
                onClick={() => enviarPregunta()}
                disabled={cargando || !pregunta.trim()}
                title="Enviar pregunta"
              >
                {cargando ? (
                  <LoaderCircle size={20} className="ia-spinner" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="ia-ganatec-aviso">
              IA GANATEC utiliza los registros disponibles de la finca y puede
              ofrecer orientación general. Las recomendaciones no sustituyen la
              valoración de un profesional cuando sea necesaria.
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IAGanatec;
