// Breaking things down into smaller components so we don't repeat all this functionality.

// This component is a table row that displays task information and provides buttons for editing, completing, and deleting tasks. It uses Radix UI icons for the buttons.

// And, from the looks of it, we'll have to break the task icons down into their own components as well, since they are being used in multiple places. So, we'll create a TaskIcon component that will take the owner, status and functionality as a prop and render the appropriate icons.

"use client";

import React from "react";
import TaskIcons from "./TaskIcons";

interface TableRowProps {
  id: number;
  category: string;
  name: string;
  description: string;
  dueDate: string;
  status: string;
  owner: string;
  loggedInOwner: string;
  onEdit: (id: number) => void;
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  id,
  category,
  name,
  description,
  dueDate,
  status,
  owner,
  loggedInOwner,
  onEdit,
  onClose,
  onDelete,
}) => {
  const rowClass =
    status === "CLOSED"
      ? "bg-green-100 font-bold italic"
      : status === "DELETED"
      ? "bg-red-100 line-through italic font-bold"
      : "";

  return (
    <tr className={`border-b hover:bg-gray-100 ${rowClass}`}>
      <td className="px-4 py-2">{id}</td>
      <td className="px-4 py-2">{category}</td>
      <td className="px-4 py-2">{name}</td>
      <td className="px-4 py-2">{description}</td>
      <td className="px-4 py-2">{dueDate}</td>
      <td className="px-4 py-2">{status}</td>
      <td className="px-4 py-2">{owner}</td>
      <td className="px-4 py-2">
        <TaskIcons
          rowOwner={owner}
          loggedInOwner={loggedInOwner}
          status={status}
          onEdit={() => onEdit(id)}
          onClose={() => onClose(id)}
          onDelete={() => onDelete(id)}
        />
      </td>
    </tr>
  );
};

export default TableRow;
