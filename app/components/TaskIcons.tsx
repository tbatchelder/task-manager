// Ok, this will bring the icons into their own component.  We can then use this component in the table and in the task creation window.  This will allow us to reuse the code and make it easier to maintain.  We'll also be able to add the functionality to the icons in one place and have it work everywhere.
// We check that the Owner is the one logged in and that the status is not closed.  If either of these is true, we disable the button and make it greyed out.  We also add a tooltip to the button to indicate that it is disabled.  This will make it easier for the user to understand why they can't click the button.

// So, setting up the () => void is a way to pass a function as a prop.  This is a common pattern in React and allows us to pass functions around without having to worry about the context of the function.  This is especially useful when we want to pass a function to a child component and have it call that function when something happens.  In this case, we are passing the onEdit, onClose and onDelete functions to the TaskIcons component so that it can call them when the icons are clicked.
// This keeps the function calls at a high level and allows us to pass the functions down to the child component without having to worry about the context of the function.  This is a common pattern in React and allows us to keep our code clean and easy to read.

"use client";

import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";

interface IconsProps {
  rowOwner: string;
  loggedInOwner: string;
  status: string;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
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
      {/* The $, according to AI, means it's a dynamic variable; it's not actually necessary; just a convention used to signify a dynamic variable in Java/TypeScript :: OK, always good to have a visual indicator I guess for easier code reading */}
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
