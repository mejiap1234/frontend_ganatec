import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerAnimales,
} from "../../services/animales.service";

import {
  registrarVentaAnimal,
} from "../../services/finanzas.service";


const VentaAnimalNueva = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    animales,
    setAnimales,
  ] = useState([]);


  const [
    animalSeleccionado,
    setAnimalSeleccionado,
  ] = useState("");


  const [formulario, setFormulario] =
    useState({

      comprador: "",

      precio_venta: "",

      fecha_venta: "",

      observacion: "",

    });


  const [cargando, setCargando] =
    useState(true);


  const [guardando, setGuardando] =
    useState(false);


  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR ANIMALES ACTIVOS
  ========================================================= */

  useEffect(() => {

    const cargarAnimales =
      async () => {

        try {

          setCargando(true);

          setError("");


          const respuesta =
            await obtenerAnimales();


          const lista =
            Array.isArray(respuesta)
              ? respuesta
              : Array.isArray(
                  respuesta?.animales
                )
                ? respuesta.animales
                : Array.isArray(
                    respuesta?.data?.animales
                  )
                  ? respuesta.data.animales
                  : Array.isArray(
                      respuesta?.data
                    )
                    ? respuesta.data
                    : [];


          const activos =
            lista.filter(
              (animal) =>
                String(
                  animal.estado
                  ||
                  ""
                )
                  .trim()
                  .toLowerCase()
                === "activo"
            );


          setAnimales(
            activos
          );


        } catch (error) {

          console.error(
            "Error cargando animales:",
            error
          );


          setError(
            "No fue posible cargar los animales activos."
          );


        } finally {

          setCargando(false);

        }

      };


    cargarAnimales();

  }, []);


  /* =========================================================
     CAMBIAR CAMPOS
  ========================================================= */

  const manejarCambio =
    (e) => {

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
     ANIMAL SELECCIONADO
  ========================================================= */

  const animalActual =
    animales.find(
      (animal) =>
        String(animal.id)
        ===
        String(animalSeleccionado)
    );


  /* =========================================================
     FORMATEAR DINERO
  ========================================================= */

  const formatearDinero =
    (valor) => {

      return new Intl.NumberFormat(
        "es-CO",
        {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }
      ).format(
        Number(valor || 0)
      );

    };


  /* =========================================================
     GUARDAR VENTA
  ========================================================= */

  const manejarGuardar =
    async (e) => {

      e.preventDefault();

      setError("");


      if (!animalSeleccionado) {

        setError(
          "Debes seleccionar un animal."
        );

        return;

      }


      if (
        formulario.precio_venta === ""
        ||
        Number(
          formulario.precio_venta
        ) <= 0
      ) {

        setError(
          "El precio de venta debe ser mayor que cero."
        );

        return;

      }


      const confirmar =
        window.confirm(
          `¿Confirmas la venta de ${
            animalActual?.nombre
            ||
            animalActual?.identificacion
            ||
            "este animal"
          } por ${
            formatearDinero(
              formulario.precio_venta
            )
          }? El animal cambiará a estado vendido.`
        );


      if (!confirmar) {
        return;
      }


      try {

        setGuardando(true);


        await registrarVentaAnimal(
          animalSeleccionado,
          {

            comprador:
              formulario.comprador.trim()
              ||
              undefined,

            precio_venta:
              Number(
                formulario.precio_venta
              ),

            fecha_venta:
              formulario.fecha_venta
                ? formulario.fecha_venta
                : undefined,

            observacion:
              formulario.observacion.trim()
              ||
              undefined,

          }
        );


        navigate(
          "/finanzas"
        );


      } catch (error) {

        console.error(
          "Error registrando venta de animal:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible registrar la venta del animal."
        );


      } finally {

        setGuardando(false);

      }

    };


  /* =========================================================
     CARGA
  ========================================================= */

  if (cargando) {

    return (

      <div className="dashboard-loading">

        Cargando animales...

      </div>

    );

  }


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      <div className="modulo-subheader">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Registrar venta de animal
          </h2>


          <p>
            Registra la venta de un animal
            activo de la finca.
          </p>

        </div>

      </div>


      <div className="dashboard-panel">

        <form
          className="formulario-reproduccion"
          onSubmit={manejarGuardar}
        >

          <div className="form-grid">


            {/* ANIMAL */}

            <div className="campo-formulario campo-completo">

              <label>
                Animal *
              </label>


              <select
                value={
                  animalSeleccionado
                }
                onChange={(e) =>
                  setAnimalSeleccionado(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Seleccionar animal
                </option>


                {
                  animales.map(
                    (animal) => (

                      <option
                        key={
                          animal.id
                        }
                        value={
                          animal.id
                        }
                      >

                        {
                          animal.identificacion
                        }

                        {
                          animal.nombre
                            ? ` - ${animal.nombre}`
                            : ""
                        }

                        {
                          animal.raza
                            ? ` - ${animal.raza}`
                            : ""
                        }

                      </option>

                    )
                  )
                }

              </select>


              {
                animales.length === 0
                && (

                  <small className="texto-secundario">

                    No hay animales activos
                    disponibles para vender.

                  </small>

                )
              }

            </div>


            {/* INFORMACIÓN DEL ANIMAL */}

            {
              animalActual
              && (

                <div className="campo-formulario campo-completo">

                  <div className="dashboard-card">

                    <div>

                      <span>
                        Animal seleccionado
                      </span>


                      <strong>

                        {
                          animalActual.nombre
                          ||
                          animalActual.identificacion
                        }

                      </strong>


                      <small>

                        ID:
                        {" "}
                        {
                          animalActual.identificacion
                          ||
                          "-"
                        }

                        {" · "}

                        {
                          animalActual.sexo
                          ||
                          "-"
                        }

                        {" · "}

                        {
                          animalActual.raza
                          ||
                          "Raza no registrada"
                        }

                      </small>

                    </div>

                  </div>

                </div>

              )
            }


            {/* COMPRADOR */}

            <div className="campo-formulario">

              <label>
                Comprador
              </label>


              <input
                type="text"
                name="comprador"
                placeholder="Ej: Juan Pérez"
                value={
                  formulario.comprador
                }
                onChange={manejarCambio}
              />

            </div>


            {/* PRECIO */}

            <div className="campo-formulario">

              <label>
                Precio de venta *
              </label>


              <input
                type="number"
                name="precio_venta"
                min="1"
                step="1"
                placeholder="Ej: 3500000"
                value={
                  formulario.precio_venta
                }
                onChange={manejarCambio}
                required
              />


              {
                formulario.precio_venta
                &&
                Number(
                  formulario.precio_venta
                ) > 0
                && (

                  <small className="texto-secundario">

                    {
                      formatearDinero(
                        formulario.precio_venta
                      )
                    }

                  </small>

                )
              }

            </div>


            {/* FECHA */}

            <div className="campo-formulario">

              <label>
                Fecha de venta
              </label>


              <input
                type="datetime-local"
                name="fecha_venta"
                value={
                  formulario.fecha_venta
                }
                onChange={manejarCambio}
              />


              <small className="texto-secundario">
                Si la dejas vacía,
                GANATEC utilizará la fecha actual.
              </small>

            </div>


            {/* OBSERVACIÓN */}

            <div className="campo-formulario campo-completo">

              <label>
                Observación
              </label>


              <textarea
                rows="4"
                name="observacion"
                placeholder="Información adicional sobre la venta"
                value={
                  formulario.observacion
                }
                onChange={manejarCambio}
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
              onClick={() =>
                navigate(
                  "/finanzas"
                )
              }
            >

              Cancelar

            </button>


            <button
              type="submit"
              className="boton-principal"
              disabled={
                guardando
                ||
                animales.length === 0
              }
            >

              <Save size={16} />

              {
                guardando
                  ? "Registrando..."
                  : "Registrar venta"
              }

            </button>

          </div>

        </form>

      </div>

    </>

  );

};


export default VentaAnimalNueva;