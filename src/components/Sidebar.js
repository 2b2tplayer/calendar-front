import React from "react";
import "./Sidebar.css"; // Crearemos este archivo CSS más tarde
import {
  LuLayoutDashboard,
  LuCalendarDays,
  LuClock,
  LuFileText,
  LuPhone,
  LuSettings,
  LuChevronDown,
} from "react-icons/lu";
import { FaReact } from "react-icons/fa"; // Icono de Koafy (ejemplo)

// Recibir userData y onCreateEventClick como props
const Sidebar = ({ userData, onCreateEventClick }) => {
  // Usar datos del usuario o valores por defecto si no están disponibles
  const userName = userData?.name || "Usuario";
  const userEmail = userData?.email || "email@ejemplo.com";
  // Usar profilePicture o un placeholder
  const userAvatar =
    userData?.profilePicture || "https://via.placeholder.com/30";

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaReact className="logo-icon" />{" "}
        {/* Reemplaza con tu logo real si lo tienes */}
        <span className="logo-text">Koafy</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            className="active"
            onClick={onCreateEventClick}
            style={{ cursor: "pointer" }}
          >
            <LuLayoutDashboard /> Crear reunión
          </li>
          <li>
            <LuCalendarDays /> Eventos
          </li>
          <li>
            <LuClock /> Disponibilidad
          </li>
        </ul>
      </nav>
      <div className="sidebar-bottom">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <LuFileText /> Documentos
            </li>
            <li>
              <LuPhone /> Soporte
            </li>
            <li>
              <LuSettings /> Ajustes
            </li>
          </ul>
        </nav>
        <div className="user-profile">
          <img src={userAvatar} alt="Avatar" className="user-avatar" />{" "}
          {/* Reemplaza con la imagen real */}
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <LuChevronDown className="user-menu-icon" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
