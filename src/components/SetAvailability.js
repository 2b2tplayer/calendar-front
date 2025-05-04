import React, { useState, useEffect } from "react";
import "./OnboardingSteps.css";
import { getAvailability, updateAvailability, logout } from "../services/api"; // Importar funciones API y logout
import { LuPlus } from "react-icons/lu"; // Usar un ícono consistente

// Estructura inicial para la disponibilidad por defecto
const defaultSchedule = {
  monday: { start: "09:00", end: "17:00", isWorking: true },
  tuesday: { start: "09:00", end: "17:00", isWorking: true },
  wednesday: { start: "09:00", end: "17:00", isWorking: true },
  thursday: { start: "09:00", end: "17:00", isWorking: true },
  friday: { start: "09:00", end: "17:00", isWorking: true },
  saturday: { start: "09:00", end: "13:00", isWorking: false },
  sunday: { start: "09:00", end: "13:00", isWorking: false },
};

// Mapeo de día a nombre completo (para labels)
const dayNameMap = {
  sunday: "Domingo",
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
};

// Orden deseado de los días
const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const SetAvailability = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Cargar disponibilidad existente al montar
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentAvailability = await getAvailability();
        if (currentAvailability && currentAvailability.schedule) {
          const completeSchedule = dayOrder.reduce((acc, day) => {
            acc[day] =
              currentAvailability.schedule[day] || defaultSchedule[day];
            return acc;
          }, {});
          setSchedule(completeSchedule);
        } else {
          setSchedule(defaultSchedule);
        }
      } catch (err) {
        console.error("Error loading availability:", err);
        setError(
          "No se pudo cargar la disponibilidad. Usando horario por defecto."
        );
        setSchedule(defaultSchedule);
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, []);

  const handleScheduleChange = (day, field, value) => {
    // Only update if isWorking is true for time changes
    if ((field === "start" || field === "end") && !schedule[day].isWorking) {
      // When turning a day off, we might want to clear times or keep them
      // For now, just prevent time changes if off
      return;
    }

    // Handle checkbox toggle for isWorking
    if (field === "isWorking") {
      value = !schedule[day].isWorking;
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAvailability({ schedule });
      nextStep();
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Error al guardar la disponibilidad. Inténtalo de nuevo.");
      setIsSubmitting(false); // Allow retry on error
    }
    // No need for finally here if nextStep navigates away
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login or clear state - depends on App structure
      // For now, just log out and reload
      window.location.reload(); // Simple reload to force state clear / redirect
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error al cerrar sesión.");
    }
  };

  const renderDayRow = (day) => {
    const details = schedule[day] || defaultSchedule[day];
    const dayLabel = dayNameMap[day];
    const isWorking = details.isWorking;

    return (
      <div key={day} className="day-availability-row">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isWorking}
            onChange={() => handleScheduleChange(day, "isWorking")}
          />
          <span className="slider round"></span>
        </label>
        <span className="day-name-label">{dayLabel}</span>
        <div className="time-inputs">
          <input
            type="time"
            value={details.start}
            disabled={!isWorking}
            onChange={(e) => handleScheduleChange(day, "start", e.target.value)}
            className={!isWorking ? "disabled" : ""}
          />
          <span>-</span>
          <input
            type="time"
            value={details.end}
            disabled={!isWorking}
            onChange={(e) => handleScheduleChange(day, "end", e.target.value)}
            className={!isWorking ? "disabled" : ""}
          />
        </div>
        <button
          type="button"
          className="add-interval-button"
          disabled={!isWorking}
        >
          <LuPlus />
        </button>
      </div>
    );
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
      <div className="onboarding-card form-card set-availability-card">
        <h3>Establecer Disponibilidad</h3>
        <p className="description">
          Define los rangos de tiempo en los que estas disponible Puedes
          personalizar todo esto mas tarde en la pagina de disponibilidad
        </p>

        {isLoading ? (
          <div>Cargando disponibilidad...</div>
        ) : (
          <div className="availability-editor">
            {dayOrder.map(renderDayRow)}
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <button
          type="button" // Changed to button as it doesn't submit a form directly here
          onClick={handleContinue}
          className="submit-button main-continue-button"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Guardando..." : "Continuar >"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="link-button logout-button"
        >
          Cerrar sesión
        </button>
        {/* Removed back button as it's not in the design */}
      </div>
    </div>
  );
};

export default SetAvailability;
