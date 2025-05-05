import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"; // Import router components
import "./App.css";
import Sidebar from "./components/Sidebar";
import RegisterForm from "./components/RegisterForm";
// Importar los demás componentes
import ConnectCalendar from "./components/ConnectCalendar";
import ConnectApps from "./components/ConnectApps";
import SetAvailability from "./components/SetAvailability";
import ProfileSetup from "./components/ProfileSetup";
import OnboardingComplete from "./components/OnboardingComplete";
import Dashboard from "./components/Dashboard"; // Importar Dashboard
import EventTypeForm from "./components/EventTypeForm"; // Importar nuevo formulario
import AvailabilitySettings from "./components/AvailabilitySettings"; // Importar nuevo componente
import BookingPage from "./components/BookingPage"; // Import BookingPage
import { getCurrentUser, getToken, setToken } from "./services/api"; // Importar función API y manejo de token

const TOTAL_ONBOARDING_STEPS = 5; // Pasos reales antes de la pantalla final

function App() {
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // Nuevo estado
  const [userData, setUserData] = useState(null); // Estado para datos del usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  const [error, setError] = useState(null); // Estado para errores

  // Efecto para verificar token y cargar datos del usuario al inicio
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          // Asumimos que si hay token, el onboarding está completo
          const user = await getCurrentUser();
          setUserData(user);
          setIsOnboardingComplete(true);
        } catch (err) {
          // Si el token es inválido o hay error, limpiar token y empezar onboarding
          console.error("Error fetching user:", err);
          setToken(null); // Limpiar token inválido
          setIsOnboardingComplete(false);
          setError("Error al verificar tu sesión. Por favor, inicia de nuevo.");
        }
      } else {
        // No hay token, iniciar onboarding
        setIsOnboardingComplete(false);
        // Forzar vista de onboarding si no hay token
      }
      setIsLoading(false);
    };

    checkAuthAndLoadUser();
  }, []); // Se ejecuta solo una vez al montar el componente

  const nextStep = () => {
    if (currentOnboardingStep < TOTAL_ONBOARDING_STEPS) {
      setCurrentOnboardingStep(currentOnboardingStep + 1);
    } else {
      // Si estamos en el último paso (ProfileSetup), el siguiente es la pantalla final
      setCurrentOnboardingStep(TOTAL_ONBOARDING_STEPS + 1);
    }
  };

  const prevStep = () => {
    if (currentOnboardingStep > 1) {
      setCurrentOnboardingStep(currentOnboardingStep - 1);
    }
  };

  // Función para marcar el onboarding como completado
  const completeOnboarding = async () => {
    try {
      // Volver a cargar los datos del usuario por si se actualizaron en el último paso
      const user = await getCurrentUser();
      setUserData(user);
      setIsOnboardingComplete(true);
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("No se pudo completar el registro. Inténtalo de nuevo.");
      // Podríamos querer resetear el paso o mostrar un error
    }
  };

  const handleEventTypeCreated = (/*newEvent*/) => {
    // After creating an event, likely navigate back to the main dashboard or event list
    // This might need useNavigate hook if called from deeply nested component,
    // but for now, maybe just log or assume navigation happens elsewhere.
    console.log("Event type created, routing should handle view change.");
  };

  const renderOnboardingFlow = () => {
    switch (currentOnboardingStep) {
      case 1:
        return (
          <RegisterForm
            nextStep={nextStep}
            currentStep={currentOnboardingStep}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1} // Incluir pantalla final en el total para el indicador
          />
        );
      case 2:
        return (
          <ConnectCalendar
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentOnboardingStep}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1}
          />
        );
      case 3:
        return (
          <ConnectApps
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentOnboardingStep}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1}
          />
        );
      case 4:
        return (
          <SetAvailability
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentOnboardingStep}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1}
          />
        );
      case 5:
        return (
          <ProfileSetup
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentOnboardingStep}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1}
            userData={userData}
          />
        );
      case 6: // Pantalla final del onboarding
        return <OnboardingComplete onComplete={completeOnboarding} />; // Pasar la función para completar
      default:
        return (
          <RegisterForm
            nextStep={nextStep}
            currentStep={1}
            totalSteps={TOTAL_ONBOARDING_STEPS + 1}
          />
        );
    }
  };

  // --- Renderizado Principal ---
  if (isLoading) {
    return <div>Cargando...</div>; // O un componente Spinner
  }

  if (error && !isOnboardingComplete) {
    // Mostrar error solo si falló la carga inicial y no estamos en onboarding
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  // Main layout component for logged-in users
  const MainLayout = () => {
    return (
      <>
        {/* Sidebar remains, but will use Link components internally */}
        <Sidebar userData={userData} />
        <div className={`main-content dashboard-view`}>
          {/* Outlet renders the matched nested route component */}
          <Outlet context={{ userData }} />{" "}
          {/* Pass userData via context if needed by nested routes */}
        </div>
      </>
    );
  };

  return (
    <BrowserRouter>
      <div className="app">
        {" "}
        {/* Changed class to app */}
        <Routes>
          {/* Public booking page route */}
          <Route path="/book/:username/:slug" element={<BookingPage />} />

          {/* Main route: renders onboarding or the MainLayout */}
          <Route
            path="/*"
            element={
              !isOnboardingComplete ? (
                // Onboarding Flow
                <div className="main-content onboarding-view">
                  {error && !isLoading && (
                    <div style={{ padding: "20px", color: "red" }}>
                      Error: {error}
                    </div>
                  )}
                  {!error && renderOnboardingFlow()}
                </div>
              ) : (
                // Logged-in Flow - Render MainLayout which contains nested routes
                <Routes>
                  {" "}
                  {/* Nested Routes for MainLayout */}
                  <Route path="/*" element={<MainLayout />}>
                    {/* Default route (e.g., /) shows Dashboard */}
                    <Route index element={<Dashboard />} />
                    {/* Route for creating/viewing event types */}
                    <Route
                      path="eventos"
                      element={
                        <EventTypeForm
                          onSuccess={handleEventTypeCreated}
                          onCancel={() => {
                            /* Use navigate(-1) or similar */
                          }}
                        />
                      }
                    />
                    {/* Route for availability settings */}
                    <Route
                      path="disponibilidad"
                      element={<AvailabilitySettings />}
                    />
                    {/* Add other nested routes here if needed */}
                    {/* Optional: Catch-all for unmatched routes within main layout? */}
                    <Route
                      path="*"
                      element={<div>404 - Page Not Found inside App</div>}
                    />
                  </Route>
                </Routes>
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
