export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/; // Indian numbers
  return regex.test(phone);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};
