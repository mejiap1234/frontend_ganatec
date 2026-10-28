import {
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  Map,
  Layers3,
} from "lucide-react";

import DashboardLayout
  from "../../layouts/DashboardLayout";


const PotrerosLayout = () => {

  return (

    <DashboardLayout>

      <div className="pagina-header">

        <div>

          <p className="dashboard-label">
            Manejo de la finca
          </p>

          <h1>
            Potreros y lotes
          </h1>

          <p>
            Organiza los potreros, la rotación
            y la ubicación de los lotes.
          </p>

        </div>

      </div>


      <div className="potreros-navegacion">

        <NavLink
          to="/potreros"
          end
          className={({ isActive }) =>
            isActive
              ? "potreros-nav-item activo"
              : "potreros-nav-item"
          }
        >

          <Map size={17} />

          Potreros

        </NavLink>


        <NavLink
          to="/potreros/lotes"
          className={({ isActive }) =>
            isActive
              ? "potreros-nav-item activo"
              : "potreros-nav-item"
          }
        >

          <Layers3 size={17} />

          Lotes

        </NavLink>

      </div>


      <Outlet />

    </DashboardLayout>

  );

};


export default PotrerosLayout;