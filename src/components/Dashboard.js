import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  LuUser,
  LuCalendarDays,
  LuClock,
  LuCheckCircle,
  LuXCircle,
  LuBarChart2,
  LuPieChart,
  LuAlertCircle,
  LuTrendingUp,
  LuTrendingDown,
  LuUserPlus,
} from "react-icons/lu";
import { SiGooglemeet, SiZoom, SiDiscord } from "react-icons/si";
import "./Dashboard.css";
import { getEventTypes, getBookings } from "../services/api";

// Helper function to get month name
const getMonthName = (monthIndex) => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[monthIndex];
};

const Dashboard = ({ userData }) => {
  // Usar datos del usuario o valores por defecto
  const userName = userData?.name || "Usuario";
  // Usar profilePicture o un placeholder
  const userAvatar =
    userData?.profilePicture || "https://via.placeholder.com/40";

  // Estados para datos del dashboard
  const [eventTypes, setEventTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [calendarDate, setCalendarDate] = useState(new Date()); // Comentado

  // useEffect para cargar datos del dashboard al montar
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Cargar datos en paralelo
        const [types, upcomingBookings] = await Promise.all([
          getEventTypes(),
          // Ejemplo: obtener las próximas 5 reservas confirmadas
          getBookings({ status: "confirmed", limit: 5, sort: "startTime:asc" }),
        ]);
        setEventTypes(types || []);
        setBookings(upcomingBookings || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar si userData está disponible (asegura que estamos autenticados)
    if (userData) {
      loadDashboardData();
    }
  }, [userData]); // Dependencia userData para recargar si cambia el usuario

  // --- Procesamiento de datos para UI ---

  // Días con reservas para marcar en el calendario
  /* Comentado - Depende de Calendar
  const bookingDates = useMemo(() => {
    const dates = new Set();
    bookings.forEach(booking => {
        const date = new Date(booking.startTime);
        date.setHours(0, 0, 0, 0);
        dates.add(date.getTime());
    });
    return dates;
  }, [bookings]);
  */

  // Función para añadir marcador a los días con reservas
  /* Comentado - Depende de Calendar
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      date.setHours(0, 0, 0, 0);
      if (bookingDates.has(date.getTime())) {
        return <span className="calendar-dot"></span>;
      }
    }
    return null;
  };
  */

  // Datos para gráfico "Total de reuniones agendadas"
  /* Comentado - Recharts 
  const totalMeetingsData = [
    { name: "Agendadas", value: bookings.length },
    { name: "Restante", value: Math.max(0, 20 - bookings.length) },
  ];
  */

  // Datos para gráfico "Tiempo total en reuniones"
  const totalTime = useMemo(() => {
    return bookings.reduce((sum, booking) => {
      let duration = 0;
      if (booking.endTime && booking.startTime) {
        duration =
          (new Date(booking.endTime).getTime() -
            new Date(booking.startTime).getTime()) /
          (1000 * 60);
      } else {
        // Buscar duración en el tipo de evento si no está en la reserva
        const eventType = eventTypes.find(
          (et) => et.id === booking.eventTypeId
        );
        duration = eventType?.duration || 0;
      }
      return sum + duration;
    }, 0);
  }, [bookings, eventTypes]);
  /* Comentado - Recharts 
  const totalTimeData = [
    { name: "Tiempo", value: totalTime },
    { name: "Restante", value: Math.max(0, 2000 - totalTime) },
  ];
  */

  // Datos para gráfico "Tasa de cancelaciones / Reprogramaciones"
  /* Comentado - Recharts 
  const cancellationData = [
    { name: "Realizadas", value: 70 },
    { name: "Reprogramadas", value: 20 },
    { name: "Canceladas", value: 10 },
  ];
  const totalCancellationPercentage = 30;
  */

  // --- Renderizado ---

  if (loading)
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h2>Hola {userName},</h2>
            <h1>Bienvenido a Calendar</h1>
          </div>
          <img
            src={userAvatar}
            alt="User Avatar"
            className="user-avatar-dashboard"
          />
        </header>
        <div>Cargando datos del dashboard...</div>
      </div>
    );
  if (error)
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h2>Hola {userName},</h2>
            <h1>Bienvenido a Calendar</h1>
          </div>
          <img
            src={userAvatar}
            alt="User Avatar"
            className="user-avatar-dashboard"
          />
        </header>
        <div style={{ color: "red" }}>Error al cargar dashboard: {error}</div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Hola {userName},</h2>
          <h1>Bienvenido a Calendar</h1>
        </div>
        <img
          src={userAvatar}
          alt="User Avatar"
          className="user-avatar-dashboard"
        />
      </header>

      <div className="dashboard-grid">
        {/* Fila 1: Calendario y Heatmap */}
        {/* --- Tarjeta Calendario Comentada --- */}
        {/* 
        <div className="dashboard-card calendar-card">
          <div className="card-header">
            <h4>Calendario <LuInfo /></h4>
            <div className="dropdown-placeholder">Calendario <LuChevronDown /></div>
          </div>
          <Calendar
            onChange={setCalendarDate}
            value={calendarDate}
            tileContent={tileContent}
          />
          <div className="calendar-legend">
            <span className="legend-item"><span className="dot personal"></span>Reunion Personal</span>
            <span className="legend-item"><span className="dot business"></span>Reunion de Negocio</span>
          </div>
        </div>
        */}
        {/* Añadir un div vacío o algún placeholder simple para mantener el grid */}
        <div className="dashboard-card placeholder-card">
          <h4>Calendario</h4>
          <div className="placeholder-content">
            [Calendario Desactivado Temporalmente]
          </div>
        </div>

        {/* --- Tarjeta Heatmap (sin cambios) --- */}
        <div className="dashboard-card heatmap-card">
          <div className="card-header">
            <h4>Heatmap</h4>
            <div className="heatmap-legend">
              <span>0</span>
              <div className="scale"></div>
              <span>100</span>
            </div>
          </div>
          <div className="heatmap-placeholder">
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
              <div key={day} className="heatmap-row">
                <span className="day-label">{day}</span>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: `rgba(106, 103, 243, ${
                        Math.random() * 0.7 + 0.1
                      })`,
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Fila 2: Gráficos Circulares Comentados */}
        <div className="dashboard-card stats-card">
          <h4>Total de reuniones agendadas</h4>
          {/* Gráfico comentado */}
          <div className="placeholder-content">
            [Gráfico Desactivado Temporalmente - {bookings.length} reuniones]
          </div>
        </div>

        <div className="dashboard-card stats-card">
          <h4>Tiempo total en reuniones</h4>
          {/* Gráfico comentado */}
          <div className="placeholder-content">
            [Gráfico Desactivado Temporalmente - {totalTime} minutos]
          </div>
        </div>

        {/* Fila 3: Herramientas y Tasa Cancelaciones */}
        <div className="dashboard-card tools-card">
          <h4>Herramientas conectadas</h4>
          <div className="tools-grid">
            {/* Iconos estáticos como ejemplo */}
            <div className="tool-item">
              <SiGooglemeet className="tool-icon google" />
              <span className="tool-status connected">Conectado</span>
            </div>
            <div className="tool-item">
              <SiZoom className="tool-icon zoom" />
              <span className="tool-status connected">Conectado</span>
            </div>
            <div className="tool-item">
              <SiDiscord className="tool-icon discord" />
              <span className="tool-status connected">Conectado</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card stats-card cancellation-card">
          <h4>Tasa de cancelaciones / Reprogramaciones</h4>
          {/* Gráfico y leyenda comentados */}
          <div className="placeholder-content">
            [Gráfico Desactivado Temporalmente]
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
