// The usepathname is dependent on browser APIs.  We want to access this thru the client so we need to add:
"use client";

import { usePathname, useRouter } from "next/navigation";
import { GiUnicorn } from "react-icons/gi";
import classNames from "classnames";
import Link from "next/link";
import { useUserContext } from "../context/UserContext";

const NavBarTask = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const { username, setUsername } = useUserContext(); // Context updater

  // This is used to build up our navigation bar.  We can add more links here as needed.
  // The edit task isn't here because we would need to build more logic to handle that like asking for the task ID and then passing that to the edit task page.  This is a bit more complex than just adding a link to the page so we'll leave it out for now.
  const links = [
    { label: "Dashboard", href: "/" },
    { label: "New", href: "/newtask" },
    { label: "Categories", href: "/categories" },
  ];

  // This needs to work with the Home page which also needed to be told what to do once the username was set to blank (false))
  const handleLogout = () => {
    setUsername(""); // Clear username in context
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
