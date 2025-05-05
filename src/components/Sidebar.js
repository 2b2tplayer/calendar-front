import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Link, useLocation } from "react-router-dom"; // Import Link and useLocation
import "./Sidebar.css"; // Crearemos este archivo CSS más tarde
import { FaHome } from "react-icons/fa"; // Import FaHome from Font Awesome
import {
  LuChartColumn,
  LuCircleCheck,
  LuFileText,
  LuPhone,
  LuSettings,
  LuUser,
  LuChevronDown,
} from "react-icons/lu";
import { logout } from "../services/api"; // Import logout function

// Define a helper function or component for list items
const SidebarItem = ({ to, icon, label, currentPath }) => (
  <li>
    <Link to={to} className={currentPath === to ? "active" : ""}>
      {icon}
      <span>{label}</span>
    </Link>
  </li>
);

SidebarItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  currentPath: PropTypes.string.isRequired, // Added prop type
};

// Recibir props actualizadas
const Sidebar = ({ userData }) => {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname; // Extract path

  const handleLogout = async () => {
    await logout();
    // Optionally, redirect to login page or refresh
    window.location.href = "/"; // Simple refresh/redirect
  };

  // Solo SVG, sin texto
  const logoSection = (
    <div className="koafy-logo-section">
      <span className="koafy-logo-svg">
        <svg
          width="40"
          height="40"
          viewBox="0 0 58 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.3187 27.7264C45.5145 27.4516 57.9352 15.8025 58.0478 0.0441766C54.8924 0.0723053 31.2838 -0.129487 30.3832 0.150799L30.3187 27.7264Z"
            fill="#8AA0EC"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.464 57.9999H58.0092C58.3921 47.3508 51.3351 36.9202 41.6875 32.8433C38.6983 31.5801 34.0431 30.3917 30.3322 30.2343L30.464 57.9998V57.9999Z"
            fill="#5E7EF7"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-2.9743e-06 57.9999H27.3772C27.1311 56.6757 18.1345 48.0893 15.7458 45.9435C13.9278 44.3104 8.98666 39.2182 7.14334 37.3172C5.98553 36.1234 4.94042 35.1864 3.73502 33.9328C3.30164 33.482 0.539941 30.9915 -0.000114441 30.7313V58L-2.9743e-06 57.9999Z"
            fill="#918CF2"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-2.9743e-06 10.3942V27.3168C0.476517 27.1053 2.79212 24.7161 3.449 24.0209C4.53112 22.8761 5.75335 21.8024 6.9048 20.6864C11.3853 16.3439 16.3282 11.3379 20.8411 7.20216C21.8955 6.23578 26.8546 1.32737 27.4229 0.15164L0.0916226 0.0709229L-0.000114441 10.3942H-2.9743e-06Z"
            fill="#5E7EF7"
          ></path>
        </svg>
      </span>
      <span className="koafy-logo-text">Koafy</span>
    </div>
  );

  return (
    <div className="sidebar">
      {/* Top Section: Logo and Main Nav */}
      <div className="sidebar-top">
        <div className="sidebar-header">{logoSection}</div>
        <nav className="sidebar-nav main-nav">
          <ul>
            <SidebarItem
              to="/"
              icon={<FaHome />}
              label="Home"
              currentPath={currentPath}
            />
            <SidebarItem
              to="/eventos"
              icon={<LuChartColumn />}
              label="Eventos"
              currentPath={currentPath}
            />
            <SidebarItem
              to="/disponibilidad"
              icon={<LuCircleCheck />}
              label="Disponibilidad"
              currentPath={currentPath}
            />
          </ul>
        </nav>
      </div>

      {/* Divider */}
      <hr className="sidebar-divider" />

      {/* Bottom Section: Secondary Nav and User Profile */}
      <div className="sidebar-bottom">
        <nav className="sidebar-nav secondary-nav">
          {" "}
          {/* Add class for potential styling */}
          <ul>
            {/* These are not Links as they don't have routes yet */}
            <li>
              <LuFileText /> <span>Documentos</span>
            </li>
            <li>
              <LuPhone /> <span>Soporte</span>
            </li>
            <li>
              <LuSettings /> <span>Ajustes</span>
            </li>
          </ul>
        </nav>
        <div
          className="user-profile koafy-profile"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Avatar"
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar placeholder-avatar">
              <LuUser size={20} />
            </div>
          )}
          <div className="user-info">
            <span className="user-name">{userData?.name || "Usuario"}</span>
            <span className="user-email">
              {userData?.email || "email@ejemplo.com"}
            </span>
          </div>
          <LuChevronDown className="user-profile-chevron" />
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    profilePicture: PropTypes.string,
  }),
};

export default Sidebar;
