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

// Ok ... sorting ... filtering ... how does one do that with a multi-column table?
// In order to sort or filter by a column, to need to know the column name and direction (if any).
// An interface is a way to define the shape of an object in TypeScript. So, we can use an interface to define the shape of the sort and filter objects. This will help us to keep track of the sorting and filtering state in a more structured way.
// It has two properties: key and direction. The key property is a string that represents the name of the column to sort by, and the direction property is a string that can be either "asc" or "desc" to indicate the sorting direction.
interface SortConfig {
  key: keyof Task | "category.name";
  direction: "asc" | "desc";
}

// The same thing goes for the filter config. We can use an interface to define the shape of the filter object. This will help us to keep track of the filtering state in a more structured way.
// The FilterConfig interface has four properties: category, status, owner, and searchTerm. Each property is a string that represents the value of the filter. The category property is used to filter by category name, the status property is used to filter by task status, the owner property is used to filter by task owner, and the searchTerm property is used to filter by task name or description.
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

  // Once we have defined the shape of the sort/filtering objects, we need to apply it to a state management solution.
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  // Filtering state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    category: "",
    status: "",
    owner: "",
    searchTerm: "",
  });

  // To facilitate the filtering, we need to create unique lists of categories, owners, and statuses. This will allow us to populate the filter dropdowns with unique values.
  // Unique lists for filter dropdowns
  const [categories, setCategories] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

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
        // This is done by taking the data array, mapping to a new array containing just the indicated fields or setting it to a default value (which is unlikely to happen).
        // A Set is a JavaScript object that only stores unique values. When you create a Set from an array, it automatically removes all duplicate values. For example, if your tasks have categories like ["Work", "Personal", "Work", "Personal", "Bills"], a Set would reduce this to just ["Work", "Personal", "Bills"]. .... AI ... that's extremeley helpful to know.
        // This is then converted back to an array using Array.from() to get the unique values which then populates the filter dropdowns.
        // Sets are specifically designed to store unique values and are more efficient for this purpose than using an array with a filter method.
        // It is also more performant for larger datasets, as it avoids the need for nested loops or multiple passes through the data.
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

  //useMemo is a React hook that allows you to memoize (cache) the result of a computation so that it only recalculates when specific dependencies change. The name comes from "memoization," which is a technique to store the results of expensive function calls and return the cached result when the same inputs occur again.
  // const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  //       ^ the result                   ^ the calculation            ^ dependencies
  // Sort and filter data
  const filteredAndSortedData = useMemo(() => {
    // First, filter the data by making a copy of the tasks array so we don't mutate the original data.
    let filteredData = [...tasks];

    // These are the filter conditions. If the filterConfig has a value, then filter the data by that value.
    // (task.category?.name || "No Category") handles the case where task.category might be null
    // The ?. is the optional chaining operator - it allows you to safely access deeply nested properties without having to check if each reference in the chain is null or undefined.
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

    // Then, sort the filtered data - it only runs if the sortConfig is not null.
    if (sortConfig) {
      filteredData.sort((a, b) => {
        // Handle special case for category.name since it's a nested property
        if (sortConfig.key === "category.name") {
          // Grab a value and then the next value in the array, compare them and order they should be in.
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
        // Refer to below and: we are telling the compiler that the sortConfig.key is a valid key of the Task interface.  It allows us to use bracket notation to access the property of the object based on a variable.
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
  // The keyof operator is a TypeScript feature that creates what's called an "index type" or "key type." It produces a union type of all the property names (keys) of a given type.
  // So, if we have:
  // interface Person {
  //   name: string;
  //   age: number;
  //   email: string;
  // }
  // Then keyof Person would evaluate to the union type: "name" | "age" | "email"
  // The variable can only be one of the key types.
  // This ensures that the sorting can only be done on valid keys of the Task interface.
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
    <div className="container max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Tasks
        </h1>
        {/* Filtering section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          {/* <h2 className="text-lg font-semibold mb-3">Task Filters</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search filter */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label> */}
              <input
                type="text"
                placeholder="Search name or description"
                className="w-full p-1 border rounded-md"
                value={filterConfig.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
              />
            </div>

            {/* Category filter */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label> */}
              <select
                className="w-full p-1 border rounded-md"
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
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label> */}
              <select
                className="w-full p-1 border rounded-md"
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
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label> */}
              <select
                className="w-full p-1 border rounded-md"
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
              className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("id")}
              >
                ID {getSortIndicator("id")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("owner")}
              >
                Owner {getSortIndicator("owner")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("category")}
              >
                Category {getSortIndicator("category.name")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("name")}
              >
                Name {getSortIndicator("name")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("description")}
              >
                Description {getSortIndicator("description")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("status")}
              >
                Status {getSortIndicator("status")}
              </th>
              <th
                className="border px-4 py-2 cursor-pointer bg-sky-200 hover:text-sky-800 transition-colors"
                onClick={() => handleSort("duedate")}
              >
                Due Date {getSortIndicator("duedate")}
              </th>
              <th className="border px-4 py-2 bg-sky-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {tasks.map((task) => ( */}
            {/* Ok, so once ALL of this is set up, we need to wrap our actual table
          in a useMemo() hook. This will ensure that the table only re-renders
          when the tasks, sortConfig, or filterConfig change. This is a
          performance optimization that can help reduce unnecessary re-renders
          and improve the overall performance of the component. */}
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
    </div>
  );
};

export default MainTasks;
