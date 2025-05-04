import React, { useState } from "react";
import {
  LuArrowLeft,
  LuCalendarClock,
  LuMapPin,
  LuUser,
  LuMail,
  LuPhone,
  LuPencilLine,
} from "react-icons/lu";
import "./BookingConfirmationForm.css"; // We will create this file

const BookingConfirmationForm = ({
  selectedDate,
  selectedTime,
  eventName = "Reunión rápida", // Default or fetched from event type
  eventDuration = 45, // Default or fetched
  location = "Llamada telefónica", // Default or fetched
  timeZone = "Buenos Aires", // Default or fetched
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation (can be enhanced)
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    // Call the onSubmit prop passed from BookingPage
    // Parent (BookingPage) will handle setting isSubmitting and API call
    onSubmit(formData);
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no seleccionada";

  return (
    <div className="confirmation-form-container">
      <div className="confirmation-content">
        <div className="confirmation-sidebar">
          <button onClick={onBack} className="back-button">
            <LuArrowLeft />
          </button>
          <h4>Alets</h4> {/* Replace with actual user/company name */}
          <h2>{eventName}</h2>
          <div className="details-summary">
            <p>
              <LuCalendarClock /> {eventDuration} min
            </p>
            <p>
              <LuMapPin /> {location}
            </p>
            {selectedDate && selectedTime && (
              <p>
                <LuCalendarClock /> {selectedTime} - {formattedDate}
              </p>
            )}
            <p>
              <LuMapPin /> Zona Horaria: {timeZone}
            </p>
          </div>
        </div>
        <div className="confirmation-form-main">
          <h3>Introduce los detalles</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <div className="input-with-icon">
                <LuUser />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico *</label>
              <div className="input-with-icon">
                <LuMail />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {/* Optional: Add Guests button - Skipped for now */}
            <div className="form-group">
              <label htmlFor="phone">Número de teléfono *</label>
              <div className="input-with-icon">
                <LuPhone />
                {/* Consider using a dedicated phone input library for formatting/validation */}
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="notes">
                Cuéntenos algo que nos ayude a prepararnos para la reunión.
              </label>
              <div className="input-with-icon textarea-icon">
                <LuPencilLine />
                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <p className="terms-notice">
              Al continuar, confirme que ha leído y está de acuerdo con las
              Condiciones de uso y Aviso de privacidad.
            </p>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Programando..." : "Programar evento"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationForm;
