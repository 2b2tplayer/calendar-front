import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  getAvailability,
  getAvailabilitySlots,
  createBooking,
} from "../services/api"; // Correct import
import "./BookingPage.css"; // Styles for this component
import BookingConfirmationForm from "./BookingConfirmationForm"; // Import the form component

// Helper to get lowercase day name (e.g., 'monday')
const getDayName = (date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSchedule, setUserSchedule] = useState(null); // State for user's weekly schedule
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true); // Loading state for schedule
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState("select_date_time");
  const [timeZone, setTimeZone] = useState("America/Buenos_Aires"); // Get user's actual TZ later
  const [eventTypeId, setEventTypeId] = useState(null); // Need to get this!
  const [eventDetails, setEventDetails] = useState({}); // To store duration, name etc.
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state variable

  // Fetch user's weekly availability schedule (or event data if using public endpoint)
  useEffect(() => {
    // Option 1: Keep fetching base schedule (current approach)
    const loadSchedule = async () => {
      setIsLoadingSchedule(true);
      try {
        const availability = await getAvailability();
        if (availability && availability.schedule) {
          setUserSchedule(availability.schedule);
        } else {
          // Handle case where no schedule is set or fetch failed
          setUserSchedule(null);
          console.warn("User schedule not found or failed to load.");
          // Optionally set an error state specific to schedule loading
        }
      } catch (err) {
        console.error("Error loading availability schedule:", err);
        setError("No se pudo cargar la configuración de disponibilidad."); // Set general error
        setUserSchedule(null);
      } finally {
        setIsLoadingSchedule(false);
      }
    };
    loadSchedule();

    // Option 2: Use getPublicBookingData(username, slug) if params are available
    // This would set eventDetails and maybe initial slots.

    // Placeholder: Set a default eventTypeId for testing
    // Replace this with logic to get ID from URL or initial data load
    setEventTypeId("default-event-type-id");
    setEventDetails({
      // Placeholder details
      title: "Reunión (Test)",
      duration: 30,
      location: "Google Meet",
      hostName: "Alets (Test)",
    });
    // TODO: Fetch initial user timezone if different from default
  }, []); // Runs once on mount

  // Fetch available times for the selected date
  useEffect(() => {
    // Don't fetch times until schedule/event data is loaded and a date is selected
    if (!isLoadingSchedule && selectedDate && eventTypeId && timeZone) {
      // Check dependencies
      const dateString = selectedDate.toISOString().split("T")[0];

      console.log(
        `Fetching slots for event ${eventTypeId} on ${dateString} in ${timeZone}`
      );
      setAvailableTimes([]);
      setIsLoading(true);
      setError(null);

      getAvailabilitySlots({
        eventTypeId,
        date: dateString,
        timezone: timeZone,
      })
        .then((times) => {
          // Assuming API returns array of strings like ["09:00", "10:30"]
          setAvailableTimes(times || []); // Handle potential null/undefined response
        })
        .catch((err) => {
          console.error("Error fetching available slots:", err);
          setError("No se pudieron cargar los horarios disponibles.");
          setAvailableTimes([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // Rerun when selectedDate, eventTypeId, or timezone changes (and after initial load)
  }, [selectedDate, isLoadingSchedule, eventTypeId, timeZone]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
    setBookingStep("select_date_time"); // Go back to time selection if needed
  };

  // Function to handle selecting a time slot
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingStep("enter_details"); // Move to the details form step
    console.log("Selected time:", time);
  };

  // Function to go back to date/time selection from form
  const handleBackToSelect = () => {
    setSelectedTime(null);
    setBookingStep("select_date_time");
  };

  // Function to add class names to calendar tiles based on availability
  const tileClassName = ({ date, view }) => {
    // Only add classes to month view days
    if (view === "month" && userSchedule) {
      const dayName = getDayName(date);
      const scheduleForDay = userSchedule[dayName];

      // Check if the day exists in the schedule and is marked as working
      if (scheduleForDay && scheduleForDay.isWorking) {
        // TODO: Add more checks here later, e.g.,:
        // - Check if date is in the past (disable)
        // - Check against a list of specific unavailable dates (holidays, overrides)
        // - Check if the date is already fully booked
        return "available-day";
      }
    }
    // Optionally return a different class like 'unavailable-day' for non-working days
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

  if (isLoadingSchedule) {
    return (
      <div className="booking-page-container">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      {bookingStep === "select_date_time" && (
        <div className="booking-content">
          <div className="calendar-section">
            <h2>Selecciona una Fecha</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="es-ES"
              // minDate={new Date()} // Optional: prevent selecting past dates
              className="booking-calendar"
            />
          </div>
          <div className="timeslot-section">
            <h2>
              Horarios Disponibles para {selectedDate.toLocaleDateString()}
            </h2>
            {isLoading && <p>Cargando horarios...</p>}
            {error && <p className="error-message">{error}</p>}
            {!isLoading && !error && availableTimes.length > 0 && (
              <ul className="timeslot-list">
                {availableTimes.map((time) => (
                  <li key={time}>
                    <button
                      className="timeslot-button"
                      onClick={() => handleTimeSelect(time)} // Call handleTimeSelect
                    >
                      {time}
                    </button>
                  </li>
                ))}
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
          // Pass event details fetched earlier
          eventName={eventDetails.title}
          eventDuration={eventDetails.duration}
          location={eventDetails.location}
          timeZone={timeZone} // Pass the current timeZone
          onBack={handleBackToSelect}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default BookingPage;
