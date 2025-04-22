import React from "react";
import "./OnboardingSteps.css";

const ConnectApps = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const handleContinue = (e) => {
    e.preventDefault();
    nextStep();
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
      <div className="onboarding-card">
        <h3>Conecte sus aplicaciones favoritas</h3>
        <p>Conecte sus aplicaciones de video para usarlas en sus eventos</p>
        {/* ... Lista de aplicaciones para conectar ... */}
        <p style={{ textAlign: "center", margin: "20px 0" }}>
          [UI Lista de Apps]
        </p>

        <form onSubmit={handleContinue}>
          <button type="submit" className="submit-button">
            Continuar &gt;
          </button>
        </form>
        <div className="optional-links">
          <button type="button" className="link-button">
            Configurar más tarde
          </button>
          <button type="button" className="link-button danger">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectApps;
