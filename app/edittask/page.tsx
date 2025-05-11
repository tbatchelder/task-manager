"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/app/validationSchema";
import { z } from "zod";
import { Select } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import SimpleMDE from "react-simplemde-editor";
import axios from "axios";
import ErrorMessage from "@/app/components/ErrorMessage";
import Spinner from "@/app/components/Spinner";
import DatePicker from "react-datepicker";
import NavBarTask from "../components/NavBarTask";
import "easymde/dist/easymde.min.css";
import "react-datepicker/dist/react-datepicker.css";

type TaskForm = z.infer<typeof createTaskSchema>; // This is used to infer the type of the schema

const EditTask = () => {
  const searchParams = useSearchParams(); // Get the search params from the URL
  const taskId = searchParams.get("id"); // Get the task ID from the URL
  const username = searchParams.get("username"); // ✅ Get username from URL

  const [taskData, setTaskData] = useState<TaskForm | null>(null); // State to hold the task data

  const router = useRouter();

  useEffect(() => {
    if (taskId) {
      async function fetchTask() {
        try {
          const response = await axios.get(`/api/tasks/${taskId}`);
          setTaskData(response.data);
        } catch (error) {
          console.error("Failed to load task:", error);
        }
      }

      fetchTask();
    }
  }, [taskId]);

  // To hold the categories
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(createTaskSchema),
  });

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

      await axios.put("/api/tasks", formattedData); // Send the data to the API
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

    if (username) {
      setValue("owner", username); // ✅ Set owner from URL parameter
    }

    fetchCategories();
  }, [setValue]); // This is pushing the value (owner) to the form state so it can be submitted with the form)

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
          <ErrorMessage>{errors.description?.message}</ErrorMessage>

          {/* Date Picker - this is a controlled component, so we need to use the Controller component from react-hook-form */}
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
          <ErrorMessage>{errors.duedate?.message}</ErrorMessage>

          {/* Submit Button */}
          <Button disabled={isSubmitting} type="submit">
            Submit New Issue {isSubmitting && <Spinner />}
          </Button>
        </form>
      </div>
    </>
  );
};

export default EditTask;
