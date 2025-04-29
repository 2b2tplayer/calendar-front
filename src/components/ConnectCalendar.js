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
  const [isRetryingFetch, setIsRetryingFetch] = useState(false);
  const [authUrl, setAuthUrl] = useState(null); // State to store authUrl
  const [error, setError] = useState(null);

  // Function to fetch auth URL (can be called on mount or on button click)
  const fetchAuthUrl = async () => {
    setError(null);
    try {
      const response = await initiateGoogleAuth();
      // Correct the path: Check directly for response.authUrl
      if (response?.authUrl) {
        setAuthUrl(response.authUrl);
      } else {
        // Only set error if we tried to fetch and failed
        setError("No se pudo obtener la URL de autorización del servidor.");
        console.error("Auth URL not found in response:", response);
      }
    } catch (err) {
      console.error("Error initiating Google Auth:", err);
      setError(
        err.message || "Error al iniciar la conexión con Google Calendar."
      );
    }
  };

  // Check connection status on mount and fetch Auth URL if not connected
  useEffect(() => {
    const checkStatusAndFetchUrl = async () => {
      setIsLoadingStatus(true);
      setError(null);
      try {
        const result = await getGoogleCalendarStatus();
        setStatus(result || { isConnected: false });
        if (!result?.isConnected) {
          await fetchAuthUrl(); // Fetch URL if not connected
        }
      } catch (err) {
        setError("Error al verificar el estado de Google Calendar.");
        setStatus({ isConnected: false });
        await fetchAuthUrl(); // Attempt to fetch URL even if status check failed initially
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkStatusAndFetchUrl();
  }, []);

  const handleContinueOrConnect = async (e) => {
    e.preventDefault();
    if (status.isConnected) {
      nextStep(); // Continue if connected
    } else if (authUrl) {
      setIsConnecting(true);
      window.location.href = authUrl; // Redirect to Google Auth
    } else {
      // Try fetching the URL again if it wasn't loaded initially
      setIsRetryingFetch(true);
      setError(null);
      await fetchAuthUrl();
      setIsRetryingFetch(false);
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

  // Placeholder data - keep simple or remove until connection
  const calendars = [
    { id: "1", name: status.email || "primary@gmail.com" },
    // Removed other hardcoded calendars
  ];
  const [selectedCalendar, setSelectedCalendar] = useState(
    calendars[0]?.id || null
  );

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

        {/* Hide hardcoded list and dropdown if not connected */}
        {status.isConnected && (
          <>
            {/* Placeholder list - Replace with fetched data later */}
            <div className="calendar-list">
              {calendars.map((cal) => (
                <div key={cal.id} className="calendar-item">
                  <label className="switch">
                    <input type="checkbox" defaultChecked={true} />
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
                  disabled={!status.isConnected}
                >
                  {calendars.map((cal) => (
                    <option key={cal.id} value={cal.id}>
                      {cal.name}
                    </option>
                  ))}
                </select>
                <LuChevronDown className="select-arrow" />
              </div>
              <p className="info-text">
                Puedo anular esto por evento en la configuración avanzada de
                cada tipo de evento.
              </p>
            </div>
          </>
        )}

        {/* Only show specific connection error if authUrl couldn't be fetched */}
        {!status.isConnected && error && (
          <p className="error-message">{error}</p>
        )}

        <button
          onClick={handleContinueOrConnect}
          className="submit-button"
          disabled={isLoadingStatus || isRetryingFetch || isConnecting}
        >
          {isLoadingStatus || isRetryingFetch
            ? "Cargando..."
            : status.isConnected
            ? "Continuar >"
            : isConnecting
            ? "Redirigiendo..."
            : "Conectar Google Calendar"}
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
