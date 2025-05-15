"use client";

import React from "react";
import { GiUnicorn } from "react-icons/gi";
import Link from "next/link";
import { useUserContext } from "../context/UserContext"; // Import the UserContext

const NavBarLogin = () => {
  const { username } = useUserContext(); // Access context for consistency

  return (
    <nav className="flex space-x-6 border-b mb-5 px-5 h-14 items-center">
      <Link href="/" className="2x1">
        <GiUnicorn className="text-emerald-800 hover:text-emerald-600 transition-colors" />
      </Link>
      <div className="ml-auto text-emerald-500">
        {username
          ? `Logged in as: ${username}` // Just in case the context is unexpectedly populated
          : "Please log in"}
      </div>
    </nav>
  );
};

export default NavBarLogin;
