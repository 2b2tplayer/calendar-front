import React from "react";
import "./Sidebar.css"; // Crearemos este archivo CSS más tarde
import {
  LuPresentation,
  LuCircleCheck,
  LuFileText,
  LuPhone,
  LuSettings,
  LuChevronDown,
  LuUser,
} from "react-icons/lu";
import { FaHome } from "react-icons/fa"; // Import FaHome from Font Awesome

// Recibir props actualizadas
const Sidebar = ({
  userData,
  currentView,
  showDashboard,
  showAvailabilitySettings,
  showCreateEventTypeForm,
  // onCreateEventClick ya no se usa directamente
}) => {
  // Usar datos del usuario o valores por defecto si no están disponibles
  const userName = userData?.name || "Usuario";
  const userEmail = userData?.email || "email@ejemplo.com";

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <svg
          width="100"
          height="37"
          viewBox="0 0 159 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.3187 27.7264C45.5145 27.4516 57.9352 15.8025 58.0478 0.0441766C54.8924 0.0723053 31.2838 -0.129487 30.3832 0.150799L30.3187 27.7264Z"
            fill="#8AA0EC"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30.464 57.9999H58.0092C58.3921 47.3508 51.3351 36.9202 41.6875 32.8433C38.6983 31.5801 34.0431 30.3917 30.3322 30.2343L30.464 57.9998V57.9999Z"
            fill="#5E7EF7"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-2.9743e-06 57.9999H27.3772C27.1311 56.6757 18.1345 48.0893 15.7458 45.9435C13.9278 44.3104 8.98666 39.2182 7.14334 37.3172C5.98553 36.1234 4.94042 35.1864 3.73502 33.9328C3.30164 33.482 0.539941 30.9915 -0.000114441 30.7313V58L-2.9743e-06 57.9999Z"
            fill="#918CF2"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-2.9743e-06 10.3942V27.3168C0.476517 27.1053 2.79212 24.7161 3.449 24.0209C4.53112 22.8761 5.75335 21.8024 6.9048 20.6864C11.3853 16.3439 16.3282 11.3379 20.8411 7.20216C21.8955 6.23578 26.8546 1.32737 27.4229 0.15164L0.0916226 0.0709229L-0.000114441 10.3942H-2.9743e-06Z"
            fill="#5E7EF7"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M132.735 21.1538L130.062 21.1732L130.067 24.2301L132.787 24.237L132.785 37.4585L136.635 37.4592L136.634 24.2632L141.044 24.2284C141.054 23.3607 140.925 22.1922 141.132 21.3785L147.356 35.6694C147.988 37.0954 148.398 37.188 147.643 38.6287C145.79 42.1612 142.753 39.6323 142.074 39.3444L140.617 42.0817C140.947 42.4001 140.813 42.3808 141.361 42.695C143.535 43.9411 146.576 44.031 148.637 42.6245C150.518 41.3413 151.414 38.5955 152.571 35.9853L157.392 24.8839C157.86 23.8013 158.712 22.1448 159 21.044C154.64 21.0401 155.557 20.6625 154.777 22.4072L150.2 33.1144C149.889 32.7634 145.273 21.9914 145.026 21.044C142.753 21.0229 137.984 21.3342 136.568 21.1368C136.386 19.8147 136.583 18.5421 137.468 17.9213C138.699 17.0577 139.975 17.7006 141.048 18.1141C141.383 17.6784 142.038 15.84 142.099 15.2326C139.018 13.8344 134.832 14.0182 133.323 17.4368C132.67 18.9172 132.988 19.6516 132.736 21.154L132.735 21.1538Z"
            fill="#201E1E"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M72.4187 37.4508L76.3953 37.4591C76.4094 36.4404 76.4015 35.4185 76.4015 34.4001C76.4013 33.3888 76.2127 32.2248 76.7167 31.651C77.5894 30.657 78.9929 29.5132 79.6858 28.4864C80.1224 28.6473 80.12 28.7318 80.4515 29.1258L87.0615 37.0051C87.6298 37.6854 88.2846 37.4596 89.2825 37.4586C90.2007 37.4577 91.124 37.4678 92.0414 37.4498C91.7568 36.814 87.8553 32.1389 87.3393 31.5149L82.5807 25.5338C82.9482 24.9127 83.1868 24.8807 83.6695 24.3706C84.0795 23.9377 84.3772 23.5838 84.7765 23.123L89.2668 18.3431C90.0121 17.6005 90.9794 16.7261 91.511 15.9172C90.4642 15.9234 89.4127 15.9269 88.3661 15.9199C86.6105 15.908 87.0452 16.0202 86.165 16.9495L78.0993 25.2003C77.6242 25.7085 77.0117 26.5674 76.4132 26.8478L76.401 15.9687L72.4537 15.9178L72.4187 37.4509V37.4508Z"
            fill="#201E1E"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M123.358 30.4187C124.47 34.6418 118.914 35.7654 116.927 34.2117C115.546 33.1325 115.987 31.0561 117.753 30.5941C119.028 30.261 121.895 30.4187 123.358 30.4187ZM112.881 22.752C112.995 23.2949 114.044 25.2859 114.381 25.6022C115.675 24.6653 117.797 23.8887 120.008 24.0746C122.09 24.2498 123.706 25.5413 123.393 27.8498C120.932 27.8498 117.587 27.6404 115.431 28.407C110.8 30.0537 111.258 36.7949 117.183 37.5924C119.952 37.9652 121.922 37.4149 123.647 35.5654L123.685 37.4621L127.243 37.457C127.527 35.7182 127.288 31.3278 127.288 29.315C127.288 26.6907 127.055 24.2495 125.629 22.7895C123.198 20.2986 117.531 20.3991 114.257 22.017C113.749 22.2677 113.304 22.59 112.882 22.7519L112.881 22.752Z"
            fill="#201E1E"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M96.3873 29.8365C95.8077 22.6125 105.661 22.1672 106.127 28.6629C106.658 36.0624 96.8965 36.1821 96.3873 29.8365ZM100.139 20.9175C95.4337 21.4346 91.8853 25.146 92.5599 30.478C93.1338 35.0149 97.2611 38.2303 102.554 37.6009C107.153 37.0539 110.547 33.3116 109.967 28.0993C109.455 23.5029 105.358 20.3438 100.139 20.9174V20.9175Z"
            fill="#201E1E"
          />
        </svg>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            className={currentView === "dashboard" ? "active" : ""}
            onClick={showDashboard}
            style={{ cursor: "pointer" }}
          >
            <FaHome /> Home
          </li>
          <li
            className={currentView === "createEventType" ? "active" : ""}
            onClick={showCreateEventTypeForm}
            style={{ cursor: "pointer" }}
          >
            <LuPresentation /> Eventos
          </li>
          <li
            className={currentView === "availability" ? "active" : ""}
            onClick={showAvailabilitySettings}
            style={{ cursor: "pointer" }}
          >
            <LuCircleCheck /> Disponibilidad
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
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Avatar"
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar placeholder-avatar">
              <LuUser />
            </div>
          )}
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
