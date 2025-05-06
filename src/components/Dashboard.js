import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// import { SiGooglemeet, SiDiscord } from "react-icons/si"; // Removed unused imports
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  LuInfo,
  LuChevronDown,
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
  LuExternalLink, // Removed unused import
} from /* LuUser, */ "react-icons/lu";
import "./Dashboard.css";
import { getEventTypes, getBookings } from "../services/api";
import EventTypeList from "./EventTypeList";
// Import the SVG path directly
import DefaultAvatar from "../assets/default-avatar.svg";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// Key for localStorage
const LAYOUT_STORAGE_KEY = "dashboardLayouts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData } = useOutletContext();

  // Revert greeting name
  const userName = userData?.name || "Santiago";
  // Get username for URL (assuming it exists, otherwise fallback)
  const userUrlName = userData?.username || userName.toLowerCase();

  const [eventTypes, setEventTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Load initial layout from storage or use default
  const getInitialLayouts = () => {
    try {
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return savedLayouts ? JSON.parse(savedLayouts) : initialLayouts; // Use default if nothing saved
    } catch (error) {
      console.error("Error reading layouts from localStorage:", error);
      return initialLayouts; // Fallback to default on error
    }
  };

  // Adjust initial layout heights (h) for content
  const initialLayouts = {
    lg: [
      { i: "calendar", x: 0, y: 0, w: 6, h: 11 },
      { i: "heatmap", x: 6, y: 0, w: 6, h: 5 }, // Reduced height for 7x7
      { i: "eventTypesList", x: 0, y: 11, w: 12, h: 10 },
      { i: "totalMeetings", x: 0, y: 21, w: 3, h: 6 },
      { i: "totalTime", x: 3, y: 21, w: 3, h: 6 },
      // { i: "tools", x: 6, y: 7, w: 3, h: 5 }, // Removed tools card from layout
      { i: "cancellations", x: 9, y: 7, w: 3, h: 6 },
    ],
    // Define layouts for other breakpoints (md, sm, xs) if needed
  };

  const [layouts, setLayouts] = useState(getInitialLayouts());

  // Handler for layout changes (drag/resize)
  const onLayoutChange = (layout, newLayouts) => {
    // Save the changed layouts to localStorage
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
      setLayouts(newLayouts); // Update state as well
    } catch (error) {
      console.error("Error saving layouts to localStorage:", error);
      setLayouts(newLayouts); // Still update state even if saving fails
    }
  };

  // useEffect for loading data (remains largely the same)
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [types, allBookings] = await Promise.all([
          getEventTypes(),
          getBookings({ status: "confirmed" }),
        ]);
        setEventTypes(types || []);
        setBookings(allBookings || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userData) {
      loadDashboardData();
    }
  }, [userData]);

  // --- Data processing ---

  // Calculate booking dates for calendar tile marking
  const bookingDates = useMemo(() => {
    const dates = new Set();
    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      date.setHours(0, 0, 0, 0);
      dates.add(date.getTime());
    });
    return dates;
  }, [bookings]);

  // Re-enable dot markers for calendar
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      if (bookingDates.has(normalizedDate.getTime())) {
        return <span className="calendar-dot"></span>; // Return the dot span
      }
    }
    return null;
  };

  // Remove weekend styling if not needed
  const tileClassName = ({ date, view }) => {
    // if (view === 'month') {
    //   const day = date.getDay();
    //   if (day === 0 || day === 6) {
    //     return 'weekend';
    //   }
    // }
    return null; // No extra classes needed based on target image
  };

  // Calculate total meeting time
  const totalTime = useMemo(() => {
    return bookings.reduce((sum, booking) => {
      let duration = 0;
      if (booking.endTime && booking.startTime) {
        duration =
          (new Date(booking.endTime).getTime() -
            new Date(booking.startTime).getTime()) /
          (1000 * 60);
      } else {
        const eventType = eventTypes.find(
          (et) => et.id === booking.eventTypeId
        );
        duration = eventType?.duration || 0;
      }
      return sum + duration;
    }, 0);
  }, [bookings, eventTypes]);

  // Update chart labels
  const meetingsCount = bookings.length;
  const totalMeetingsData = [
    { name: "Agendadas", value: meetingsCount > 0 ? meetingsCount : 1 },
    { name: "Restante", value: meetingsCount > 0 ? 0 : 10 },
  ];
  const totalTimeData = [
    { name: "Tiempo", value: totalTime > 0 ? totalTime : 1 },
    { name: "Restante", value: totalTime > 0 ? 0 : 100 },
  ];

  // Static data for cancellation chart (as before)
  const cancellationData = [
    { name: "Realizadas", value: 70, fill: "#8884d8" },
    { name: "Reprogramadas", value: 20, fill: "#82ca9d" },
    { name: "Canceladas", value: 10, fill: "#ffc658" },
  ];

  // Function to handle navigation to the booking page
  const handleViewBookingPage = () => {
    // Use the first event type's slug as a default link
    if (eventTypes && eventTypes.length > 0 && eventTypes[0].slug) {
      const firstSlug = eventTypes[0].slug;
      navigate(`/book/${userUrlName}/${firstSlug}`);
    } else {
      // Handle case where user has no event types yet
      alert("Crea un tipo de evento primero para ver tu página de reservas.");
    }
  };

  // --- Render ---
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  // Add console log for debugging
  console.log(
    "Dashboard rendering. UserData:",
    userData,
    "DefaultAvatar import:",
    DefaultAvatar
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Hola {userName},</h2>
          <h1>Bienvenido a Calendar</h1>
        </div>
        <div className="header-actions">
          <button
            onClick={handleViewBookingPage}
            className="view-booking-button"
          >
            Ver página de reservas <LuExternalLink />
          </button>
          {/* Check if profilePicture exists AND is not the placeholder string */}
          {userData?.profilePicture &&
          userData.profilePicture !== "default.jpg" ? (
            <img
              src={userData.profilePicture}
              alt="User Avatar"
              className="user-avatar-dashboard"
            />
          ) : (
            // Use img tag with imported SVG path
            <img
              src={DefaultAvatar}
              alt="Avatar por defecto"
              className="user-avatar-dashboard"
            />
          )}
        </div>
      </header>

      {/* Use ReactGridLayout instead of CSS Grid */}
      <ResponsiveReactGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} // Example column setup
        rowHeight={30} // Base row height in pixels
        isDraggable
        isResizable
        onLayoutChange={onLayoutChange} // Handle layout updates
      >
        {/* Wrap each card in a div with a matching key */}
        <div key="calendar" className="dashboard-card calendar-card">
          <div className="card-header">
            <h4>
              Calendario <LuInfo />
            </h4>
            <div className="dropdown-placeholder">
              <LuCalendarDays /> Calendario <LuChevronDown />
            </div>
          </div>
          <Calendar
            onChange={setCalendarDate}
            value={calendarDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            locale="es-ES"
            prevLabel={<LuChevronLeft size={20} />}
            nextLabel={<LuChevronRight size={20} />}
            prev2Label={null}
            next2Label={null}
          />
          <div className="calendar-legend">
            <span className="legend-item">
              <span className="dot personal"></span>Reunion Personal
            </span>
            <span className="legend-item">
              <span className="dot business"></span>Reunion de Negocio
            </span>
          </div>
        </div>

        <div key="heatmap" className="dashboard-card heatmap-card">
          <div className="card-header">
            <h4>Heatmap</h4>
            <div className="heatmap-legend simple-legend">
              <span>0</span>
              <div className="scale"></div>
              <span>100</span>
            </div>
          </div>
          <div className="heatmap-grid">
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
              <div key={day} className="heatmap-col">
                <span className="day-label">{day}</span>
                {/* Generate 7 cells instead of 15 */}
                {[...Array(7)].map((_, i) => {
                  // Changed 15 to 7
                  // Simple past/future split for color demo (adjust threshold)
                  const isPast = i < 4; // Adjust threshold for 7 cells
                  const baseOpacity = isPast ? 0.6 : 0.3;
                  const randomIntensity = Math.random() * 0.5;
                  const finalOpacity = baseOpacity + randomIntensity;
                  const backgroundColor = `rgba(94, 126, 247, ${finalOpacity})`;

                  return (
                    <div
                      key={i}
                      className="heatmap-cell"
                      style={{ backgroundColor }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div
          key="eventTypesList"
          className="dashboard-card event-type-list-card"
        >
          <EventTypeList
            eventTypes={eventTypes}
            onEdit={(id) => console.log("Edit event type:", id)}
            onShare={(slug) => navigate(`/book/${userUrlName}/${slug}`)}
            onCreate={() => navigate("/eventos")}
            userData={userData}
          />
        </div>

        <div key="totalMeetings" className="dashboard-card stats-card">
          <h4>Total de reuniones agendadas</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalMeetingsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={55}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell
                    key={`cell-0`}
                    fill={meetingsCount > 0 ? "#6A67F3" : "#EAEAFB"}
                  />
                  <Cell key={`cell-1`} fill="#EAEAFB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-center-text">
              <span className="value">{meetingsCount}</span>
              <span className="label">Reuniones del mes</span>
            </div>
          </div>
        </div>

        <div key="totalTime" className="dashboard-card stats-card">
          <h4>Tiempo total en reuniones</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalTimeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={55}
                  fill="#82ca9d"
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell
                    key={`cell-0`}
                    fill={totalTime > 0 ? "#6A67F3" : "#EAEAFB"}
                  />
                  <Cell key={`cell-1`} fill="#EAEAFB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-center-text">
              <span className="value">{totalTime}</span>
              <span className="label">Minutos</span>
            </div>
          </div>
        </div>

        {/* Removed Tools Card
        <div key="tools" className="dashboard-card tools-card">
          <h4>Herramientas conectadas</h4>
          <div className="tools-grid-simple">
            <div className="tool-item-simple">
              <SiGooglemeet className="tool-icon google" color="#EA4335" />
              <span className="tool-status connected">Conectado</span>
            </div>
            <div className="tool-item-simple">
              <span className="tool-icon-text zoom-text">zoom</span>
              <span className="tool-status connected">Conectado</span>
            </div>
            <div className="tool-item-simple">
              <SiDiscord className="tool-icon discord" color="#5865F2" />
              <span className="tool-status connected">Conectado</span>
            </div>
            <div className="tool-item-simple">
              <span className="tool-icon-placeholder">...</span>
            </div>
          </div>
        </div>
        */}

        <div
          key="cancellations"
          className="dashboard-card stats-card cancellation-card"
        >
          <h4>Tasa de cancelaciones / Reprogramaciones</h4>
          <div className="chart-container cancellation-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancellationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={55}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {cancellationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="cancellation-legend simple-legend">
            <div>
              <span
                className="dot"
                style={{ backgroundColor: "#8884d8" }}
              ></span>{" "}
              Realizadas
            </div>
            <div>
              <span
                className="dot"
                style={{ backgroundColor: "#82ca9d" }}
              ></span>{" "}
              Reprogramadas
            </div>
            <div>
              <span
                className="dot"
                style={{ backgroundColor: "#ffc658" }}
              ></span>{" "}
              Canceladas
            </div>
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default Dashboard;
