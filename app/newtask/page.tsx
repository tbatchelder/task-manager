"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/app/validationSchema";
import { z } from "zod";
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
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(createTaskSchema),
  });

  // To hold the categories
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");

  // To provide an error to the user
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/issues", data);
      router.push("/");
    } catch (error) {
      console.log(error); // Log the error for debugging purposes
      setIsSubmitting(false);
      setError("A new Task error occured.");
    }
  });

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

    fetchCategories();
  }, []);

  return (
    <>
      <NavBarTask />
      <div className="max-w-xl">
        {error && (
          <Callout.Root color="red" className="mb-5">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <form className="space-y-3" onSubmit={onSubmit}>
          <TextField.Root
            placeholder="Name"
            {...register("name")}
          ></TextField.Root>
          <ErrorMessage>{errors.name?.message}</ErrorMessage>

          <label htmlFor="category">Category</label>
          <select
            id="category"
            {...register("categoryId")}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ErrorMessage>{errors.categoryId?.message}</ErrorMessage>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <SimpleMDE placeholder="Description" {...field} />
            )}
          />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select a date"
          />

          <ErrorMessage>{errors.description?.message}</ErrorMessage>
          <Button disabled={isSubmitting}>
            Submit New Issue {isSubmitting && <Spinner />}
          </Button>
        </form>
      </div>
    </>
  );
};

export default NewTask;
