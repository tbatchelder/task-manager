// So, a great deal of this was taken from copilot and Claude AI chats I've been having.  Oddly, these chats with Claude started before I even read what this project was.  I wanted to make a GitHub Page for myself to show off a little ... but I wanted it encrypted too so not just anyone would have access to everything I wanted to show.  So I was looking up how to do that since I couldn't use a database.
// Aftere thinkning about it, I checked with Claude about using JSON as my "database" and the output looked promising ... so I tried that same approach here.
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
  // Create some states to store the username, passcode and error
  const [error, setError] = useState<string | null>(null);
  // const { username, setUsername } = useUserContext();
  const { setUsername } = useUserContext();
  // const [passcode, setPasscode] = useState<string>("");
  // We need to de-link the form fields from the context so that the onChange event doesn't trigger a re-render of the entire page.  This is causing issues with the form submission and the page reloading.
  const [tempUsername, setTempUsername] = useState<string>("");
  const [tempPassword, setTempPassword] = useState<string>("");
  const [savedUsers, setSavedUsers] = useState<SavedUserTypes[]>([]);

  // This forces the JSON call to occur ONLY once; without this, it would call this on EVERY re-render which is undesirable
  useEffect(() => {
    const setDefaultUserPasscode = async () => {
      const hashedDefault = await hashPasscode("1234");
      setSavedUsers([{ username: "test", passcode: hashedDefault }]);
    };
    setDefaultUserPasscode();

    // // Fetch data from the external JSON file
    // const fetchUserData = async () => {
    //   try {
    //     // By asserting as ...., we are explicityly asserting the type of data being returned by the JSON file
    //     const usersData = (await parseJSON("/credentials.json")) as {
    //       users: savedUserTypes[];
    //     };
    //     setSavedUsers(usersData.users);
    //   } catch (err: unknown) {
    //     if (err instanceof Error) {
    //       setError(err.message); // Set error message if it's an Error instance
    //     } else {
    //       setError("An unknown error occurred."); // Fallback for unexpected error types
    //     }
    //   }
    // };

    // fetchUserData();
    // Try to fetch from credentials.json if it exists
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
      console.log("Using default credentials");
      // Continue using default credentials
    }
  }, []);

  const validateCredentials = async (
    username: string,
    hashedPasscode: string
  ): Promise<boolean> => {
    // Replace this logic with your own credentials validation
    // const savedUsers = [
    //   { username: "test", passcode: await hashPasscode("1234") },
    // ];
    // return savedUsers.some(
    //   (u) => u.username === username && u.passcode === hashedPasscode
    // );
    return savedUsers.some(
      (u) => u.username === username && u.passcode === hashedPasscode
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    // This prevents the page from reloading or going to the action attribute thereby keeping this page visible
    e.preventDefault();

    // Hash the passcode entered by the user
    // const hashedPasscode = await hashPasscode(passcode);
    const hashedPasscode = await hashPasscode(tempPassword);
    // const user = await validateCredentials(tempUsername, hashedPasscode);
    const isValid = await validateCredentials(tempUsername, hashedPasscode);

    // This combines the form data for username and passcode into u and then searches the savedUsers array for a combination that matches both
    // const user = savedUsers.find(
    //   (u) => u.username === username && u.passcode === hashedPasscode
    // );

    // if (!user) {
    //   // Clear fields and show error message - good idea from AI chat; maybe not clear these out and allow the user to 'correct' them
    //   setError("Invalid username or passcode");
    //   return;
    // } else {
    //   // setUsername(username); // Set the username context - this now updates both local storage and the context
    //   setUsername(tempUsername);
    //   localStorage.setItem("username", tempUsername);
    //   setError(null);
    //   onLoginSuccess(); // Call the function to handle successful login
    //   // router.push("/tasks"); // Navigate to the next page
    // }
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
  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            // value={username}
            // onChange={(e) => setUsername(e.target.value)}
            // onChange={(e) => setTempUsername(e.target.value)}
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
            // value={passcode}
            // onChange={(e) => setPasscode(e.target.value)}
            // onChange={(e) => setTempPassword(e.target.value)}
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
