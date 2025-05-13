// This is the main tasks page that displays a table of tasks. It uses the TableRow component to render each row of the table. The data is hardcoded for now, but it can be replaced with dynamic data later.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TableRow from "./TableRow";
import { useMemo } from "react";
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

interface SortConfig {
  key: keyof Task | "category.name";
  direction: "asc" | "desc";
}

interface FilterConfig {
  category: string;
  status: string;
  owner: string;
  searchTerm: string;
}
const MainTasks: React.FC = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<string>("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Filtering state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    category: "",
    status: "",
    owner: "",
    searchTerm: "",
  });

  // Unique lists for filter dropdowns
  const [categories, setCategories] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // const [sortConfig, setSortConfig] = useState<{
  //   key: keyof Task;
  //   direction: string;
  // } | null>(null);

  // const sortData = useMemo(() => {
  //   if (!sortConfig?.key) {
  //     return tasks;
  //   }
  //   const sortedData = [...tasks].sort((a, b) => {
  //     const aValue = a[sortConfig.key];
  //     const bValue = b[sortConfig.key];
  //     if (aValue < bValue) {
  //       return sortConfig.direction === "asc" ? -1 : 1;
  //     }
  //     if (aValue > bValue) {
  //       return sortConfig.direction === "asc" ? 1 : -1;
  //     }
  //     return 0;
  //   });
  //   return sortedData;
  // }, [tasks, sortConfig]);

  // // Memoize based on data and sortConfig
  // const handleSort = (key: keyof Task) => {
  //   let direction = "asc";
  //   if (sortConfig?.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  // const getSortIndicator = (key: keyof Task) => {
  //   if (sortConfig?.key !== key) {
  //     return null; // No indicator
  //   }
  //   return sortConfig.direction === "asc" ? "▲" : "▼";
  // };

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
        setTasks(data);
        // No need for additional filtering since API now handles it

        // Extract unique values for filters
        const uniqueCategories = Array.from(
          new Set(
            data.map((task: Task) => task.category?.name || "No Category")
          )
        );
        const uniqueOwners = Array.from(
          new Set(data.map((task: Task) => task.owner))
        );
        const uniqueStatuses = Array.from(
          new Set(data.map((task: Task) => task.status))
        );

        setCategories(uniqueCategories as string[]);
        setOwners(uniqueOwners as string[]);
        setStatuses(uniqueStatuses as string[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, []);

  // Sort and filter data
  const filteredAndSortedData = useMemo(() => {
    // First, filter the data
    let filteredData = [...tasks];

    if (filterConfig.category) {
      filteredData = filteredData.filter(
        (task) =>
          (task.category?.name || "No Category") === filterConfig.category
      );
    }

    if (filterConfig.status) {
      filteredData = filteredData.filter(
        (task) => task.status === filterConfig.status
      );
    }

    if (filterConfig.owner) {
      filteredData = filteredData.filter(
        (task) => task.owner === filterConfig.owner
      );
    }

    if (filterConfig.searchTerm) {
      const searchLower = filterConfig.searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // Then, sort the filtered data
    if (sortConfig) {
      filteredData.sort((a, b) => {
        // Handle special case for category.name
        if (sortConfig.key === "category.name") {
          const aValue = a.category?.name || "No Category";
          const bValue = b.category?.name || "No Category";

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }

        // Handle all other fields
        const aValue = a[sortConfig.key as keyof Task] as string;
        const bValue = b[sortConfig.key as keyof Task] as string;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [tasks, sortConfig, filterConfig]);

  // Handle sorting
  const handleSort = (key: keyof Task | "category.name") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Display sort indicator (arrow)
  const getSortIndicator = (key: keyof Task | "category.name") => {
    if (sortConfig?.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof FilterConfig,
    value: string
  ) => {
    setFilterConfig((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterConfig({
      category: "",
      status: "",
      owner: "",
      searchTerm: "",
    });
  };

  const handleEdit = (id: number, owner: string) => {
    router.push(`/edittask?id=${id}&username=${owner}`); // Dynamic navigation to NewTask
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
      {/* Filtering section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Filter Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search name or description"
              className="w-full p-2 border rounded-md"
              value={filterConfig.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterConfig.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterConfig.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Owner filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterConfig.owner}
              onChange={(e) => handleFilterChange("owner", e.target.value)}
            >
              <option value="">All Owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset filters button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredAndSortedData.length} of {tasks.length} tasks
      </div>

      {/* Tasks table */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("id")}
            >
              ID {getSortIndicator("id")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("owner")}
            >
              Owner {getSortIndicator("owner")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("category")}
            >
              Category {getSortIndicator("category.name")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name {getSortIndicator("name")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("description")}
            >
              Description {getSortIndicator("description")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status {getSortIndicator("status")}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("duedate")}
            >
              Due Date {getSortIndicator("duedate")}
            </th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* {tasks.map((task) => ( */}
          {filteredAndSortedData.length > 0 ? (
            filteredAndSortedData.map((task) => (
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
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="border px-4 py-8 text-center text-gray-500"
              >
                No tasks found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MainTasks;
