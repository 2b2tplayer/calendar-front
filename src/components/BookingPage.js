import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  getAvailabilitySlots,
  createBooking,
  getPublicBookingData,
} from "../services/api"; // Correct import
import "./BookingPage.css"; // Styles for this component
import BookingConfirmationForm from "./BookingConfirmationForm"; // Import the form component

// Helper function to format ISO date string to HH:MM
const formatTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // Adjust options as needed for locale/padding
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "Invalid Time";
  }
};

const BookingPage = () => {
  const { username, slug } = useParams(); // Get params from URL

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Combined loading state for now
  const [error, setError] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState("select_date_time");
  const [timeZone /*, setTimeZone*/] = useState("America/Buenos_Aires"); // Default, might be overridden by user profile later
  const [eventTypeId, setEventTypeId] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
  const [hostName, setHostName] = useState(""); // State for host name
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthAvailability, setMonthAvailability] = useState(new Map()); // Map date string to status
  const [isLoadingMonth, setIsLoadingMonth] = useState(false); // Separate loading for month availability

  // Fetch public event data and initial slots
  useEffect(() => {
    if (!username || !slug) return; // Don't fetch if params are missing

    const loadPublicData = async () => {
      setIsLoading(true);
      setError(null);
      setAvailableTimes([]); // Clear old times
      try {
        const result = await getPublicBookingData(username, slug);
        if (result && result.eventType) {
          setEventDetails(result.eventType);
          setEventTypeId(result.eventType.id);
          setHostName(result.hostName || username); // Use username as fallback
          // Assuming availableSlots in the response are for the current/default month initially?
          // Or perhaps just use this to load event details, and fetch slots on date change?
          // For now, let's assume it doesn't return slots we can directly use yet.
          // setAvailableTimes(result.availableSlots || []);
        } else {
          setError("No se pudo encontrar el tipo de evento.");
        }
      } catch (err) {
        console.error("Error loading public booking data:", err);
        setError(err.message || "Error al cargar datos del evento.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicData();
  }, [username, slug]); // Re-fetch if username/slug changes

  // Fetch available times when date changes (using the fetched eventTypeId)
  useEffect(() => {
    // Don't fetch if initial data isn't loaded or no date selected
    if (isLoading || !selectedDate || !eventTypeId || !timeZone) {
      setAvailableTimes([]); // Ensure times are cleared if conditions aren't met
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    console.log(
      `Fetching slots for event ${eventTypeId} on ${dateString} in ${timeZone}`
    );
    setAvailableTimes([]);
    // Keep a separate loading state for slots? For now, reuse main isLoading
    setIsLoading(true);
    setError(null);

    getAvailabilitySlots({ eventTypeId, date: dateString, timezone: timeZone })
      .then((times) => {
        setAvailableTimes(times || []);
      })
      .catch((err) => {
        console.error("Error fetching available slots:", err);
        setError("No se pudieron cargar los horarios disponibles.");
        setAvailableTimes([]);
      })
      .finally(() => {
        setIsLoading(false); // Stop loading indicator after slots fetch
      });
    // Rerun when selectedDate, eventTypeId, or timezone changes
  }, [selectedDate, eventTypeId, timeZone, isLoading]); // Added isLoading dependency

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
    setBookingStep("select_date_time"); // Go back to time selection if needed
  };

  // Function to handle selecting a time slot (now receives HH:MM string)
  const handleTimeSelect = (timeString) => {
    setSelectedTime(timeString); // Store the HH:MM string
    setBookingStep("enter_details");
    console.log("Selected time:", timeString);
  };

  // Function to go back to date/time selection from form
  const handleBackToSelect = () => {
    setSelectedTime(null);
    setBookingStep("select_date_time");
  };

  // Function to add class names to calendar tiles
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      const status = monthAvailability.get(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Disable past dates
      if (date < today) {
        return "unavailable-day past-day"; // Add specific class for past days
      }

      switch (status) {
        case "loading":
          return "loading-day"; // Style for loading state
        case "available":
          return "available-day"; // Style for available
        case "unavailable":
          return "unavailable-day"; // Style for unavailable
        default:
          // If not yet fetched or day is outside the month range we fetched
          return "unavailable-day";
      }
    }
    return null;
  };

  // Implement actual booking submission
  const handleBookingSubmit = async (formData) => {
    console.log("Attempting booking submission:", {
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      formData,
    });

    if (!selectedDate || !selectedTime || !eventTypeId) {
      setError("Faltan datos para la reserva (fecha, hora o evento).");
      return;
    }

    // Construct startTime and endTime in ISO format (assuming selectedTime is HH:MM)
    const [hour, minute] = selectedTime.split(":").map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hour, minute, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(
      startDateTime.getMinutes() + (eventDetails.duration || 30)
    ); // Use fetched duration

    const bookingData = {
      eventTypeId: eventTypeId,
      startTime: startDateTime.toISOString(), // Send ISO string
      endTime: endDateTime.toISOString(), // Send ISO string
      inviteeName: formData.name,
      inviteeEmail: formData.email,
      inviteePhone: formData.phone || null,
      notes: formData.notes || null,
      timezone: timeZone, // The timezone the user selected the slot in
      location: eventDetails.location || null, // Include location if available
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createBooking(bookingData);
      console.log("Booking created:", result);

      alert("¡Reserva realizada!");
      setBookingStep("select_date_time");
      setSelectedTime(null);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.message || "Error al crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to fetch availability for the visible month - WRAP IN useCallback
  const fetchMonthAvailability = useCallback(
    async (startDate) => {
      if (!eventTypeId || !timeZone) return;

      setIsLoadingMonth(true);
      setMonthAvailability(new Map());

      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const promises = [];
      const availabilityUpdates = new Map();

      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split("T")[0];
        availabilityUpdates.set(dateString, "loading");
      }
      setMonthAvailability(new Map(availabilityUpdates));

      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate < today) {
          availabilityUpdates.set(
            currentDate.toISOString().split("T")[0],
            "unavailable"
          );
          continue;
        }

        const dateString = currentDate.toISOString().split("T")[0];
        promises.push(
          getAvailabilitySlots({
            eventTypeId,
            date: dateString,
            timezone: timeZone,
          })
            .then((slots) => ({
              date: dateString,
              available: slots && slots.length > 0,
            }))
            .catch((err) => {
              console.warn(`Failed to get slots for ${dateString}:`, err);
              return { date: dateString, available: false };
            })
        );
      }

      const results = await Promise.allSettled(promises);

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          availabilityUpdates.set(
            result.value.date,
            result.value.available ? "available" : "unavailable"
          );
        } else if (result.status === "rejected") {
          console.error(
            "Promise rejected in fetchMonthAvailability:",
            result.reason
          );
        }
      });

      setMonthAvailability(new Map(availabilityUpdates));
      setIsLoadingMonth(false);
      // Add dependencies for useCallback
    },
    [eventTypeId, timeZone]
  );

  // Trigger month fetch when eventTypeId/timeZone changes OR selectedDate changes
  useEffect(() => {
    if (eventTypeId) {
      fetchMonthAvailability(selectedDate);
    }
  }, [eventTypeId, timeZone, fetchMonthAvailability, selectedDate]);

  // Handler for when the user changes the visible month/year
  const handleActiveStartDateChange = useCallback(
    ({ activeStartDate }) => {
      fetchMonthAvailability(activeStartDate);
    },
    [fetchMonthAvailability]
  ); // Depends on the memoized fetch function

  // Fetch available times for the *selected* date (existing useEffect)
  useEffect(() => {
    // Don't fetch if initial data isn't loaded or no date selected
    if (!selectedDate || !eventTypeId || !timeZone) {
      setAvailableTimes([]);
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    console.log(
      `Fetching slots for event ${eventTypeId} on ${dateString} in ${timeZone}`
    );
    setAvailableTimes([]);
    // Keep a separate loading state for slots? For now, reuse main isLoading
    setIsLoading(true);
    setError(null);

    getAvailabilitySlots({ eventTypeId, date: dateString, timezone: timeZone })
      .then((times) => {
        setAvailableTimes(times || []);
      })
      .catch((err) => {
        console.error("Error fetching available slots:", err);
        setError("No se pudieron cargar los horarios disponibles.");
        setAvailableTimes([]);
      })
      .finally(() => {
        setIsLoading(false); // Stop loading indicator after slots fetch
      });
    // Rerun when selectedDate, eventTypeId, or timezone changes
  }, [selectedDate, eventTypeId, timeZone, isLoading]); // Added isLoading dependency

  // Render Logic
  if (isLoading && !eventDetails.title) {
    // Show initial loading state
    return (
      <div className="booking-page-container">
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error && !eventDetails.title) {
    // Show error if initial load failed
    return <div className="booking-page-container error-message">{error}</div>;
  }

  return (
    <div className="booking-page-container">
      {bookingStep === "select_date_time" && (
        <div className="booking-content">
          <div
            className={`calendar-section ${
              isLoadingMonth ? "loading-month" : ""
            }`}
          >
            <h2>Selecciona una Fecha</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="es-ES"
              // minDate={new Date()} // Optional: prevent selecting past dates
              className="booking-calendar"
              activeStartDate={selectedDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              tileDisabled={() => isLoadingMonth}
              navigationDisabled={isLoadingMonth}
            />
          </div>
          <div className="timeslot-section">
            <h2>
              Horarios Disponibles para {eventDetails.title} el{" "}
              {selectedDate.toLocaleDateString()}
            </h2>
            {isLoading && <p>Cargando horarios...</p>}
            {error && <p className="error-message">{error}</p>}
            {!isLoading && !error && availableTimes.length > 0 && (
              <ul className="timeslot-list">
                {availableTimes.map((slot) => {
                  // Ensure slot and slot.start exist before formatting
                  const formattedStartTime = slot?.start
                    ? formatTime(slot.start)
                    : "N/A";
                  return (
                    <li key={slot?.start || Math.random()}>
                      <button
                        className="timeslot-button"
                        onClick={() => handleTimeSelect(formattedStartTime)}
                        disabled={!slot?.start}
                      >
                        {formattedStartTime}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {!isLoading && !error && availableTimes.length === 0 && (
              <p>No hay horarios disponibles para esta fecha.</p>
            )}
          </div>
        </div>
      )}

      {bookingStep === "enter_details" && (
        <BookingConfirmationForm
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          eventName={eventDetails.title}
          eventDuration={eventDetails.duration}
          location={eventDetails.location}
          timeZone={timeZone}
          hostName={hostName}
          onBack={handleBackToSelect}
          onSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default BookingPage;
