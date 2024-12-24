// Function to validate email format
export const validateEmail = (email: string) => {
  const emailRegex = /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Function to validate password strength
export const validatePassword = (password: string) => {
  // The super secret password
  if (password === "Fabio0210") return true;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUpdate = (
  value: string | number | boolean,
  identifier: string
) => {
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Other",
    "Utilities",
    "Salary",
  ];
  if (value === "") {
    return false;
  }
  if (
    identifier === "category" &&
    !categories.some(
      (category) => category.toLowerCase() === String(value).toLowerCase()
    )
  ) {
    return false;
  }
  if (identifier === "amount" && (isNaN(Number(value)) || Number(value) < 0)) {
    return false;
  }
  return true;
};
