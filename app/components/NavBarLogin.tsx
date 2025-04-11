import React from "react";
import { GiUnicorn } from "react-icons/gi";
import Link from "next/link";

const NavBarLogin = () => {
  return (
    <nav className="flex space-x-6 border-b mb-5 px-5 h-14 items-center">
      <Link href="/">
        <GiUnicorn />
      </Link>
    </nav>
  );
};

export default NavBarLogin;
