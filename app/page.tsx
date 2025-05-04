// This is the main page of the app
"use client";

import NavBarLogin from "./components/NavBarLogin";
import NavBarTask from "./components/NavBarTask";
import AuthForm from "./components/AuthForm";
import MainTasks from "./components/MainTasks";
import { useState, useEffect } from "react";
import { useUserContext } from "./context/UserContext";

export default function Home() {
  // Call the context to get the username and set it
  const { username } = useUserContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is authenticated (only once, on mount)
  // When the user logs out, the username will be set to null which will return to the login page
  useEffect(() => {
    if (username) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [username]);

  // Check that the user is logged in first before showing the main task page
  return (
    <>
      {/* Conditionally render the appropriate navigation bar and main task page */}
      {isLoggedIn ? (
        <>
          <NavBarTask />
          <MainTasks />
        </>
      ) : (
        <>
          <NavBarLogin />
          <div className="text-center">
            <h1 className="mb-2 mt-0 text-5xl font-medium leading-tight text-primary">
              BEAM Task Manager
            </h1>
            {/* Ok, having trouble getting the next page to load the way I want it to.  I want the NavBarTasks to stay since it doesn't change .. but everything keeps arguing with me.  So, AI says I need to link to to the Authform*/}
            <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />
          </div>
        </>
      )}
    </>
  );
}

// Ok, so what should a simple task manager program have?
// Well, according to the ticket, we need:
//  A list of all task showing Name, Description and Due Date
//  Ability to create a new task
//  Ability to edit a task already created
//  Ability to delete a task
//  Ability to sort
//  Ability to filter
//  Possibally have user authentication

// Ok, User Authentication typically needs a hashing algorithm.  Thankfully, we looked that up a little while ago for our resume project.  We should be able to implement that without issue then, especially since we have a database.
// I heard this recently that best practice is to ask for a full name and a 'what would you like to be called' so we'll try to implement that.
// Actually, I'm not....
// What I'm going to try and do instead is implement the technique I've been researching for my gitpage.
// So, we'll create a username field and a passcode field.
// We'll pre-hash the "password" and store it in a JSON file which we'll import and compare against the entered passcode.

// We can start this project with a great deal of the code we made for the issue tracker since they are very similar.

// Database tables:
// We can use a similar format as that used in the issue tracker.
// Issue: index, name, description, due date, date created, date modified, owner
// Owner: index, full name, known as, password

// Now, how to design this.
// 1. Create a home screen with a login feature.  If the user is already registered, go to main; otherwise go to register.
// 2. Create a user registration page; go to main.
// 3. Create a main window; this will show all current task.
//    3a. Give feature to create new.
//    3b. Give feature to edit ... but only your task.
//    3c. Give feature to delete your task.
//    3d. Give feature to sort by any task column.
//    3e. Give feature to filter by owner.
//    3f. Give feature to sort by date created.
// 4. Create a new task window.

// For the authentication, we are going to implement this thru the app is 3 ways.
// 1. Use Context API to bring the username into the listing of task
// 2. Use local storage for the new task creation
// 3. Use URL for the edit task
// Doing so will give us some education in now to use all three techniques.
// #1:: gives a centralized state without prop-drilling; React based; real time updates; memory safe BUT performance overhead with complexity and no persistance
// #2:: is persistent, simple and can be used cross-page BUT major security concerns, requires manual updates and limited storage size
// #3:: is transparent, bookmake friendly and no dependencites BUT major security concerns, limited length and messy
