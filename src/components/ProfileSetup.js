import React, { useState, useEffect } from "react";
import "./OnboardingSteps.css";
import { updateUserProfile } from "../services/api"; // Importar función API

const ProfileSetup = ({
  nextStep,
  prevStep,
  currentStep,
  totalSteps,
  userData,
}) => {
  // Estado para los campos del perfil
  const [name, setName] = useState(userData?.name || "");
  const [timezone, setTimezone] = useState(userData?.timezone || ""); // Usar timezone del usuario si existe
  // const [profilePicture, setProfilePicture] = useState(null); // Para manejar subida de archivos

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar estado si userData cambia (aunque no debería pasar en este flujo)
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setTimezone(userData.timezone || "");
    }
  }, [userData]);

  const handleFinish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const profileData = {};
    if (name !== userData?.name) profileData.name = name;
    if (timezone !== userData?.timezone) profileData.timezone = timezone;
    // Aquí manejarías la subida de la imagen si la implementas
    // y añadirías la URL devuelta a profileData

    try {
      // Solo llamar a la API si hay cambios
      if (Object.keys(profileData).length > 0) {
        await updateUserProfile(profileData);
      }
      nextStep(); // Ir al paso final
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error al actualizar el perfil. Inténtalo de nuevo.");
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
        <h3>Prepara tu perfil</h3>
        <p>
          Agregue una breve descripcion sobre usted y una foto que lo ayuden a
          obtener reservas y a que sepan con quien estan reservando
        </p>

        <form onSubmit={handleFinish} style={{ textAlign: "left" }}>
          {/* --- UI Real para Editar Perfil --- */}
          <div className="form-group">
            <label htmlFor="profileName">Nombre</label>
            <input
              type="text"
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                borderBottom: "1px solid #e0e0e0",
                padding: "10px 0",
                width: "100%",
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileTimezone">Zona Horaria</label>
            {/* Idealmente, este sería un select poblado */}
            <input
              type="text"
              id="profileTimezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Ej: America/Mexico_City"
              style={{
                borderBottom: "1px solid #e0e0e0",
                padding: "10px 0",
                width: "100%",
              }}
            />
          </div>

          {/* Placeholder para subida de foto y descripción */}
          <div className="form-group">
            <label>Foto de Perfil</label>
            <div
              className="placeholder-content"
              style={{ height: "80px", marginBottom: "10px" }}
            >
              [Subir Foto]
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <div className="placeholder-content" style={{ height: "80px" }}>
              [Campo Descripción]
            </div>
          </div>
          {/* --- Fin UI Real --- */}

          {error && (
            <p
              style={{
                color: "red",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            style={{ width: "100%" }} /* Asegurar ancho completo */
          >
            {isSubmitting ? "Guardando..." : "Terminar"}
          </button>
        </form>
        <div className="optional-links">
          <button type="button" onClick={prevStep} className="link-button">
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
