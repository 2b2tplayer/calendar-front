import React from "react";
import "./OnboardingSteps.css";
import { SiGooglemeet, SiZoom, SiDiscord, SiJitsi } from "react-icons/si";
import { logout } from "../services/api";

const ConnectApps = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const apps = [
    { id: "meet", name: "Google Meet", icon: SiGooglemeet, connected: false },
    { id: "zoom", name: "Zoom video", icon: SiZoom, connected: false },
    { id: "discord", name: "Discord", icon: SiDiscord, connected: false },
    { id: "jitsi", name: "Jitsi video", icon: SiJitsi, connected: false },
  ];

  const handleContinue = (e) => {
    e.preventDefault();
    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="progress-indicator" style={{ marginBottom: "40px" }}>
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`step ${i + 1 === currentStep ? "active" : ""}`}
          ></div>
        ))}
      </div>
      <div className="onboarding-card connect-apps-card">
        <h3>Conecte sus aplicaciones favoritas</h3>
        <p className="subtitle">
          Conecte sus aplicaciones de video para usarlas en sus eventos
        </p>

        <div className="apps-list">
          {apps.map((app) => {
            const IconComponent = app.icon;
            return (
              <div key={app.id} className="app-item">
                <div className="app-info">
                  <IconComponent className={`app-icon ${app.id}`} />
                  <span>{app.name}</span>
                </div>
                <button
                  className={`connect-button ${
                    app.connected ? "connected" : ""
                  }`}
                  disabled
                >
                  {app.connected ? "Conectado" : "Conectar"}
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={handleContinue} className="submit-button">
          Continuar &gt;
        </button>

        <div className="optional-links">
          <button onClick={handleSkip} type="button" className="link-button">
            Configurar más tarde
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

export default ConnectApps;
