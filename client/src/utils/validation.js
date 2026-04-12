// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
export const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

// Validate required fields
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Validate password (basic - at least 6 chars)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Check if email already exists in users list
export const emailExists = (email, usersList) => {
  return usersList.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.active,
  );
};

// Validate date range (check-in before check-out)
export const validateDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  return new Date(checkIn) < new Date(checkOut);
};

// Get today's date in YYYY-MM-DD format
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Calculate nights between two dates
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate unique reference number
export const generateReferenceNumber = () => {
  return `RES-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
};
