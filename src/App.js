import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom"; // Import router components and useNavigate
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
  const [showSkipButton, setShowSkipButton] = useState(false); // State for skip button visibility
  const [isDevSkipActive, setIsDevSkipActive] = useState(false); // State to track dev skip
  const navigate = useNavigate(); // Get the navigate function

  // Effect to handle Shift+H shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === "H") {
        setShowSkipButton(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array means this effect runs once on mount

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
          // If dev skip is active, don't reset state due to invalid dev token
          if (!isDevSkipActive) {
            // Si el token es inválido o hay error, limpiar token y empezar onboarding
            console.error("Error fetching user:", err);
            setToken(null); // Limpiar token inválido
            setIsOnboardingComplete(false);
            setError(
              "Error al verificar tu sesión. Por favor, inicia de nuevo."
            );
          } else {
            console.warn(
              "Dev skip active: Ignoring backend validation error for dev-token."
            );
            // Keep isOnboardingComplete and userData set by skipOnboarding
          }
        }
      } else {
        // No hay token, iniciar onboarding
        setIsOnboardingComplete(false);
        // Forzar vista de onboarding si no hay token
      }
      setIsLoading(false);
    };

    checkAuthAndLoadUser();
  }, [isDevSkipActive]); // Se ejecuta solo una vez al montar el componente

  const skipOnboarding = () => {
    // Simulate onboarding completion
    // In a real app, you might need to fetch default/dummy user data here
    // or ensure the dashboard can handle a null/incomplete user state.
    setToken("dev-token"); // Set a dummy token for development
    setIsOnboardingComplete(true);
    setUserData({
      name: "Dev User",
      email: "dev@example.com",
      id: "dev_user_id",
    }); // Set default user data
    setIsDevSkipActive(true); // Mark dev skip as active
  };

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
    // After creating an event, navigate back to the main dashboard
    console.log("Event type created, navigating to dashboard.");
    navigate("/"); // Navigate to the root/dashboard route
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
          {showSkipButton && !isOnboardingComplete && (
            <button
              onClick={skipOnboarding}
              style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 1000, // Ensure it's above other content
                padding: "10px 15px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Skip to Dashboard (Dev)
            </button>
          )}
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
                  {showSkipButton && !isOnboardingComplete && (
                    <button
                      onClick={skipOnboarding}
                      style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1000, // Ensure it's above other content
                        padding: "10px 15px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Skip to Dashboard (Dev)
                    </button>
                  )}
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
