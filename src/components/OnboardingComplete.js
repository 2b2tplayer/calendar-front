import React from "react";
import "./OnboardingSteps.css";
import { FaReact } from "react-icons/fa"; // Icono Koafy

const OnboardingComplete = ({ onComplete }) => {
  const handleGoToDashboard = () => {
    onComplete();
  };

  return (
    <div className="onboarding-container final-step">
      <div className="register-header" style={{ marginBottom: "30px" }}>
        <FaReact className="logo-icon-large" />
        <span className="logo-text-large">Koafy</span>
      </div>
      <h1>¡Registro finalizado con éxito!</h1>
      <button
        className="submit-button"
        style={{ width: "auto", padding: "12px 30px", marginTop: "20px" }}
        onClick={handleGoToDashboard}
      >
        Agendar reunión
      </button>
    </div>
  );
};

export default OnboardingComplete;
