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
    console.log("Form data:", data);
    try {
      setIsSubmitting(true);

      console.log(taskData);

      // Convert categoryId to a number before sending the request if needed
      const formData = {
        // ...data,
        // categoryId: Number(data.categoryId),
        // // Ensure duedate is properly formatted as ISO string
        // duedate:
        //   data.duedate instanceof Date
        //     ? data.duedate.toISOString()
        //     : data.duedate,
        id: Number(taskId), // Include the task ID explicitly
        name: data.name,
        description: data.description,
        categoryId: Number(data.categoryId),
        duedate:
          data.duedate instanceof Date
            ? data.duedate.toISOString()
            : data.duedate,
        owner: data.owner || username,
        status: data.status,
      };

      await axios.put(`/api/tasks/${taskId}`, formData); // Send the data to the API
      setIsSubmitting(false); // Stop the spinner
      router.push("/"); // Redirect to the home page
    } catch (error) {
      console.error("Axios error:", error);
      setIsSubmitting(false);
      setError("An error occurred while updating the task.");
    }
  });

  useEffect(() => {
    if (!taskId) {
      setError("Task ID is missing");
      return;
    }

    async function fetchData() {
      // Fetch categories
      try {
        const categoriesResponse = await axios.get("/api/categories");
        setCategories(categoriesResponse.data);

        const response = await axios.get(`/api/tasks/${taskId}`);
        const task = response.data;

        // Set the form values with the task data
        setValue("name", task.name);
        setValue("description", task.description);
        setValue("categoryId", task.categoryId);
        setValue("duedate", new Date(task.duedate));
        setValue("owner", username || task.owner);
        setValue("status", task.status);

        setTaskData(task);
        console.log("Task data:", task);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load task or category data");
      }

      // Fetch the task data
      // So, apparently, in order to get data for a single instance, you need to pass it to a folder called [id] in the api/tasks folder
      // you can't simply pass it in the body like we did elsewhere either as that doesn't work
      // Doing this actually makes sense as it is a RESTful API - which means we are separating the main pull for individual pulls
      // We'll have to pass it back this way as well ... maybe]
      // try {
      // const response = await axios.get(`/api/tasks/${taskId}`);
      // const task = response.data;

      // Set the form values with the task data
      // setValue("name", task.name);
      // setValue("description", task.description);
      // setValue("categoryId", task.categoryId);
      // setValue("duedate", new Date(task.duedate));
      // setValue("owner", username || task.owner);
      // setValue("status", task.status);

      // setTaskData(task);
      // console.log("Task data:", task);
      // } catch (error) {
      //   console.error("Failed to load task:", error);
      //   setError("Failed to load task data");
      // }
    }

    fetchData();
  }, [taskId, username, setValue]); // This is pushing the value (owner) to the form state so it can be submitted with the form)

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
            // defaultValue={0} // Start with undefined instead of empty string or 0
            render={({ field }) => (
              <Select.Root
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) =>
                  field.onChange(value ? parseInt(value, 10) : "")
                }
              >
                <Select.Trigger color="cyan" placeholder="Select a category...">
                  {/* Display selected category name if available */}
                  {field.value &&
                    categories.find((c) => c.id === Number(field.value))?.name}
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
            name="status"
            control={control}
            defaultValue="OPEN" // Start with undefined instead of empty string or 0
            render={({ field }) => (
              <Select.Root value={field.value} onValueChange={field.onChange}>
                <Select.Trigger color="cyan" placeholder="Select a status...">
                  {/* Placeholder is on the Trigger component */}
                  {field.value}
                </Select.Trigger>
                <Select.Content color="cyan" position="popper">
                  {["OPEN", "IN_PROGRESS", "CLOSED"].map((status) => (
                    <Select.Item key={status} value={status}>
                      {status}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
          <ErrorMessage>{errors.status?.message}</ErrorMessage>

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
            // defaultValue={undefined} // Use undefined instead of null
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

// Next.js Dynamic API Routes - How They Work

// In Next.js, when you create a file with square brackets like `[id]` in the filename or folder name, it creates a dynamic route:

// 1. The file structure:
//    app/api/tasks/[id]/route.ts

// 2. This single file handles ALL these URLs:
//    - /api/tasks/1
//    - /api/tasks/2
//    - /api/tasks/123
//    - /api/tasks/anything

// 3. Inside the route handler, you access the dynamic parameter:
//    ```typescript
//    export async function GET(
//      request: NextRequest,
//      { params }: { params: { id: string } }
//    ) {
//      // params.id will contain the value from the URL
//      // e.g., if URL is /api/tasks/5, then params.id === '5'
//      console.log(params.id);
//      // ...
//    }
//    ```

// Important: You DO NOT create physical files for each ID. You create ONE file with [id] in its name, and Next.js handles the routing.

// Now, we COULD put it in the URL ... but that's not typically how it's done normally.
// const categoriesResponse = await axios.get("/api/categories");

// export async function GET(request: NextRequest) {
//   try {
//     // Get the task ID from the URL query parameters
//     const url = new URL(request.url);
//     const id = url.searchParams.get("id");

//     // If an ID is provided, fetch a specific task
//     if (id) {
//       const taskId = parseInt(id);

//       if (isNaN(taskId)) {
//         return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
//       }

//       const task = await prisma.task.findUnique({
//         where: { id: taskId },
//         include: { category: true },
//       });

//       if (!task) {
//         return NextResponse.json({ error: "Task not found" }, { status: 404 });
//       }

//       return NextResponse.json(task, { status: 200 });
//     }

//     // Otherwise, fetch all tasks
//     const tasks = await prisma.task.findMany({
//       where: { status: { not: "DELETED" } }, // Filter out deleted tasks
//       include: { category: true }, // Fetch category name along with task data
//       orderBy: { duedate: "asc" }, // Sort tasks by due date
//     });

//     return NextResponse.json(tasks, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching task(s):", error);
//     return NextResponse.json(
//       { error: "Failed to retrieve tasks" },
//       { status: 500 }
//     );
//   }
// }

// // PUT (update) a task
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, name, description, categoryId, duedate, owner } = body;

//     if (!id) {
//       return NextResponse.json(
//         { error: "Task ID is required" },
//         { status: 400 }
//       );
//     }

//     const updatedTask = await prisma.task.update({
//       where: { id: Number(id) },
//       data: {
//         name,
//         description,
//         categoryId: Number(categoryId),
//         duedate: new Date(duedate),
//         owner,
//       },
//     });

//     return NextResponse.json(updatedTask, { status: 200 });
//   } catch (error) {
//     console.error("Error updating task:", error);
//     return NextResponse.json(
//       { error: "Failed to update task" },
//       { status: 500 }
//     );
//   }
// }

//<Select.Trigger color="cyan" placeholder="Select a category...">
//  {/* Placeholder is on the Trigger component */}
//</Select.Trigger>;
