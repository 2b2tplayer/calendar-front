import React, { useState, useEffect } from "react";
import { getEventTypes } from "../services/api"; // Assuming API function exists
import {
  LuPlus,
  LuCopy,
  LuExternalLink,
  LuLock,
  LuGlobe,
  LuUser,
} from "react-icons/lu"; // Import icons
import "./EventTypeList.css"; // We'll create this CSS file

const EventTypeList = ({ onCreateClick, userData }) => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use data or placeholders
  const userName = userData?.name || "Santiago";
  // Placeholder link - replace with actual data structure if available
  const userProfileLink =
    userData?.profileUrl ||
    `https://${userName.toLowerCase()}.koafycalendar.com/`;

  useEffect(() => {
    const fetchEventTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEventTypes();
        setEventTypes(data || []); // API function returns the array directly
      } catch (err) {
        console.error("Error fetching event types:", err);
        setError("Failed to load event types.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  const handleCopyLink = (eventType) => {
    // Placeholder: Construct the public link based on username and slug
    const link = `${userProfileLink}${eventType.slug}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Enlace copiado!")) // Simple feedback
      .catch((err) => console.error("Failed to copy link:", err));
  };

  const handleShare = (eventType) => {
    // Placeholder for share functionality
    alert(`Compartir evento: ${eventType.title}`);
  };

  const renderEventTypeCard = (eventType) => {
    // Placeholder logic for public/private display
    const isPrivate = !eventType.isActive;

    return (
      <div key={eventType.id || eventType.slug} className="event-type-card">
        <div className="event-type-header">
          {/* Placeholder checkbox */}
          <input type="checkbox" className="event-type-checkbox" />
          <div className="event-type-title-section">
            <h4 className="event-type-title">{eventType.title}</h4>
            <div className="event-type-details">
              {isPrivate ? <LuLock size={14} /> : <LuGlobe size={14} />}
              <span>{eventType.duration} min</span>,
              <span>{isPrivate ? "En privado" : "Público"}</span>
            </div>
            {/* Changed link to button for accessibility */}
            <button
              className="link-button event-type-booking-link"
              onClick={() =>
                alert("Navigate to booking page for " + eventType.slug)
              }
            >
              Ver la pagina de reservas
            </button>
          </div>
        </div>
        <div className="event-type-actions">
          <button
            onClick={() => handleCopyLink(eventType)}
            className="action-button copy-link-button"
          >
            <LuCopy size={16} /> Copiar enlace
          </button>
          <button
            onClick={() => handleShare(eventType)}
            className="action-button share-button"
          >
            Compartir
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="event-type-list-container">
      <div className="event-type-list-header">
        <div className="user-info-header">
          {/* Conditional rendering for avatar */}
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt={userName}
              className="user-avatar-small"
            />
          ) : (
            <div className="user-avatar-small placeholder-avatar">
              <LuUser /> {/* Render icon */}
            </div>
          )}
          <div>
            <span className="user-name-header">{userName}</span>
            <a
              href={userProfileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="user-profile-link"
            >
              {userProfileLink}
              <LuExternalLink size={14} />
            </a>
          </div>
        </div>
        <button
          onClick={() => {
            console.log("Create Event button clicked in EventTypeList!");
            onCreateClick();
          }}
          className="create-event-button"
        >
          <LuPlus size={18} /> Crear Evento
        </button>
      </div>

      {loading && <div>Cargando tipos de evento...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="event-types-scroll-container">
          {eventTypes.length > 0 ? (
            eventTypes.map(renderEventTypeCard)
          ) : (
            <p>No se encontraron tipos de evento. ¡Crea uno!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventTypeList;
