// The usepathname is dependent on browser APIs.  We want to access this thru the client so we need to add:
"use client";

// import React, { useEffect, useState } from "react";
// import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GiUnicorn } from "react-icons/gi";
import classNames from "classnames";
import Link from "next/link";
// import { fetchFromLocalStorage } from "../utility/fetchFromLocalStorage";
import { useUserContext } from "../context/UserContext";

const NavBarTask = () => {
  const currentPath = usePathname();
  const router = useRouter();
  // const [usernameState, setUsernameState] = useState<string | null>(null);
  const { username, setUsername } = useUserContext(); // Context updater

  // Again, this ensures that the call to local storage only occurs once and doesn't perform multiple re-renders
  // useEffect(() => {
  //   // Fetch the username from local storage
  //   const savedUsername = fetchFromLocalStorage("username");
  //   setUsernameState(savedUsername);
  // }, []);

  const links = [
    { label: "Dashboard", href: "/" },
    { label: "New", href: "/newtask" },
  ];

  const handleLogout = () => {
    setUsername(""); // Clear username in context
    // localStorage.removeItem("username"); // Remove from local storage
    router.push("/"); // Redirect to the home page
  };

  return (
    <nav className="flex space-x-6 border-b mb-5 px-5 h-14 items-center">
      <Link href="/">
        <GiUnicorn />
      </Link>
      <ul className="flex space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            className={classNames({
              "text-emerald-900": link.href === currentPath,
              "text-emerald-500": link.href !== currentPath,
              "hover:text-emerald-800 transition-colors": true,
            })}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="text-red-500 hover:text-red-700 transition-colors ml-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </ul>

      {/* Right side of the NavBar - NOTE: we need to use ` ... not ' for this to work.*/}
      <div className="text-emerald-500">
        {username ? `Logged in as: ${username}` : "User Not Logged In"}
      </div>
    </nav>
  );
};

export default NavBarTask;
