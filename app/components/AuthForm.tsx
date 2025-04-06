"use client";

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

import React, { useEffect, useState } from "react";
import { parseJSON } from "../utility/parseJSON";
import { useRouter } from "next/navigation";

interface savedUserTypes {
  username: string;
  passcode: string;
}

// Function to hash passcode using SHA-256
const hashPasscode = async (passcode: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const AuthForm = () => {
  // Create some states to store the username, passcode and error
  const [savedUsers, setSavedUsers] = useState<savedUserTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUserName] = useState<string>("");
  const [passcode, setPasscode] = useState<string>("");

  const router = useRouter();

  // This forces the JSON call to occur ONLY once; without this, it would call this on EVERY re-render which is undesirable
  useEffect(() => {
    // Fetch data from the external JSON file
    const fetchUserData = async () => {
      try {
        // By asserting as ...., we are explicityly asserting the type of data being returned by the JSON file
        const usersData = (await parseJSON("/credentials.json")) as {
          users: savedUserTypes[];
        };
        setSavedUsers(usersData.users);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message); // Set error message if it's an Error instance
        } else {
          setError("An unknown error occurred."); // Fallback for unexpected error types
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    // This prevents the page from reloading or going to the action attribute thereby keeping this page visible
    e.preventDefault();

    // Hash the passcode entered by the user
    const hashedPasscode = await hashPasscode(passcode);

    // This combines the form data for username and passcode into u and then searches the savedUsers array for a combination that matches both
    const user = savedUsers.find(
      (u) => u.username === username && u.passcode === hashedPasscode
    );
    if (!user) {
      // Clear fields and show error message
      setUserName("");
      setPasscode("");
      setError("Invalid username or passcode");
      return;
    } else {
      console.log("Login successful:", user);
      setError(null);
      router.push("/tasks"); // Navigate to the next page
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
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="passcode">Passcode:</label>
          <input
            id="passcode"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
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
