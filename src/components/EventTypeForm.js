import React, { useState } from "react";
import "./EventTypeForm.css";
import { createEventType } from "../services/api"; // Importar función API
import { LuClock, LuTriangleAlert } from "react-icons/lu"; // Corregir nombre de icono

const EventTypeForm = ({ onSuccess, onCancel }) => {
  // Props para manejar resultado/cancelación
  const [formData, setFormData] = useState({
    title: "", // Necesario para crear
    duration: 30,
    description: "", // Necesario pero no visible en la primera parte de la imagen
    location: "", // Ejemplo, podría ser un select
    maxBookingDays: 60,
    minNoticeHours: 4, // Convertiremos a minutos para la API si es necesario
    // Otros campos de la API con valores por defecto (pueden ocultarse o mostrarse)
    slug: "", // Podría generarse a partir del título
    color: "#6A67F3",
    isActive: true,
    requiresConfirmation: false,
    bufferBefore: 0,
    bufferAfter: 0,
    maxBookingsPerDay: null, // null o un número
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  // Generar slug simple (opcional)
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Reemplazar espacios con -
      .replace(/[^a-z0-9-]/g, "") // Quitar caracteres no válidos
      .replace(/-+/g, "-"); // Reemplazar múltiples - con uno solo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Preparar datos para la API
    const apiData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      minNotice: formData.minNoticeHours * 60, // Convertir horas a minutos si API espera minutos
    };
    // Quitar el campo temporal minNoticeHours
    delete apiData.minNoticeHours;

    try {
      const createdEvent = await createEventType(apiData);
      console.log("Evento creado:", createdEvent);
      if (onSuccess) onSuccess(createdEvent); // Llamar callback si se proporcionó
    } catch (err) {
      console.error("Error creando tipo de evento:", err);
      setError(err.message || "Error al crear el tipo de evento.");
      setIsSubmitting(false); // Permitir reintentar en caso de error
    }
    // No poner setIsSubmitting(false) aquí si onSuccess redirige o desmonta
  };

  return (
    <div className="event-type-form-container">
      <h2>Establecer Disponibilidad</h2> {/* Título como en la imagen */}
      <form onSubmit={handleSubmit}>
        {/* Sección Título (Necesario aunque no explícito en captura parcial) */}
        <div className="form-section">
          <label htmlFor="title">Título del Evento</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Reunión Rápida"
            required
          />
        </div>

        {/* Sección Duración */}
        <div className="form-section">
          <label htmlFor="duration">Duración</label>
          <div className="duration-input">
            <LuClock />
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="duration-select"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </select>
            <span>min</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Sección Ubicación */}
        <div className="form-section">
          <label htmlFor="location">Ubicación</label>
          {/* Input/Select para ubicación (placeholder por ahora) */}
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Google Meet, Zoom, Oficina"
          />
          <div className="advice-box">
            <LuTriangleAlert />
            <span>
              <strong>Consejo:</strong> Las reuniones que tienen lugares
              asignados suelen empezar a la hora prevista.
            </span>
          </div>
        </div>

        <hr className="divider" />

        {/* Sección Disponibilidad */}
        <div className="form-section">
          <label>Disponibilidad</label>
          <div className="sub-section">
            <label htmlFor="maxBookingDays">Intervalos de fechas</label>
            <p className="description">
              Los invitados pueden programar eventos en el futuro, en{" "}
              {formData.maxBookingDays} días, y con una antelación mínima de{" "}
              {formData.minNoticeHours} horas para notificarlos
            </p>
            {/* Inputs para maxBookingDays y minNoticeHours */}
            <div className="availability-inputs">
              <div>
                <span>Reservar con hasta</span>
                <input
                  type="number"
                  id="maxBookingDays"
                  name="maxBookingDays"
                  value={formData.maxBookingDays}
                  onChange={handleChange}
                  min="1"
                />
                <span>días de antelación.</span>
              </div>
              <div>
                <span>Requiere una antelación mínima de</span>
                <input
                  type="number"
                  id="minNoticeHours"
                  name="minNoticeHours"
                  value={formData.minNoticeHours}
                  onChange={handleChange}
                  min="0"
                />
                <span>horas.</span>
              </div>
            </div>
          </div>
          {/* Aquí podrían ir más opciones de disponibilidad como buffers, etc. */}
        </div>

        {/* Mostrar Errores */}
        {error && <p className="error-message">{error}</p>}

        {/* Botones de Acción */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventTypeForm;
