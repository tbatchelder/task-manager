// Breaking things down into smaller components so we don't repeat all this functionality.

// This component is a table row that displays task information and provides buttons for editing, completing, and deleting tasks. It uses Radix UI icons for the buttons.

// And, from the looks of it, we'll have to break the task icons down into their own components as well, since they are being used in multiple places. So, we'll create a TaskIcon component that will take the owner, status and functionality as a prop and render the appropriate icons.

// Ok, this is a little more complicated than I thought.  We'll need to pass the owner and status as props to the TaskIcon component so that it can determine which icons to show.  We'll also need to pass the functionality as props so that it can call the appropriate functions when the icons are clicked.
// We'll also need to pass the logged in owner so that we can determine if the user is allowed to edit or delete the task.  We'll also need to pass the status so that we can determine if the task is closed or not.  We'll also need to pass the id of the task so that we can delete it.
// We'll also need to pass the edit, close and delete functions as props so that we can call them when the icons are clicked.  We'll also need to pass the id of the task so that we can delete it.

// Ok, so at this level, we are pulling the functions from a higher level and passing them down to the TaskIcon component.  However, at this stage, we are passing in the id value for the row which will pass that back up to the higher level.
// This is known as "lifting state up" where the child component doesn't actually handle the logic itself, but rather delegates the responsibility to the parent component.  The parent, having full control over the context, handles the actual operation and passes the result back down to the child component.
// This methodology allows the parent to manage all logic and state, while the child component simply handles the display and user interaction.  

"use client";

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
      <td className="px-4 py-2">{owner}</td>
      <td className="px-4 py-2">{category}</td>
      <td className="px-4 py-2">{name}</td>
      <td className="px-4 py-2">{description}</td>
      <td className="px-4 py-2">{dueDate}</td>
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
