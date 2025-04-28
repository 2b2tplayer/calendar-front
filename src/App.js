import React, { useState, useEffect } from "react";
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
import { getCurrentUser, getToken, setToken } from "./services/api"; // Importar función API y manejo de token

const TOTAL_ONBOARDING_STEPS = 5; // Pasos reales antes de la pantalla final

function App() {
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // Nuevo estado
  const [userData, setUserData] = useState(null); // Estado para datos del usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  const [error, setError] = useState(null); // Estado para errores
  // Nuevo estado para gestionar la vista principal
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'createEventType', 'availability', etc.

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
          setCurrentView("dashboard"); // Asegurar que empieza en dashboard si está logueado
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
      setCurrentView("dashboard"); // Establecer vista a dashboard al completar
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("No se pudo completar el registro. Inténtalo de nuevo.");
      // Podríamos querer resetear el paso o mostrar un error
    }
  };

  // --- Funciones para cambiar de vista ---
  const showDashboard = () => {
    setCurrentView("dashboard");
  };

  const showCreateEventTypeForm = () => {
    setCurrentView("createEventType");
  };

  const showAvailabilitySettings = () => {
    // Nueva función
    setCurrentView("availability");
  };

  const handleEventTypeCreated = (newEvent) => {
    console.log("Nuevo tipo de evento creado:", newEvent);
    // Aquí podrías añadir lógica para refrescar la lista de eventos si es necesario
    showDashboard(); // Volver al dashboard después de crear
  };
  // ------------------------------------

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

  // Contenido Principal a Renderizar
  let mainContent = null;
  if (!isOnboardingComplete) {
    mainContent = renderOnboardingFlow();
  } else {
    switch (currentView) {
      case "createEventType":
        mainContent = (
          <EventTypeForm
            onSuccess={handleEventTypeCreated}
            onCancel={showDashboard} // Usar showDashboard para cancelar
          />
        );
        break;
      case "availability":
        mainContent = <AvailabilitySettings />;
        break;
      case "dashboard":
      default:
        mainContent = <Dashboard userData={userData} />;
        break;
    }
  }

  return (
    <div className="app">
      {/* Mostrar Sidebar solo si el onboarding está completo */}
      {isOnboardingComplete && (
        <Sidebar
          userData={userData}
          currentView={currentView} // Pasar vista actual para active state
          showDashboard={showDashboard}
          showAvailabilitySettings={showAvailabilitySettings}
          showCreateEventTypeForm={showCreateEventTypeForm}
          // Aquí podríamos pasar más funciones para otros links
        />
      )}
      <div
        className={`main-content ${
          isOnboardingComplete ? "dashboard-view" : "onboarding-view"
        }`}
      >
        {mainContent}
      </div>
    </div>
  );
}

export default App;
