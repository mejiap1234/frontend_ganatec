import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Plus,
  Trash2,
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
  obtenerGestaciones,
  registrarParto,
} from "../services/reproduccion.service";


const criaInicial = () => ({
  sexo: "",
  estado_nacimiento: "viva",
  peso_nacimiento_kg: "",
  identificacion_temporal: "",
  nombre: "",
  raza: "",
  observacion: "",
});


const ReproduccionParto = () => {

  const {
    animalId,
    gestacionId,
  } = useParams();

  const navigate =
    useNavigate();


  const [animal, setAnimal] =
    useState(null);

  const [gestacion, setGestacion] =
    useState(null);

  const [formulario, setFormulario] =
    useState({
      fecha_parto: "",
      tipo_parto: "normal",
      complicaciones: "",
      observacion: "",
      crias: [
        criaInicial(),
      ],
    });

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const cargarDatos = async () => {

      try {

        setCargando(true);


        const [
          respuestaAnimal,
          respuestaGestaciones,
        ] = await Promise.all([

          obtenerAnimalPorId(
            animalId
          ),

          obtenerGestaciones(
            animalId
          ),

        ]);


        const listaGestaciones =
          Array.isArray(
            respuestaGestaciones?.gestaciones
          )
            ? respuestaGestaciones.gestaciones
            : Array.isArray(
                respuestaGestaciones
              )
              ? respuestaGestaciones
              : [];


        setAnimal(
          respuestaAnimal?.animal
          ||
          respuestaAnimal
        );


        setGestacion(
          listaGestaciones.find(
            (item) =>
              String(item.id) ===
              String(gestacionId)
          ) || null
        );


      } catch (error) {

        console.error(
          "Error cargando gestación:",
          error
        );

        setError(
          "No fue posible cargar la gestación."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarDatos();

  }, [
    animalId,
    gestacionId,
  ]);


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


  const manejarCambioCria =
    (
      indice,
      e
    ) => {

      const { name, value } =
        e.target;


      setFormulario(
        (anterior) => {

          const crias =
            [
              ...anterior.crias,
            ];


          crias[indice] = {
            ...crias[indice],
            [name]: value,
          };


          return {
            ...anterior,
            crias,
          };

        }
      );

    };


  const agregarCria = () => {

    setFormulario(
      (anterior) => ({
        ...anterior,
        crias: [
          ...anterior.crias,
          criaInicial(),
        ],
      })
    );

  };


  const quitarCria = (indice) => {

    setFormulario(
      (anterior) => {

        if (
          anterior.crias.length === 1
        ) {
          return anterior;
        }


        return {
          ...anterior,
          crias:
            anterior.crias.filter(
              (_, posicion) =>
                posicion !== indice
            ),
        };

      }
    );

  };


  const manejarGuardar = async (e) => {

    e.preventDefault();

    setError("");


    for (
      const cria
      of formulario.crias
    ) {

      if (!cria.sexo) {

        setError(
          "Debes indicar el sexo de todas las crías."
        );

        return;

      }


      if (
        cria.estado_nacimiento === "viva"
        &&
        ![
          "macho",
          "hembra",
        ].includes(
          cria.sexo
        )
      ) {

        setError(
          "Una cría viva debe ser macho o hembra."
        );

        return;

      }

    }


    try {

      setGuardando(true);


      const datos = {

        ...(formulario.fecha_parto && {
          fecha_parto:
            formulario.fecha_parto,
        }),

        tipo_parto:
          formulario.tipo_parto,

        ...(formulario.complicaciones.trim() && {
          complicaciones:
            formulario
              .complicaciones
              .trim(),
        }),

        ...(formulario.observacion.trim() && {
          observacion:
            formulario
              .observacion
              .trim(),
        }),

        crias:
          formulario.crias.map(
            (cria) => ({

              sexo:
                cria.sexo,

              estado_nacimiento:
                cria.estado_nacimiento,

              ...(cria.peso_nacimiento_kg && {
                peso_nacimiento_kg:
                  Number(
                    cria.peso_nacimiento_kg
                  ),
              }),

              ...(cria.identificacion_temporal.trim() && {
                identificacion_temporal:
                  cria
                    .identificacion_temporal
                    .trim(),
              }),

              ...(cria.nombre.trim() && {
                nombre:
                  cria.nombre.trim(),
              }),

              ...(cria.raza.trim() && {
                raza:
                  cria.raza.trim(),
              }),

              ...(cria.observacion.trim() && {
                observacion:
                  cria
                    .observacion
                    .trim(),
              }),

            })
          ),

      };


      await registrarParto(
        animalId,
        gestacionId,
        datos
      );


      navigate(
        `/reproduccion/animal/${animalId}`
      );


    } catch (error) {

      console.error(
        "Error registrando parto:",
        error
      );

      setError(
        error.response?.data?.message ||
        "No fue posible registrar el parto."
      );


    } finally {

      setGuardando(false);

    }

  };


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando gestación...
        </div>

      </DashboardLayout>

    );

  }


  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                `/reproduccion/animal/${animalId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <p className="dashboard-label">
            Reproducción
          </p>

          <h1>
            Registrar parto
          </h1>

          <p>

            {
              animal?.nombre
              ||
              animal?.identificacion
              ||
              "Animal"
            }

            {
              gestacion?.fecha_probable_parto
                ? ` · Parto estimado ${new Date(
                    gestacion.fecha_probable_parto
                  ).toLocaleDateString(
                    "es-CO",
                    {
                      timeZone: "UTC",
                    }
                  )}`
                : ""
            }

          </p>

        </div>

      </div>


      {!gestacion ? (

        <div className="dashboard-error">
          Gestación no encontrada.
        </div>

      ) : gestacion.estado !== "activa" ? (

        <div className="dashboard-error">
          Esta gestación ya no está activa.
        </div>

      ) : (

        <div className="dashboard-panel">

          <form
            className="formulario-reproduccion"
            onSubmit={manejarGuardar}
          >

            <div className="form-grid">

              <div className="campo-formulario">

                <label>
                  Fecha del parto
                </label>

                <input
                  type="date"
                  name="fecha_parto"
                  value={
                    formulario.fecha_parto
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario">

                <label>
                  Tipo de parto
                </label>

                <select
                  name="tipo_parto"
                  value={
                    formulario.tipo_parto
                  }
                  onChange={manejarCambio}
                >

                  <option value="normal">
                    Normal
                  </option>

                  <option value="asistido">
                    Asistido
                  </option>

                  <option value="cesarea">
                    Cesárea
                  </option>

                  <option value="otro">
                    Otro
                  </option>

                </select>

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Complicaciones
                </label>

                <textarea
                  rows="2"
                  name="complicaciones"
                  value={
                    formulario.complicaciones
                  }
                  onChange={manejarCambio}
                />

              </div>


              <div className="campo-formulario campo-completo">

                <label>
                  Observación general
                </label>

                <textarea
                  rows="2"
                  name="observacion"
                  value={
                    formulario.observacion
                  }
                  onChange={manejarCambio}
                />

              </div>

            </div>


            <div className="seccion-reproduccion">

              <div className="lista-header">

                <div>

                  <h4>
                    Crías
                  </h4>

                  <span>
                    {
                      formulario.crias.length
                    } nacimiento(s)
                  </span>

                </div>


                <button
                  type="button"
                  className="boton-secundario"
                  onClick={agregarCria}
                >

                  <Plus size={15} />

                  Agregar cría

                </button>

              </div>


              {formulario.crias.map(
                (
                  cria,
                  indice
                ) => (

                  <div
                    className="dashboard-panel"
                    key={indice}
                  >

                    <div className="lista-header">

                      <div>

                        <h4>
                          Cría {indice + 1}
                        </h4>

                      </div>


                      {formulario.crias.length > 1 && (

                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() =>
                            quitarCria(
                              indice
                            )
                          }
                        >

                          <Trash2 size={15} />

                          Quitar

                        </button>

                      )}

                    </div>


                    <div className="form-grid">

                      <div className="campo-formulario">

                        <label>
                          Estado al nacer
                        </label>

                        <select
                          name="estado_nacimiento"
                          value={
                            cria.estado_nacimiento
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                        >

                          <option value="viva">
                            Viva
                          </option>

                          <option value="muerta">
                            Muerta
                          </option>

                        </select>

                      </div>


                      <div className="campo-formulario">

                        <label>
                          Sexo *
                        </label>

                        <select
                          name="sexo"
                          value={cria.sexo}
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                          required
                        >

                          <option value="">
                            Seleccionar
                          </option>

                          <option value="macho">
                            Macho
                          </option>

                          <option value="hembra">
                            Hembra
                          </option>

                          {cria.estado_nacimiento === "muerta" && (

                            <option value="desconocido">
                              Desconocido
                            </option>

                          )}

                        </select>

                      </div>


                      <div className="campo-formulario">

                        <label>
                          Peso al nacer (kg)
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          name="peso_nacimiento_kg"
                          value={
                            cria.peso_nacimiento_kg
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                        />

                      </div>


                      <div className="campo-formulario">

                        <label>
                          Identificación
                        </label>

                        <input
                          type="text"
                          name="identificacion_temporal"
                          value={
                            cria.identificacion_temporal
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                          placeholder="Opcional"
                        />

                      </div>


                      <div className="campo-formulario">

                        <label>
                          Nombre
                        </label>

                        <input
                          type="text"
                          name="nombre"
                          value={
                            cria.nombre
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                        />

                      </div>


                      <div className="campo-formulario">

                        <label>
                          Raza
                        </label>

                        <input
                          type="text"
                          name="raza"
                          value={
                            cria.raza
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                        />

                      </div>


                      <div className="campo-formulario campo-completo">

                        <label>
                          Observación
                        </label>

                        <textarea
                          rows="2"
                          name="observacion"
                          value={
                            cria.observacion
                          }
                          onChange={(e) =>
                            manejarCambioCria(
                              indice,
                              e
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                )
              )}

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
                onClick={() =>
                  navigate(
                    `/reproduccion/animal/${animalId}`
                  )
                }
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
                    ? "Registrando..."
                    : "Registrar parto"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </DashboardLayout>

  );

};


export default ReproduccionParto;
