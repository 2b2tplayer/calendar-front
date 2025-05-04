import React, { useState, useEffect } from "react";
import { getAvailability, updateUserProfile } from "../services/api";
import {
  LuCopy,
  LuPlus,
  LuX,
  LuRefreshCw,
  LuCalendarDays,
} from "react-icons/lu";
import "./AvailabilitySettings.css"; // Styles will need significant updates

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
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("horario"); // State for tabs
  const [timeZone, setTimeZone] = useState("America/Buenos_Aires"); // State for timezone
  const [isSavingTimezone, setIsSavingTimezone] = useState(false);

  // Load availability and potentially user profile for initial timezone
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch availability first
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

        // TODO: Fetch user profile data here if needed to get the initial timezone
        // For now, we rely on the default state value or potentially a value from userData prop if passed
        // Example: const userProfile = await getCurrentUser(); // Assuming getCurrentUser returns profile
        // if (userProfile.timezone) setTimeZone(userProfile.timezone);
      } catch (err) {
        console.error("Error loading availability settings data:", err);
        setError("No se pudo cargar la configuración de disponibilidad.");
        setSchedule(defaultSchedule);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle timezone change
  const handleTimeZoneChange = async (e) => {
    const newTimeZone = e.target.value;
    setTimeZone(newTimeZone);
    setIsSavingTimezone(true);
    setError(null); // Clear previous errors
    console.log("Attempting to save timezone:", newTimeZone);
    try {
      // Call API to update profile with the new timezone
      await updateUserProfile({ timezone: newTimeZone });
      // Optional: Show a success message
    } catch (err) {
      console.error("Error saving timezone:", err);
      setError("Error al guardar la zona horaria.");
      // Optionally revert timezone state? Depends on desired UX
    } finally {
      setIsSavingTimezone(false);
    }
  };

  // Placeholder handlers for new buttons
  const handleAddInterval = (day) => {
    console.log("Add interval for:", day);
    // TODO: Implement logic to add a new time interval for the day
    // This will require changes to the schedule state structure (e.g., array of intervals)
  };

  const handleRemoveInterval = (day, index) => {
    console.log("Remove interval for:", day, "at index:", index);
    // TODO: Implement logic to remove a specific time interval
  };

  const handleCopyHours = (day) => {
    console.log("Copy hours from:", day);
    // TODO: Implement logic to copy intervals from one day to others
  };

  // Render function for a single day row in the new format
  const renderDayRow = (day) => {
    const details = schedule[day] || defaultSchedule[day];
    const isWorking = details.isWorking;
    const timeDisplay = isWorking
      ? `${details.start} - ${details.end}`
      : "No disponible";

    return (
      <div
        key={day}
        className={`schedule-day-row ${!isWorking ? "unavailable" : ""}`}
      >
        <span className="day-letter-icon">{dayMap[day]}</span>
        <span className="day-time-display">{timeDisplay}</span>
        <div className="day-actions">
          {isWorking && (
            <button
              onClick={() => handleRemoveInterval(day, 0)}
              className="icon-button delete-button"
            >
              <LuX />
            </button>
          )}
          <button
            onClick={() => handleAddInterval(day)}
            className="icon-button add-button"
          >
            <LuPlus />
          </button>
          {isWorking && (
            <button
              onClick={() => handleCopyHours(day)}
              className="icon-button copy-button"
            >
              <LuCopy />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div>Cargando disponibilidad...</div>;
  }

  return (
    <div className="availability-settings-page">
      <h2>Disponibilidad</h2>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "horario" ? "active" : ""}`}
          onClick={() => setActiveTab("horario")}
        >
          Horario
        </button>
        <button
          className={`tab-button ${activeTab === "festivos" ? "active" : ""}`}
          onClick={() => setActiveTab("festivos")}
        >
          Festivos
        </button>
        <button
          className={`tab-button ${
            activeTab === "configuracion" ? "active" : ""
          }`}
          onClick={() => setActiveTab("configuracion")}
        >
          Configuración
        </button>
      </div>

      {activeTab === "horario" && (
        <div className="tab-content">
          <div className="content-section horario-predeterminado">
            <h4>Horario predeterminado</h4>
            {/* Placeholder count - fetch actual count later */}
            <p>Activo en: 1 tipo de evento</p>
          </div>

          <div className="content-section horas-semanales">
            <div className="section-header">
              <LuRefreshCw /> {/* Icon for weekly hours */}
              <h4>Horas semanales</h4>
            </div>
            <p className="section-description">
              Establece cuando sueles estar disponible para las reuniones.
            </p>
            {error && <p className="error-message">{error}</p>}
            <div className="schedule-list">{dayOrder.map(renderDayRow)}</div>
          </div>

          <div className="content-section zona-horaria">
            <label htmlFor="timezone-select">Zona horaria</label>
            <select
              id="timezone-select"
              name="timezone"
              value={timeZone}
              onChange={handleTimeZoneChange}
              className="timezone-select-element"
              disabled={isSavingTimezone}
            >
              <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Santiago">Santiago (GMT-4/-3)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">
                Ciudad de México (GMT-6)
              </option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1/+2)</option>
              <option value="UTC">UTC</option>
            </select>
            {isSavingTimezone && (
              <span className="saving-indicator"> Guardando...</span>
            )}
          </div>

          <div className="content-section horas-especificas">
            <div className="section-header">
              <LuCalendarDays /> {/* Icon for specific days */}
              <h4>Horas según el día</h4>
            </div>
            <p className="section-description">
              Añada horas para días específicos
            </p>
            <button className="add-specific-hours-button">+ Horas</button>
          </div>
        </div>
      )}

      {activeTab === "festivos" && (
        <div className="tab-content">
          <p>Gestión de días festivos (contenido no implementado).</p>
        </div>
      )}
      {activeTab === "configuracion" && (
        <div className="tab-content">
          <p>Configuración de disponibilidad (contenido no implementado).</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySettings;
