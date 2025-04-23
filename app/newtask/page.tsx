"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import SimpleMDE from "react-simplemde-editor";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/app/validationSchema";
import { z } from "zod";
import ErrorMessage from "@/app/components/ErrorMessage";
import Spinner from "@/app/components/Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import NavBarTask from "../components/NavBarTask";

type TaskForm = z.infer<typeof createTaskSchema>;

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

  // To provide an error to the user
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/issues", data);
      router.push("/issues");
    } catch (error) {
      setIsSubmitting(false);
      setError("An unexpected error occured.");
    }
  });

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
            placeholder="Title"
            {...register("name")}
          ></TextField.Root>
          <ErrorMessage>{errors.name?.message}</ErrorMessage>
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
