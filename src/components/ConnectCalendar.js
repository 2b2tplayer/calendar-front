import React, { useState, useEffect } from "react";
import "./OnboardingSteps.css"; // Usaremos un CSS común para estilos repetidos
import {
  initiateGoogleAuth,
  getGoogleCalendarStatus,
  logout,
} from "../services/api"; // Importar funciones API
import { FcGoogle } from "react-icons/fc"; // Google icon
import { LuChevronDown } from "react-icons/lu";

const ConnectCalendar = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const [status, setStatus] = useState({ isConnected: false, email: null });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const result = await getGoogleCalendarStatus();
        setStatus(result || { isConnected: false });
      } catch (err) {
        setError("Error al verificar el estado de Google Calendar.");
        setStatus({ isConnected: false });
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const response = await initiateGoogleAuth();
      if (response && response.url) {
        // Redirect the user to Google's authorization screen
        window.location.href = response.url;
        // The backend will handle the callback and token storage
        // We might not reach the nextStep() here directly
      } else {
        throw new Error("No se recibió la URL de autorización.");
      }
    } catch (err) {
      console.error("Error initiating Google Auth:", err);
      setError(
        err.message || "Error al iniciar la conexión con Google Calendar."
      );
      setIsConnecting(false);
    }
    // Note: nextStep() might be called on the callback page or after status check confirms connection
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // If already connected, just proceed
    if (status.isConnected) {
      nextStep();
    } else {
      // Otherwise, initiate connection
      handleConnect();
    }
  };

  const handleSkip = () => {
    nextStep(); // Simply go to the next step
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login or clear state - This depends on overall App structure
      // For now, just log and maybe reload
      console.log("Logged out");
      window.location.reload(); // Simple way to reset state
    } catch (err) {
      setError("Error al cerrar sesión.");
    }
  };

  // Placeholder data for calendar list and dropdown
  const calendars = [
    { id: "1", name: status.email || "primary@gmail.com" },
    { id: "2", name: "Negocio EE.UU" },
    { id: "3", name: "KoaFY" },
    { id: "4", name: "Algo Trading" },
    { id: "5", name: "Isaac - Ape Funded" },
  ];
  const [selectedCalendar, setSelectedCalendar] = useState(calendars[0].id);

  return (
    <div className="onboarding-container">
      {/* Header y Progress Indicator similar a RegisterForm, podríamos refactorizarlo a un componente común más tarde */}
      <div className="progress-indicator" style={{ marginBottom: "40px" }}>
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`step ${i + 1 === currentStep ? "active" : ""}`}
          ></div>
        ))}
      </div>

      <div className="onboarding-card connect-calendar-card">
        <div className="calendar-header">
          <FcGoogle size={30} />
          <div className="calendar-info">
            <h4>Google Calendar</h4>
            {isLoadingStatus ? (
              <span>Verificando conexión...</span>
            ) : status.isConnected ? (
              <span className="connected-email">{status.email}</span>
            ) : (
              <span className="not-connected">No conectado</span>
            )}
          </div>
        </div>

        {/* Placeholder list of calendars - requires API integration post-connection */}
        <div className="calendar-list">
          {calendars.map((cal) => (
            <div key={cal.id} className="calendar-item">
              <label className="switch">
                <input
                  type="checkbox"
                  defaultChecked={cal.id === calendars[0].id}
                />
                <span className="slider round"></span>
              </label>
              <span>{cal.name}</span>
            </div>
          ))}
        </div>

        <div className="create-events-section">
          <label htmlFor="create-calendar-select">Crear eventos en</label>
          <div className="select-wrapper">
            <select
              id="create-calendar-select"
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
              disabled={!status.isConnected} // Disable if not connected
            >
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.name} ({cal.id === calendars[0].id ? "Google" : "Otro"})
                </option>
              ))}
            </select>
            <LuChevronDown className="select-arrow" />
          </div>
          <p className="info-text">
            Puedo anular esto por evento en la configuración avanzada de cada
            tipo de evento.
          </p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          onClick={handleContinue}
          className="submit-button"
          disabled={isConnecting || isLoadingStatus}
        >
          {isConnecting ? "Conectando..." : "Continuar >"}
        </button>

        <div className="optional-links connect-calendar-links">
          <button onClick={handleSkip} type="button" className="link-button">
            Conectaré mi calendario más tarde
          </button>
          <button
            onClick={handleLogout}
            type="button"
            className="link-button danger"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectCalendar;
