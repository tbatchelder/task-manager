// The usepathname is dependent on browser APIs.  We want to access this thru the client so we need to add:
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GiUnicorn } from "react-icons/gi";
import classNames from "classnames";
import Link from "next/link";
import { fetchFromLocalStorage } from "../utility/fetchFromLocalStorage";

const NavBarTask = () => {
  const currentPath = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  // Again, this ensures that the call to local storage only occurs once and doesn't perform multiple re-renders
  useEffect(() => {
    // Fetch the username from local storage
    const savedUsername = fetchFromLocalStorage("username");
    console.log(savedUsername);
    setUsername(savedUsername);
  }, []);

  const links = [
    { label: "Dashboard", href: "/tasks" },
    { label: "New", href: "/newtask" },
    { label: "Edit", href: "#" },
  ];

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
      </ul>

      {/* Right side of the NavBar - NOTE: we need to use ` ... not ' for this to work.*/}
      <div className="text-emerald-500">
        {username ? `Logged in as: ${username}` : "User Not Logged In"}
      </div>
    </nav>
  );
};

export default NavBarTask;
