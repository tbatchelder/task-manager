// This is the main tasks page that displays a table of tasks. It uses the TableRow component to render each row of the table. The data is hardcoded for now, but it can be replaced with dynamic data later.

import React from "react";
import TableRow from "../components/TableRow";

const MainTasks: React.FC = () => {
  const data = [
    {
      id: 1,
      category: "Work",
      name: "Project A",
      description: "Complete the project",
      dueDate: "2025-04-20",
    },
    {
      id: 2,
      category: "Personal",
      name: "Grocery Shopping",
      description: "Buy groceries",
      dueDate: "2025-04-18",
    },
    // Add more rows as needed
  ];

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Category</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Description</th>
          <th className="px-4 py-2">Due Date</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <TableRow key={item.id} {...item} />
        ))}
      </tbody>
    </table>
  );
};

export default MainTasks;
