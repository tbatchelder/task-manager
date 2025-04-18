// Ok, this will bring the icons into their own component.  We can then use this component in the table and in the task creation window.  This will allow us to reuse the code and make it easier to maintain.  We'll also be able to add the functionality to the icons in one place and have it work everywhere.

"use client";

import React from "react";
import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";

interface IconsProps {
  rowOwner: string;
  loggedInOwner: string;
  status: string;
  onEdit: () => void; // Placeholder for edit functionality
  onClose: () => void; // Placeholder for close functionality
  onDelete: () => void; // Placeholder for delete functionality
}

const TaskIcons: React.FC<IconsProps> = ({
  rowOwner,
  loggedInOwner,
  status,
  onEdit,
  onClose,
  onDelete,
}) => {
  const isDisabled = rowOwner !== loggedInOwner || status === "CLOSED";

  return (
    <div className="flex space-x-2">
      <button
        className={`${
          isDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-500"
        }`}
        disabled={isDisabled}
        onClick={onEdit}
      >
        <FaEdit />
      </button>
      <button
        className={`${
          isDisabled ? "text-gray-400 cursor-not-allowed" : "text-green-500"
        }`}
        disabled={isDisabled}
        onClick={onClose}
      >
        <FaCheck />
      </button>
      <button
        className={`${
          isDisabled ? "text-gray-400 cursor-not-allowed" : "text-red-500"
        }`}
        disabled={isDisabled}
        onClick={onDelete}
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default TaskIcons;
