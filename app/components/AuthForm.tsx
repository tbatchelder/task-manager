"use client";

import React, { useEffect, useState } from "react";
import { parseJSON } from "../utility/parseJSON";
import { useRouter } from "next/navigation";

interface savedUserTypes {
  username: string;
  passcode: string;
}

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = savedUsers.find(
      (u) => u.username === username && u.passcode === passcode
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
      router.push("/nextPage"); // Navigate to the next page
    }
  };

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
