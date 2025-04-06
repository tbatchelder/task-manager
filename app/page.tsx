import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <>
      <div className="text-center">
        <h1 className="mb-2 mt-0 text-5xl font-medium leading-tight text-primary">
          BEAM's Task Manager
        </h1>
        <div>Hi Baby and Emblem!</div>
        <AuthForm />
      </div>
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
//  Possible have user authentication

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
