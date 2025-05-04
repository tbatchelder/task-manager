export const fetchFromLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Error fetching from local storage:", error);
    return null;
  }
};
