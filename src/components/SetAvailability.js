import React, { useState, useEffect } from "react";
import "./OnboardingSteps.css";
import { getAvailability, updateAvailability } from "../services/api"; // Importar funciones API

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
          // Combinar horario existente con el por defecto por si faltan días
          setSchedule({ ...defaultSchedule, ...currentAvailability.schedule });
        }
        // Si devuelve null (404), se usará el defaultSchedule
      } catch (err) {
        console.error("Error loading availability:", err);
        setError(
          "No se pudo cargar la disponibilidad. Usando horario por defecto."
        );
        // Mantenemos el horario por defecto en caso de error
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, []);

  const handleScheduleChange = (day, field, value) => {
    // Lógica para actualizar el estado 'schedule'
    // Esta función se llamaría desde los inputs/checkboxes de la UI real
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === "isWorking" ? !prev[day].isWorking : value,
      },
    }));
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAvailability({ schedule });
      nextStep(); // Ir al siguiente paso si la actualización es exitosa
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Error al guardar la disponibilidad. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
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
      <div className="onboarding-card">
        <h3>Establecer Disponibilidad</h3>
        <p>Define los rangos de tiempo en los que estas disponible</p>

        {isLoading ? (
          <div>Cargando disponibilidad...</div>
        ) : (
          <form onSubmit={handleContinue}>
            {/* --- UI Real para editar disponibilidad --- */}
            {/* Aquí iría el mapeo de los días y sus inputs */}
            {/* Ejemplo muy básico: */}
            <div
              style={{
                textAlign: "left",
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {Object.entries(schedule).map(([day, details]) => (
                <div
                  key={day}
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={details.isWorking}
                    onChange={() => handleScheduleChange(day, "isWorking")}
                    id={`working-${day}`}
                  />
                  <label
                    htmlFor={`working-${day}`}
                    style={{ width: "80px", textTransform: "capitalize" }}
                  >
                    {day}
                  </label>
                  <input
                    type="time"
                    value={details.start}
                    disabled={!details.isWorking}
                    onChange={(e) =>
                      handleScheduleChange(day, "start", e.target.value)
                    }
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={details.end}
                    disabled={!details.isWorking}
                    onChange={(e) =>
                      handleScheduleChange(day, "end", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
            {/* --- Fin UI Real --- */}

            {error && (
              <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Continuar >"}
            </button>
          </form>
        )}

        <div className="optional-links">
          {/* Botón para ir atrás (opcional pero útil) */}
          <button type="button" onClick={prevStep} className="link-button">
            Atrás
          </button>
          <button type="button" className="link-button danger">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetAvailability;
