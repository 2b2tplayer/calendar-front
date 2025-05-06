import React, { useState } from "react";
import "./RegisterForm.css";
import { LuChevronDown } from "react-icons/lu";
import { FaReact } from "react-icons/fa"; // Icono Koafy
import { register } from "../services/api"; // Importar función register

const RegisterForm = ({ nextStep, currentStep, totalSteps }) => {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    name: "", // Permitir al usuario ingresar
    email: "", // Permitir al usuario ingresar
    password: "",
    // username: "", // La API no parece tener username en register
    timezone: "America/Argentina/Buenos_Aires", // Valor por defecto o permitir seleccionar
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Llamar a la API de registro
      // Enviar solo los campos requeridos por el curl
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // timezone: formData.timezone, // No enviar timezone
      });
      nextStep();
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Error al registrar el usuario.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <FaReact className="logo-icon-large" />
        <span className="logo-text-large">Koafy</span>
      </div>
      <div className="progress-indicator">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`step ${i + 1 === currentStep ? "active" : ""}`}
          ></div>
        ))}
      </div>
      <div className="register-form-card">
        <h3>Registro</h3>
        <p>Crea tu cuenta para empezar a usar Calendar.</p>
        <form onSubmit={handleRegister} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={formInputStyle}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={formInputStyle}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={formInputStyle}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="timezone">Zona horaria</label>
            <div className="select-wrapper">
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                required
                style={formInputStyle}
                autoComplete="off"
              >
                {/* Idealmente, obtener esta lista de algún sitio */}
                <option value="America/Argentina/Buenos_Aires">
                  America/Argentina/Buenos Aires
                </option>
                <option value="America/Mexico_City">America/Mexico_City</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
                {/* Otras opciones ... */}
              </select>
              <LuChevronDown className="select-arrow" />
            </div>
          </div>

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
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Registrando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Estilo simple para inputs, puedes moverlo a CSS
const formInputStyle = {
  borderBottom: "1px solid #e0e0e0",
  padding: "10px 0",
  width: "100%",
  fontSize: "15px",
};

export default RegisterForm;
