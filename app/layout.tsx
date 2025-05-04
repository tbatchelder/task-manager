import "@radix-ui/themes/styles.css";
import "./theme-config.css";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { UserProvider } from "./context/UserContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BEAM Task Manager",
  description: "Project 7 - Task Manager with authentication",
};

// Here, we are wrapping the entire app in the UserProvider so that all pages have access to the context, even if every page doesn't need it.
// This is a good idea since it allows us to use the context in any page without having to wrap each page individually.
// {children} is the rest of the app which starts with app/page.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.variable}>
        <Theme>
          <UserProvider>
            <main className="p-5">{children}</main>
          </UserProvider>
        </Theme>
      </body>
    </html>
  );
}

// Ok, so I had to ask Claude about fixing this issue with authentication.  It seems that I was mixing too many parts together that I had build individually.  I was trying to use the context and local storage at the same time, which was causing issues.
// Apparently I was using a local state which also interacted with the context, which was causing issues.
//   Bascially, multiple sources of truth .... which is incredibly BAD.
// There were also duplicat useEffect calls that were fighing with each other in saving to local storage.
// AuthForm was the most messed up.  Variable names mismatches.  Undefined variables.  Hardcoding values that are supposed to be imported from JSON.  Not enough error handling. .... basically, a mess.
