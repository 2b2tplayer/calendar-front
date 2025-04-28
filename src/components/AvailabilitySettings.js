import React, { useState, useEffect } from "react";
import { getAvailability, updateAvailability } from "../services/api";
import { LuPencil } from "react-icons/lu";
import "./AvailabilitySettings.css"; // We'll need to create this CSS file

// Mapeo de nombres de día a letras
const dayMap = {
  sunday: "D",
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

const AvailabilitySettings = () => {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
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
        setError("No se pudo cargar la disponibilidad.");
        setSchedule(defaultSchedule);
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset error when toggling edit mode
    setError(null);
  };

  const handleScheduleChange = (day, field, value) => {
    // Only update if isWorking is true for time changes
    if ((field === "start" || field === "end") && !schedule[day].isWorking) {
      return;
    }
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === "isWorking" ? !prev[day].isWorking : value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAvailability({ schedule });
      setIsEditing(false); // Exit edit mode on success
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Error al guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Cargando disponibilidad...</div>;
  }

  return (
    <div className="availability-settings-container">
      <h3>Disponibilidad</h3>

      <div className="availability-card">
        {/* Header with Edit/Save buttons */}
        <div className="availability-card-header">
          <h4>Horario Semanal</h4>
          {!isEditing ? (
            <button onClick={handleEditToggle} className="edit-button-main">
              <LuPencil /> Editar
            </button>
          ) : (
            <div>
              <button
                onClick={handleEditToggle}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Display List or Edit Form */}
        {!isEditing ? (
          <ul className="availability-list">
            {dayOrder.map((day) => {
              const details = schedule[day] || defaultSchedule[day];
              return (
                <li
                  key={day}
                  className={`availability-item ${
                    details.isWorking ? "" : "not-working"
                  }`}
                >
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
        ) : (
          <div className="availability-edit-form">
            {dayOrder.map((day) => {
              const details = schedule[day] || defaultSchedule[day];
              return (
                <div key={day} className="edit-day-row">
                  <div className="edit-day-label">
                    <input
                      type="checkbox"
                      checked={details.isWorking}
                      onChange={() => handleScheduleChange(day, "isWorking")}
                      id={`edit-working-${day}`}
                    />
                    <label
                      htmlFor={`edit-working-${day}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {day} {/* Full day name might be better here */}
                    </label>
                  </div>
                  <div className="edit-time-inputs">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Optionally add the "Intervalos de fechas" section here if needed */}
    </div>
  );
};

export default AvailabilitySettings;
