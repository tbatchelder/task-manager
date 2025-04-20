// This is the main tasks page that displays a table of tasks. It uses the TableRow component to render each row of the table. The data is hardcoded for now, but it can be replaced with dynamic data later.

"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
import TableRow from "./TableRow";

interface Task {
  id: number;
  category: string;
  name: string;
  description: string;
  dueDate: string;
  status: string;
  owner: string;
}

const MainTasks: React.FC = () => {
  // const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInOwner, setLoggedInOwner] = useState<string>("");

  // Fetch Owner from local storage
  useEffect(() => {
    const owner = localStorage.getItem("Owner"); // Assuming "Owner" is the key
    if (owner) {
      setLoggedInOwner(owner);
    } else {
      console.error("No Owner found in local storage.");
    }
  }, []);

  // Fetch data from the database on component mount
  // Again, this ensure that it only occurs once and not on every re-render
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks"); // Replace with your actual API endpoint
        const data = await response.json();
        const filteredData = data.filter(
          (task: Task) => task.status !== "DELETED"
        );
        setTasks(filteredData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const handleEdit = (id: number, owner: string) => {
    // router.push(`/edit-task?id=${id}&owner=${owner}`);
    console.log("hi");
  };

  // Function to handle Close action
  const handleClose = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
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
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "DELETED" }),
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
              category={task.category}
              name={task.name}
              description={task.description}
              dueDate={task.dueDate}
              status={task.status}
              owner={task.owner}
              loggedInOwner={loggedInOwner}
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
