import React from "react";
import "./OnboardingSteps.css"; // Usaremos un CSS común para estilos repetidos

const ConnectCalendar = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const handleContinue = (e) => {
    e.preventDefault();
    nextStep();
  };

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

      <div className="onboarding-card">
        {/* Contenido específico del paso 2 */}
        <h3>Conecta tu Google Calendar</h3>
        {/* ... Resto de la UI para conectar calendario ... */}
        <p style={{ textAlign: "center", margin: "20px 0" }}>
          [UI Conectar Calendario]
        </p>

        <form onSubmit={handleContinue}>
          {/* ... Inputs/Selects si son necesarios ... */}
          <button type="submit" className="submit-button">
            Continuar &gt;
          </button>
        </form>
        {/* Enlaces opcionales */}
        <div className="optional-links">
          <button type="button" className="link-button">
            Conectaré mi calendario más tarde
          </button>
          <button type="button" className="link-button danger">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectCalendar;
