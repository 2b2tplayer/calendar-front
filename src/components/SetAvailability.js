import React, { useState, useEffect } from "react";
import "./OnboardingSteps.css";
import { getAvailability, updateAvailability } from "../services/api"; // Importar funciones API
import { LuPencil } from "react-icons/lu"; // Importar icono de lápiz

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

// Mapeo de nombres de día a letras
const dayMap = {
  sunday: "D", // Asumiendo que D es Domingo
  monday: "L",
  tuesday: "M",
  wednesday: "M",
  thursday: "J",
  friday: "V",
  saturday: "S",
};

// Orden deseado de los días
const dayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
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
          // Completar con default si faltan días en la respuesta
          const completeSchedule = dayOrder.reduce((acc, day) => {
            acc[day] =
              currentAvailability.schedule[day] || defaultSchedule[day];
            return acc;
          }, {});
          setSchedule(completeSchedule);
        } else {
          // Si devuelve null (404) o no tiene .schedule, usar default
          setSchedule(defaultSchedule);
        }
      } catch (err) {
        console.error("Error loading availability:", err);
        setError(
          "No se pudo cargar la disponibilidad. Usando horario por defecto."
        );
        setSchedule(defaultSchedule); // Asegurar que se use el default en error
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, []);

  const handleContinue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Guardar el horario actual (el que se cargó o el default)
      await updateAvailability({ schedule });
      nextStep();
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
      <div className="onboarding-card availability-card">
        <h4>Disponibilidad</h4>

        <h5>Intervalos de fechas</h5>
        <p className="availability-description">
          Los invitados pueden programar eventos en el futuro, en 60 dias, y con
          una antelación mínima de 4 horas para notificarlos.
        </p>

        {isLoading ? (
          <div>Cargando disponibilidad...</div>
        ) : (
          <div className="weekly-hours-section">
            <div className="default-schedule-notice">
              <span>
                Este tipo de eventos utiliza su{" "}
                <strong>horario por defecto</strong>
              </span>
              <button className="edit-button">
                <LuPencil />
              </button>
            </div>

            <h6>
              <span role="img" aria-label="refresh">
                🔄
              </span>{" "}
              Horas semanales
            </h6>
            <ul className="availability-list">
              {dayOrder.map((day) => {
                const details = schedule[day] || defaultSchedule[day]; // Fallback por si acaso
                return (
                  <li key={day} className="availability-item">
                    <span className="day-letter">{dayMap[day]}</span>
                    <span className="day-schedule">
                      {details.isWorking
                        ? `${details.start} - ${details.end}`
                        : "No disponible"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

        <button
          type="button"
          onClick={handleContinue}
          className="submit-button"
          disabled={isSubmitting || isLoading}
          style={{ marginTop: "20px" }}
        >
          {isSubmitting ? "Guardando..." : "Continuar >"}
        </button>

        <div className="optional-links">
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
