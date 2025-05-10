"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/app/validationSchema";
import { z } from "zod";

import { Select } from "@radix-ui/themes";
// import { ChevronDownIcon } from "@radix-ui/react-icons";

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
  // const [selectedCategory, setSelectedCategory] = useState("");

  // To provide an error to the user
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // const [loggedInUser, setLoggedInUser] = useState<string>("");

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

      console.log("Formatted data before Axios:", formattedData);

      // Add request debugging
      try {
        const response = await axios.post("/api/tasks", formattedData);
        console.log("API Response:", response.data);
        router.push("/");
      } catch (axiosError) {
        console.error("Detailed Axios error:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestData: formattedData,
        });

        // Show more specific error message if available
        if (axiosError.response?.data?.message) {
          setError(`API Error: ${axiosError.response.data.message}`);
        } else {
          setError(`Error: ${axiosError.message || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Axios error:", error);
      setIsSubmitting(false);
      setError("An error occurred while creating the task.");
    }
  });

  // Add this to see form state and errors for debugging
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/api/categories");
        console.log("Fetched categories:", response.data);
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
  }, [setValue]);

  return (
    <>
      <NavBarTask />
      <div className="max-w-xl">
        {error && (
          <Callout.Root color="red" className="mb-5">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default browser submission
            console.log("Form submit event triggered");
            return onSubmit(e); // Call your handler
          }}
          noValidate // Disable browser validation to let React Hook Form handle it
        >
          <TextField.Root
            placeholder="Name"
            {...register("name")}
          ></TextField.Root>
          <ErrorMessage>{errors.name?.message}</ErrorMessage>

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
                <Select.Trigger color="cyan" placeholder="Select a category...">
                  {/* Placeholder is on the Trigger component */}
                </Select.Trigger>
                <Select.Content color="cyan" position="popper">
                  {categories.map((category) => (
                    <Select.Item key={category.id} value={String(category.id)}>
                      {category.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
          <ErrorMessage>{errors.categoryId?.message}</ErrorMessage>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <SimpleMDE placeholder="Description" {...field} />
            )}
          />
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
                className="w-full p-2 border rounded"
                minDate={new Date()} // Prevent selecting past dates
              />
            )}
          />

          <TextField.Root
            placeholder="Owner"
            {...register("owner")}
          ></TextField.Root>
          {/* <input type="hidden" {...register("status")} value="OPEN" /> */}
          <ErrorMessage>{errors.description?.message}</ErrorMessage>
          <div className="flex items-center mt-2">
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
          </div>
          {/* Safe Debug Info */}
          {/* // Add this to your debug information */}
          {debugMode && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <h3 className="font-bold">Debug Info:</h3>
              <div>
                <strong>Form Values:</strong>
                <pre className="bg-white p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(
                    {
                      name: control._formValues.name || "",
                      categoryId: control._formValues.categoryId || "",
                      description: control._formValues.description || "",
                      duedate:
                        control._formValues.duedate instanceof Date
                          ? control._formValues.duedate.toISOString()
                          : control._formValues.duedate || "",
                      owner: control._formValues.owner || "",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
              <div className="mt-2">
                <strong>Form Errors:</strong>
                <pre className="bg-white p-2 rounded text-xs overflow-auto">
                  {Object.keys(errors).length > 0
                    ? JSON.stringify(
                        Object.keys(errors).reduce((acc, key) => {
                          acc[key] = errors[key]?.message || "Invalid";
                          return acc;
                        }, {}),
                        null,
                        2
                      )
                    : "No errors"}
                </pre>
              </div>
            </div>
          )}
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() =>
              console.log("Button clicked, form state:", control._formValues)
            }
          >
            Submit New Task {isSubmitting && <Spinner />}
          </Button>
        </form>
      </div>
    </>
  );
};

export default NewTask;
