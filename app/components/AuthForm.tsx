// So, a great deal of this was taken from copilot and Claude AI chats I've been having.  Oddly, these chats with Claude started before I even read what this project was.  I wanted to make a GitHub Page for myself to show off a little ... but I wanted it encrypted too so not just anyone would have access to everything I wanted to show.  So I was looking up how to do that since I couldn't use a database.
// After thinking about it, I checked with Claude about using JSON as my "database" and the output looked promising ... so I tried that same approach here.
// Everything was built up piece by piece.
// First we built the main page just to get the page to show up.
// Second, we got it to try and read the JSON file.  We first built it into this page just to see if it would work ... it did.  Later, we moved it into a utility feature so it could parse any JSON we wanted...which will be great for the project I was initially looking into.  This took some work to get but eventually we got it to spit out to the screen and console.
// Third, we switched it over to a form input and got some error testing to work on it... new stuff here I had to look up to understand.
// Fourth, we took care of Typescript errors ... more research there.
// Fifth, we got some form validation in and got it to spit out an error message if the inputs were wrong.
// Sixth, we created a seperate html page to hash our passcode.
// Seventh, we added in the hashing and updated everything to look at that new hash value, convert the user entry to a hash and pass/fail
// All in all, an interesting little journey that seems like it worked out well.

// We'll work on pretty formatting later on.

// For now, we'll throw in the start of the local storage since we'll want to use this later on in the next few pages.  Best to create it here.
"use client";

import React, { useEffect, useState } from "react";
import { parseJSON } from "../utility/parseJSON";
import { useUserContext } from "../context/UserContext";

interface SavedUserTypes {
  username: string;
  passcode: string;
}

interface AuthFormProps {
  onLoginSuccess: () => void; // Define the prop for login success callback
}

// Function to hash passcode using SHA-256
// This takes a single string and returns a promise that resolves to the hashed value of the passcode
// The encoder converts the string into a binary format (UTF-8); is is needed for the hashing algorithm to work properly
// Data converts the string into a binary format (Uint8Array) for the hashing algorithm
// hashBuffer uses the WebCrypto API to hash the data using SHA-256; this is a built-in function in modern browsers and Node.js; the result is an ArrayBuffer containing the hash
// This is then converted to a UTF-8 array and then to a regular JavaScript array using Array.from
// For each byte in the array, we convert it to a hexadecimal string using byte.toString(16) and pad it with 0s to ensure it's two characters long using padStart(2, "0")
// Finally, we join the array of hexadecimal strings into a single string using join("") to get the final hashed passcode which is 64 character hexadecimal string
// This is a common hashing algorithm used for password storage and verification; it is secure and widely used in web applications
const hashPasscode = async (passcode: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  // This will use the Context from the main page.
  const { setUsername } = useUserContext();
  // We need to de-link the form fields from the context so that the onChange event doesn't trigger a re-render of the entire page.  This is causing issues with the form submission and the page reloading.
  const [tempUsername, setTempUsername] = useState<string>("");
  const [tempPassword, setTempPassword] = useState<string>("");
  const [savedUsers, setSavedUsers] = useState<SavedUserTypes[]>([]);

  // This forces the JSON call to occur ONLY once; without this, it would call this on EVERY re-render which is undesirable
  // What this does is it initally sets the passcode to a default value of 1234 and then hashes it.  This is used to test the hashing function and to provide a default user for testing purposes.  This is not a good idea for production code but is useful for testing and development.
  // The useEffect hook is used to run the function when the component mounts.  This is a common pattern in React to fetch data or perform side effects when a component is first rendered.
  // It then tries to fetch the credentials from the JSON file and set the savedUsers state with the data.  If it fails, it will log an error message and use the default user instead.
  useEffect(() => {
    const setDefaultUserPasscode = async () => {
      const hashedDefault = await hashPasscode("1234");
      setSavedUsers([{ username: "test", passcode: hashedDefault }]);
    };
    setDefaultUserPasscode();

    // Try to fetch from credentials.json to compare the username and passcode against
    try {
      const fetchUserData = async () => {
        const usersData = (await parseJSON("/credentials.json")) as {
          users: SavedUserTypes[];
        };
        if (usersData && usersData.users && usersData.users.length > 0) {
          setSavedUsers(usersData.users);
        }
      };
      fetchUserData();
    } catch (err) {
      console.log("Using default credentials.", err);
    }
  }, []);

  // This function takes the username and hashed passcode and checks if they match any of the saved users in the JSON file
  // It returns true if a match is found, otherwise false.  This is used to validate the user's credentials when they log in.
  const validateCredentials = async (
    username: string,
    hashedPasscode: string
  ): Promise<boolean> => {
    return savedUsers.some(
      (u) => u.username === username && u.passcode === hashedPasscode
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    // This prevents the page from reloading or going to the action attribute thereby keeping this page visible
    e.preventDefault();

    // Hash the passcode entered by the user
    const hashedPasscode = await hashPasscode(tempPassword);
    const isValid = await validateCredentials(tempUsername, hashedPasscode);

    // This checks if the username and passcode are valid; if not, it sets an error message to be displayed to the user
    // If the credentials are valid, it sets the username in the context and local storage and calls the onLoginSuccess function to proceed with the login flow.
    if (!isValid) {
      setError("Invalid username or passcode");
      return;
    } else {
      // Store in Context (for main login flow)
      setUsername(tempUsername);

      // Also store in localStorage (for new task creation)
      localStorage.setItem("username", tempUsername);

      setError(null);
      onLoginSuccess();
    }
  };

  // OK, so, while the onChange seems a bit iffy, according to research this is actually the best practice for this since only this small form is being updated and re-rendered
  // OK, so, the required attribute is what is throwing the data entry message for the inputs if the form is submitted without any value entered
  // In this case, we want to send these to our temp variables so that we can hash them and check them against the JSON file without causing the Context to throw a hissy fit and fail to load the page properly
  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="passcode">Passcode:</label>
          <input
            id="passcode"
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AuthForm;

// We had to kick this out of the Router since it's now a component of the main page.  Apparently NextJS does NOT like that.  So, we moved it into a proper component.  I'm not sure this is the intended method for this project but it works so we'll go with it for now.
// import { useRouter } from "next/navigation";
// import { saveToLocalStorage } from "../utility/saveToLocalStorage";

// const [savedUsers, setSavedUsers] = useState<savedUserTypes[]>([]);
// const router = useRouter();

// MORE NOTES
// Centralized API: easy acess to stored data across multiple components without prop drilling; React specific; real-time updates for components that are subscribed to the context ensuring synchronization; memory safe
// there is some performance overhead for frequent re-renders if not properly managed; complex; state is lost upon page refresh unless persisted in local storage or a database; not suitable for large-scale applications with complex state management needs

// Local Storage: persistent storage; easy to use; no server-side code required; data is stored in the browser and can be accessed across sessions; simple key-value pairs; no need for a database or server-side code
// data is not automatically synchronized across tabs or windows; limited to string data; synchronous API can block the main thread; not suitable for sensitive data due to security concerns; limited storage capacity (typically around 5-10MB per domain).  Major security risk.  Manually updated and controlled.

//URL: easy to use; no server-side code required; data is stored in the URL and can be accessed across sessions; simple key-value pairs; no need for a database or server-side code; bookmark friendly; shareable links;
// major security risk; length of data is limited to about 2000 characters; must be manaully parsed and is messy

// What is Context?
// In React, Context allows us to share data (like the username) across all components in the app without passing it down through props at every level. Think of it as a "global storage" for your app.

// How do we create Context?
// Import Context Functions: We use two specific functions from React:
// createContext: Creates the "storage" for our shared data (the username).
// useContext: Lets components access this shared data easily.

// Define the Context: We create a UserContext to hold:
// The username (the data we’re sharing).
// A setUsername function to update the username.
// const UserContext = createContext<{
//   username: string;
//   setUsername: (username: string) => void;
// }>({
//   username: "", // Default value of username
//   setUsername: () => {}, // Default updater (does nothing initially)
// });
// Why do we need a setUsername function? So we can change the username whenever a user logs in or out, and other components can reflect that change.

// Create a Provider Component The Provider is a special wrapper that gives components access to the UserContext. Inside the Provider, we:
// Store the username in a useState hook.
// Share both the username and the setUsername updater function using the UserContext.Provider.
// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [username, setUsername] = useState<string>("");

//   return (
//     <UserContext.Provider value={{ username, setUsername }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
// Key Points About the Provider:
// The value prop in UserContext.Provider contains the data we want to share (username) and the function to update it (setUsername).
// The children prop is the rest of your app that will use the username.

// Create a Helper Hook for Easy Access To make it easier to use the context, we create a custom hook that simplifies accessing UserContext:
// export const useUserContext = () => useContext(UserContext);

// Pretty well so far. Let me say it back to you and let me know if I'm right or wrong. The Context acts like a global variable but keeps it wrapped up in the entire React app so it doesn't leak into the browser. The UserContext starts off by declaring the type of value (string) and providing a setter (void) while simultaneously providing it default values (presumably so it doesn't error out?) The UserProvider then gives the React app access to this UserContext (value and setter) .... by wrapping around any React page or component. I'm not sure I'm getting that last part right.

// Your Summary:
// "The Context acts like a global variable but keeps it wrapped up in the entire React app so it doesn't leak into the browser."

// Correct! Context is indeed like a global variable for React, scoped entirely within your React app. It doesn't leak into browser storage, so it’s ephemeral—it exists only while the app is running.

// "The UserContext starts off by declaring the type of value (string) and providing a setter (void) while simultaneously providing it default values (presumably so it doesn't error out?)."

// Spot on! The UserContext defines the shape of the data it stores (e.g., username as a string and setUsername as a function). Default values are provided to avoid runtime errors when no context is set initially—good catch on that detail!

// "The UserProvider then gives the React app access to this UserContext (value and setter) .... by wrapping around any React page or component."

// Partially correct. The UserProvider doesn’t just wrap around any page or component. It wraps the entire part of your app that needs access to the context (like your login form and tasks page).

// For example, if you wrap the <UserProvider> around your whole app in _app.tsx, the UserContext will be accessible to every page and component in the app.

// If you wrap only specific parts (like the login and task pages), then only those parts can use the context.

// Where You’re Almost There
// Think of the UserProvider as a "distribution center" for your UserContext. Wherever the UserProvider is placed, all components beneath it (nested or child components) can access the context—while components outside of it won’t have access.

// For instance:
// If the UserProvider wraps the whole app (at _app.tsx), it’s globally accessible.
// If it only wraps the login page, then only the login and any children components can use the username.

// Does that help refine the "last part" you were unsure about? You're picking this up really well—great work! Let’s keep building on it if you want.
