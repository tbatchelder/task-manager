// This is the main tasks page that displays a table of tasks. It uses the TableRow component to render each row of the table. The data is hardcoded for now, but it can be replaced with dynamic data later.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TableRow from "./TableRow";
// While the whole site is using Context, we don't want to use that here since this is the part we want to use the local storage for the username.  We could use it but, as we found out, the two would be competting against easch other and cause issues.  So, we'll just use the local storage for now and then later on we can add the context back in if we want to use it for something else.
// import { useUserContext } from "../context/UserContext"; // Import the context to get the username

interface Task {
  id: number;
  category: { id: number; name: string } | null; // Ensure category is an object
  name: string;
  description: string;
  duedate: string;
  status: string;
  owner: string;
}

const MainTasks: React.FC = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<string>("");

  // Fetch Owner from local storage
  useEffect(() => {
    const storedUserName = localStorage.getItem("username"); // Assuming "Owner" is the key
    if (storedUserName) {
      setLoggedInUser(storedUserName);
    } else {
      console.error("No username found in local storage.");
    }

    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");

        const data = await response.json();
        console.log(data);
        setTasks(data);
        // No need for additional filtering since API now handles it
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, []);

  const handleEdit = (id: number, owner: string) => {
    router.push(`/edittasks?id=${id}&username=${owner}`); // Dynamic navigation to NewTask
  };

  // Function to handle Close action
  const handleClose = async (id: number) => {
    try {
      await fetch(`/api/tasks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: "CLOSED" }),
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status: "CLOSED" } : task
        )
      );
    } catch (error) {
      console.error("Error closing task:", error);
    }
  };

  // Function to handle Delete action
  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/tasks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: "DELETED" }),
      });

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Owner</th>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Due Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              id={task.id}
              category={task.category?.name || "No Category"}
              name={task.name}
              description={task.description}
              duedate={
                task.duedate
                  ? new Date(task.duedate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No Due Date"
              } // ✅ Convert date for display
              status={task.status}
              owner={task.owner}
              loggedInOwner={loggedInUser}
              onEdit={() => handleEdit(task.id, task.owner)}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainTasks;
