import axios from "axios";

// --- Configuración Base ---
const API_BASE_URL = "https://alets.com.ar/api2"; // Revertir a la versión anterior

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Manejo del Token JWT ---

const TOKEN_KEY = "authToken";

// Exportar estas funciones
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Interceptor para añadir el token a las cabeceras
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Funciones Específicas de la API ---

/**
 * Procesa la respuesta de la API, extrayendo datos o lanzando errores.
 */
const handleResponse = (response) => {
  if (response.data && response.data.success) {
    return response.data.data; // Devuelve solo la parte 'data'
  } else {
    // Lanza un error con el mensaje del backend si existe, o un mensaje genérico
    throw new Error(response.data?.error || "Ocurrió un error en la petición.");
  }
};

/**
 * Maneja errores de petición (red, servidor, etc.).
 */
const handleError = (error) => {
  console.error("API call error:", error.response || error);

  let message = "Error de conexión o del servidor."; // Mensaje por defecto

  // Intentar extraer mensaje de error específico del backend
  if (error.response && error.response.data) {
    const responseData = error.response.data;

    // CASO 1: Errores de validación en un array 'errors'
    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      // Usar el mensaje del primer error de validación
      message = responseData.errors[0].msg || message;
      // Opcional: Unir todos los mensajes
      // message = responseData.errors.map(err => err.msg).join(', ');
    }
    // CASO 2: Mensaje de error directo en 'error'
    else if (responseData.error) {
      message = responseData.error;
    }
    // CASO 3: Mensaje de error directo en 'message' (menos común pero posible)
    else if (responseData.message) {
      message = responseData.message;
    }
  }
  // Si no hay respuesta del servidor pero sí un mensaje en el error original
  else if (error.message) {
    message = error.message;
  }

  // Lanzar un nuevo error con el mensaje procesado
  throw new Error(message);
};

// -- Autenticación --

export const register = async (userData) => {
  try {
    // Enviar solo los campos esperados por el curl
    const { name, email, password } = userData;
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    const data = handleResponse(response);
    if (data.token) {
      setToken(data.token);
    }
    // Asumir que la respuesta tiene { user: ..., token: ... }
    return data.user;
  } catch (error) {
    handleError(error);
  }
};

export const login = async (credentials) => {
  try {
    // Assuming login returns user data and token
    const response = await apiClient.post("/auth/login", credentials);
    const data = handleResponse(response);
    if (data.token) {
      setToken(data.token);
    }
    return data.user;
  } catch (error) {
    handleError(error);
  }
};

export const logout = async () => {
  try {
    // Descomentar la llamada API
    await apiClient.get("/auth/logout");
    setToken(null); // Siempre quitar el token local
  } catch (error) {
    console.error("Logout API call failed (token removed anyway):", error);
    setToken(null);
    // Podríamos querer no relanzar el error aquí si el logout local es suficiente
    // handleError(error);
  }
};

export const forgotPassword = async (emailData) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", emailData);
    return handleResponse(response); // Probablemente devuelva un mensaje de éxito
  } catch (error) {
    handleError(error);
  }
};

export const syncUser = async (userData, apiKey) => {
  try {
    const response = await apiClient.post("/auth/sync-user", userData, {
      headers: { "x-api-key": apiKey },
    });
    const data = handleResponse(response); // data contiene { user, token }
    if (data.token) {
      setToken(data.token);
    }
    return data.user;
  } catch (error) {
    handleError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// -- Perfil de Usuario --
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put("/users/profile", profileData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// Add updateUserPassword if needed
export const updateUserPassword = async (passwordData) => {
  try {
    // Assuming API returns success message or similar
    const response = await apiClient.put("/users/password", passwordData);
    return handleResponse(response); // May just be { success: true, message: "..." }
  } catch (error) {
    handleError(error);
  }
};

// -- Disponibilidad --
export const getAvailability = async () => {
  try {
    const response = await apiClient.get("/availability");
    return handleResponse(response);
  } catch (error) {
    // Puede que 404 sea normal si aún no se ha creado
    if (error.response?.status === 404) {
      return null; // O un objeto vacío, según prefieras manejarlo
    }
    handleError(error);
  }
};

export const updateAvailability = async (availabilityData) => {
  try {
    const response = await apiClient.post("/availability", availabilityData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// Get available time slots for a specific event type and date
export const getAvailabilitySlots = async (params) => {
  // params = { eventTypeId: string, date=...&timezone=...
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/availability/slots?${queryString}`);
    return handleResponse(response); // Devuelve array de slots
  } catch (error) {
    handleError(error);
  }
};

// -- Tipos de Evento --
export const getEventTypes = async () => {
  try {
    const response = await apiClient.get("/event-types");
    // La respuesta aquí tiene 'count' y 'data', devolvemos solo 'data'
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// --- Placeholder functions for ID-based endpoints ---

export const getEventTypeById = async (id) => {
  try {
    const response = await apiClient.get(`/event-types/${id}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const createEventType = async (eventTypeData) => {
  try {
    const response = await apiClient.post(`/event-types`, eventTypeData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const updateEventType = async (id, eventTypeData) => {
  try {
    const response = await apiClient.put(`/event-types/${id}`, eventTypeData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const deleteEventType = async (id) => {
  try {
    // Assuming API returns { success: true, data: {} } or similar on delete
    const response = await apiClient.delete(`/event-types/${id}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getPublicEventType = async (username, slug) => {
  try {
    const response = await apiClient.get(`/event-types/${username}/${slug}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// -- Reservas (Bookings) --
export const getBookings = async (params = {}) => {
  try {
    // Construir query string a partir de los parámetros
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `/bookings${queryString ? `?${queryString}` : ""}`
    );
    // La respuesta aquí tiene 'count' y 'data', devolvemos solo 'data'
    // Asegurarse que la API realmente devuelve { success: true, count: N, data: [...] }
    if (response.data && typeof response.data.count !== "undefined") {
      return response.data.data;
    } else {
      // Si la estructura no es la esperada, manejar como error o devolver array vacío
      console.warn("Estructura inesperada en respuesta de getBookings");
      return [];
    }
  } catch (error) {
    handleError(error);
    return []; // Devolver array vacío en caso de error
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await apiClient.get(`/bookings/${id}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// --- Nuevas funciones de Bookings ---
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post("/bookings", bookingData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const updateBookingStatus = async (id, statusData) => {
  // statusData debería ser { status: "...". reason: "..." } si es cancelado
  try {
    const response = await apiClient.put(`/bookings/${id}/status`, statusData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const rescheduleBooking = async (id, rescheduleData) => {
  // rescheduleData es { startTime, endTime, token? }
  try {
    const response = await apiClient.put(
      `/bookings/${id}/reschedule`,
      rescheduleData
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const cancelBooking = async (id, cancelData) => {
  // cancelData es { reason, token? }
  try {
    const response = await apiClient.put(`/bookings/${id}/cancel`, cancelData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

// New DELETE endpoint based on latest documentation
export const deleteBooking = async (id) => {
  try {
    const response = await apiClient.delete(`/bookings/${id}`);
    return handleResponse(response); // Should return success or throw error
  } catch (error) {
    handleError(error);
  }
};

// Endpoint for public booking page data
export const getPublicBookingData = async (username, slug) => {
  try {
    const response = await apiClient.get(`/bookings/book/${username}/${slug}`);
    return handleResponse(response); // Expected { eventType: {...}, availableSlots: [...] }
  } catch (error) {
    handleError(error);
  }
};

// --- Google Calendar ---

// Initiate Google Calendar connection
export const initiateGoogleAuth = async () => {
  try {
    // This endpoint likely returns a URL to redirect the user to Google's auth screen
    const response = await apiClient.get("/auth/google/calendar");
    // The actual redirection should happen in the component based on this response
    return handleResponse(response); // Expecting { url: "..." } or similar
  } catch (error) {
    handleError(error);
  }
};

// Check Google Calendar connection status
export const getGoogleCalendarStatus = async () => {
  try {
    const response = await apiClient.get("/auth/google/calendar/status");
    return handleResponse(response); // Expecting { isConnected: true/false, email: "..." }
  } catch (error) {
    // A 404 might mean not connected, handle gracefully if needed
    if (error.response?.status === 404) {
      return { isConnected: false };
    }
    handleError(error);
    // Return a default state in case of other errors
    return { isConnected: false, error: error.message };
  }
};

// Optional: Function to disconnect Google Calendar
export const disconnectGoogleCalendar = async () => {
  try {
    const response = await apiClient.delete("/auth/google/calendar");
    return handleResponse(response); // Expecting a success message
  } catch (error) {
    handleError(error);
  }
};

// --- Salud API ---
export const checkApiHealth = async () => {
  try {
    // Use apiClient to leverage interceptors and consistent error handling
    // Assuming /health returns standard { success: true, data: {...} }
    const response = await apiClient.get("/health");
    return handleResponse(response); // Let handleResponse check success/error
  } catch (error) {
    // Let handleError manage the error consistently
    handleError(error);
    // Optional: Return a specific value indicating failure if needed upstream
    // For example: return { success: false, error: error.message };
    // But throwing is generally better for signaling failure.
  }
};

export default apiClient;
