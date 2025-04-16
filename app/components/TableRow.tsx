// Breaking things down into smaller components so we don't repeat all this functionality.

// This component is a table row that displays task information and provides buttons for editing, completing, and deleting tasks. It uses Radix UI icons for the buttons.

import React from "react";
import { Pencil1Icon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";

interface TableRowProps {
  id: number;
  category: string;
  name: string;
  description: string;
  dueDate: string;
}

const TableRow: React.FC<TableRowProps> = ({
  id,
  category,
  name,
  description,
  dueDate,
}) => {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-2">{id}</td>
      <td className="px-4 py-2">{category}</td>
      <td className="px-4 py-2">{name}</td>
      <td className="px-4 py-2">{description}</td>
      <td className="px-4 py-2">{dueDate}</td>
      <td className="px-4 py-2 flex space-x-2">
        <button className="text-blue-500 hover:text-blue-700">
          <Pencil1Icon />
        </button>
        <button className="text-green-500 hover:text-green-700">
          <Cross1Icon />
        </button>
        <button className="text-red-500 hover:text-red-700">
          <TrashIcon />
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
