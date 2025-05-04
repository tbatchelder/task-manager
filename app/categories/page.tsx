"use client";

import { Button, Callout, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ErrorMessage from "@/app/components/ErrorMessage";
// import Spinner from "@/app/components/Spinner";
// import NavBarTask from "../components/NavBarTask";

type CategoryForm = {
  name: string;
};

const AddCategoryPage = () => {
  const router = useRouter();
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<CategoryForm>();
  const { register, handleSubmit } = useForm<CategoryForm>();

  const [error, setError] = useState("");
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     setIsSubmitting(true);
  //     console.log(data);
  //     await axios.post("/api/categories", data);
  //     console.log("bye");
  //     router.push("/"); // Adjust this path to match your categories list page
  //   } catch (err) {
  //     console.log("hi");
  //     setIsSubmitting(false);
  //     setError("An unexpected error occurred.");
  //   }
  // });

  return (
    <>
      {/* <NavBarTask /> */}
      <div className="max-w-xl">
        {error && (
          <Callout.Root color="red" className="mb-5">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (data) => {
            try {
              await axios.post("/api/categories", data);
              router.push("/");
            } catch (error) {
              setError("Error in Category submission.");
            }
          })}
        >
          <TextField.Root
            placeholder="Category Name"
            {...register("name", { required: "Category name is required." })}
          ></TextField.Root>
          {/* <ErrorMessage>{errors.name?.message}</ErrorMessage> */}
          {/* <Button disabled={isSubmitting}>
            Add Category {isSubmitting && <Spinner />}
          </Button> */}
          <Button>Add Category</Button>
        </form>
      </div>
    </>
  );
};

export default AddCategoryPage;
