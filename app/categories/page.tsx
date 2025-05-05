"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorMessage from "@/app/components/ErrorMessage";
import Spinner from "@/app/components/Spinner";
import NavBarTask from "../components/NavBarTask";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema } from "../validationSchema";
import { z } from "zod";

type CategoryForm = z.infer<typeof createCategorySchema>; // This is used to infer the type of the schema

const AddCategoryPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(createCategorySchema),
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/categories", data);
      router.push("/");
    } catch (error) {
      setIsSubmitting(false);
      setError("A Category submission error occurred.");
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
            placeholder="Category Name"
            {...register("name", { required: "Category name is required." })}
          ></TextField.Root>
          <ErrorMessage>{errors.name?.message}</ErrorMessage>
          <Button disabled={isSubmitting}>
            Add Category {isSubmitting && <Spinner />}
          </Button>
          <Button>Add Category</Button>
        </form>
      </div>
    </>
  );
};

export default AddCategoryPage;
