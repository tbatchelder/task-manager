"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/app/validationSchema";
import { z } from "zod";
import { Select } from "@radix-ui/themes";
import SimpleMDE from "react-simplemde-editor";
import axios from "axios";
import ErrorMessage from "@/app/components/ErrorMessage";
import Spinner from "@/app/components/Spinner";
import DatePicker from "react-datepicker";
import NavBarTask from "../components/NavBarTask";
import "easymde/dist/easymde.min.css";
import "react-datepicker/dist/react-datepicker.css";

type TaskForm = z.infer<typeof createTaskSchema>; // This is used to infer the type of the schema

const NewTask = () => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(createTaskSchema),
  });

  // To hold the categories
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  // To provide an error to the user
  const [error, setError] = useState("");

  // To show a loading spinner when submitting the form
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      // Convert categoryId to a number before sending the request if needed
      const formattedData = {
        ...data,
        categoryId: Number(data.categoryId),
        // Ensure duedate is properly formatted as ISO string
        duedate:
          data.duedate instanceof Date
            ? data.duedate.toISOString()
            : data.duedate,
      };

      await axios.post("/api/tasks", formattedData); // Send the data to the API
      setIsSubmitting(false); // Stop the spinner
      router.push("/"); // Redirect to the home page
    } catch (error) {
      console.error("Axios error:", error);
      setIsSubmitting(false);
      setError("An error occurred while creating the task.");
    }
  });

  // This ensures that we pull this information only once when the component mounts
  // and not on every render. This is important for performance and to avoid unnecessary API calls.
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    const storedUserName = localStorage.getItem("username"); // Assuming "Owner" is the key
    if (storedUserName) {
      setValue("owner", storedUserName);
      // setLoggedInUser(storedUserName);
    } else {
      console.error("No username found in local storage.");
    }

    fetchCategories();
  }, [setValue]); // This is pushing the value (owner) to the form state so it can be submitted with the form)

  return (
    <>
      <NavBarTask />

      <div className="max-w-3xl mx-auto px-4">
        {error && (
          <Callout.Root color="red" className="mb-5">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <form
          className="g-white rounded-lg shadow-md p-6"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default browser submission
            return onSubmit(e); // Call your handler
          }}
          noValidate // Disable browser validation to let React Hook Form handle it
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            Create a New Task
          </h3>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <TextField.Root
              placeholder="Enter task name"
              {...register("name")}
              className="w-full"
            ></TextField.Root>
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          </div>

          {/* Gods - this was a nightmare - AI even had trouble figuring this one out.  Apparently you can't use just an input or select field inside one of the react-forms - you need a Controller around it ... now, what is a Controller? ... see below */}
          {/* This is odd though ... the react-hook-form site shows select should have been ok .... why wasn't it? */}
          {/* https://react-hook-form.com/docs/usecontroller/controller */}
          {/* Two-column layout for category and due date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Controller
                name="categoryId"
                control={control}
                defaultValue={0} // Start with undefined instead of empty string or 0
                render={({ field }) => (
                  <Select.Root
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) =>
                      field.onChange(value ? parseInt(value, 10) : "")
                    }
                  >
                    <Select.Trigger
                      color="cyan"
                      placeholder="Select a category..."
                      className="w-full"
                    >
                      {/* Placeholder is on the Trigger component */}
                    </Select.Trigger>
                    <Select.Content color="cyan" position="popper">
                      {categories.map((category) => (
                        <Select.Item
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              <ErrorMessage>{errors.categoryId?.message}</ErrorMessage>
            </div>

            {/* Date Picker - this is a controlled component, so we need to use the Controller component from react-hook-form */}
            {/* Make it full width in its cell */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Controller
                name="duedate"
                control={control}
                defaultValue={undefined} // Use undefined instead of null
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)} // Convert null to undefined if needed
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a due date"
                    className="w-full p-1 border border-gray-300 rounded"
                    minDate={new Date()} // Prevent selecting past dates
                  />
                )}
              />
              <ErrorMessage>{errors.duedate?.message}</ErrorMessage>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <SimpleMDE placeholder="Description" {...field} />
              )}
            />
            <ErrorMessage>{errors.description?.message}</ErrorMessage>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button disabled={isSubmitting} type="submit" className="px-6 py-2">
              Submit New Task {isSubmitting && <Spinner />}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewTask;

// React Hook Form is a library for managing form state and validation in React applications. It provides a simple and efficient way to handle forms, including input validation, error handling, and form submission. The library is designed to be lightweight and performant, making it a popular choice among React developers.
// It uses uncontrolled components, which means that the form inputs are not directly controlled by React state. Instead, React Hook Form manages the form state internally, allowing for better performance and less re-rendering of components. This approach is particularly useful for large forms or complex applications where performance is a concern.
// The Controller component is a key part of React Hook Form that allows you to integrate third-party controlled components (like Select, DatePicker, etc.) with the library's form state management. It acts as a bridge between the controlled component and React Hook Form, enabling you to use custom components while still benefiting from the library's features like validation and error handling.
// The Controller component takes care of registering the input with React Hook Form, managing its value, and handling changes. This allows you to use any custom or third-party component without losing the benefits of React Hook Form's validation and state management.
// .... ok AI ... in English please.  :)
// Basically, the Controller component is a way to use custom components (like Select or DatePicker) with React Hook Form. It helps manage the state and validation of those components, making it easier to work with forms in React applications. By using Controller, you can integrate third-party components seamlessly while still taking advantage of React Hook Form's features.
// React Hook Form has 2 ways to hangle form inputs - controlled and uncontrolled.  Controlled inputs are those that are directly managed by React state, while uncontrolled inputs are those that manage their own state internally.  Many libraries (Radix UI) don't expose natice onChange or value properties, so you need to use the Controller component to wrap them.
// Without the Controller, React wouldn't be able to track categoryId properly because Radix UI doesn't expose value and onChange directly.  You would not be able to change or reset these.

// AI suggested adding a debug mode to see the form state and errors - interesting idea
// Add this to see form state and errors for debugging
// const [debugMode, setDebugMode] = useState(false);

// AI gave me this to aid in debugging the request to the API - it goes in the onSubmit function
// // Add request debugging
// try {
//   const response = await axios.post("/api/tasks", formattedData);
//   console.log("API Response:", response.data);
//   router.push("/");
// } catch (axiosError) {
//   console.error("Detailed Axios error:", {
//     status: axiosError.response?.status,
//     statusText: axiosError.response?.statusText,
//     responseData: axiosError.response?.data,
//     requestData: formattedData,
//   });

//   // Show more specific error message if available
//   if (axiosError.response?.data?.message) {
//     setError(`API Error: ${axiosError.response.data.message}`);
//   } else {
//     setError(`Error: ${axiosError.message || "Unknown error"}`);
//   }
// }

// More debugging code provided by AI to help be track down why it wasn't submitting to the task API
//* Safe Debug Info */
//* // Add this to your debug information */
/* <div className="flex items-center mt-2">
  <input
    type="checkbox"
    id="debugMode"
    checked={debugMode}
    onChange={() => setDebugMode(!debugMode)}
    className="mr-2"
  />
  <label htmlFor="debugMode" className="text-sm text-gray-600">
    Debug Mode
  </label>
</div>; */
//   debugMode && (
//     <div className="bg-gray-100 p-4 rounded mt-4">
//       <h3 className="font-bold">Debug Info:</h3>
//       <div>
//         <strong>Form Values:</strong>
//         <pre className="bg-white p-2 rounded text-xs overflow-auto">
//           {JSON.stringify(
//             {
//               name: control._formValues.name || "",
//               categoryId: control._formValues.categoryId || "",
//               description: control._formValues.description || "",
//               duedate:
//                 control._formValues.duedate instanceof Date
//                   ? control._formValues.duedate.toISOString()
//                   : control._formValues.duedate || "",
//               owner: control._formValues.owner || "",
//             },
//             null,
//             2
//           )}
//         </pre>
//       </div>
//       <div className="mt-2">
//         <strong>Form Errors:</strong>
//         <pre className="bg-white p-2 rounded text-xs overflow-auto">
//           {Object.keys(errors).length > 0
//             ? JSON.stringify(
//                 Object.keys(errors).reduce((acc, key) => {
//                   acc[key] = errors[key]?.message || "Invalid";
//                   return acc;
//                 }, {}),
//                 null,
//                 2
//               )
//             : "No errors"}
//         </pre>
//       </div>
//     </div>
//   );
// }
