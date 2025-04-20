// createContext is the 'storage' for the shared data; it's like a global variable but kept locked within the React act so it doesn't leak into the browser
// useContext allows the data to be accessed
import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
// setUserName allows us to update the stored data
// First we declare the variable and their type
// Then we assign default values to them so they don't error out when no value is set initially
const UserContext = createContext<{
  username: string;
  setUsername: (username: string) => void;
}>({
  username: "", // Default value of the username
  setUsername: () => {}, // Default updater (does nothing initially)
});

// Create a provider component
// This is a special wrapper the gives the entire part of the app that needs access to the UserContext (like the login form and task page); if we wrap it around app.tsx, everything will have access to it otherwise only those wrapped will have access to it
// The username and setter are shared via the UserContext.Provider
// The children is the rest of the app

// After a chat with AI, we are going to link the username to local storage so it pulls the value consistently across all pages; this is a good idea as it allows the user to stay logged in even if they refresh the page or close the browser and come back later.  Although I don't think this is a good idea for security reasons, it is a good idea for the sake of the this project to learn this technique and have it as a template for later on.  I may add a logout button to clear the local storage and set the username to null so they have to log in again.....
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("username") || "";
  }); // Initialize username from local storage or set to empty string

  // Update local storage whenever the context is updated :: added this after a chat with AI to keep the username in sync with local storage
  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUserContext = () => useContext(UserContext);

// Context allows us to share data across all components in an app without passing it down through props at every level.  It's like a global.
