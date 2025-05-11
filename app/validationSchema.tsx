// Zod is a TypeScript-first schema declaration and validation library that allows you to define schemas for your data and validate them at runtime. It is particularly useful for validating user input in APIs and forms.
// It provides a simple and expressive syntax for defining schemas, including support for various data types, transformations, and error handling. Zod can be used to ensure that the data you receive matches the expected structure and types, making it easier to catch errors early in your application.
// While the Prisma schema is used to define the structure of your database tables and relationships, Zod is used to validate the data that you receive in your API requests or forms. This separation of concerns allows you to have a clear and maintainable codebase.
// Zod does this by preventing invalid data, catching errors and improving security.

// The taskSchema doesn't define the database; it is used to validate the data that is sent to the API endpoint. The schema defines the expected structure and types of the data, ensuring that it meets certain criteria before being processed or stored in the database. This helps prevent errors and ensures that the data is valid before it is sent to the database.
// The Prisma schema, on the other hand, defines the structure of the database itself, including tables, columns, and relationships. It is used to generate the database schema and manage data access through the Prisma client.
// In summary, the taskSchema is used for validating incoming data in the API endpoint, while the Prisma schema defines the structure of the database. They serve different purposes but work together to ensure that your application handles data correctly and securely.

import { z } from "zod";

export const createTaskSchema = z.object({
  owner: z
    .string()
    .min(1, "Owner is required.")
    .max(25, "Owner must be 25 characters or less."),
  name: z
    .string()
    .min(1, "Title is required.")
    .max(50, "Title must be 50 characters or less."),
  description: z.string().min(1, "Description is required."),
  duedate: z
    .union([z.date(), z.string()]) // Accept both Date and string during validation
    // If it's a string, it will be parsed to a Date object
    .transform((val) => {
      if (typeof val === "string") {
        return new Date(val); // Convert string to Date object
      }
      return val;
    })
    .refine(
      (date) => {
        if (!date || isNaN(date.getTime())) return false; // Ensure valid date - if it's null or undefined, fail validation
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time for accurate comparison - which is also a good idea since we want it due on a day, not to an exact time ... which is really silly to do for most things
        return date > today; // Must be a future date
      },
      {
        message: "Due date must be in the future.",
      }
    ),
  categoryId: z
    .union([z.number().int(), z.string()]) // Accept both string and number during validation
    .refine(
      (val) => {
        if (typeof val === "string") {
          return val !== "";
        }
        return val > 0; // Ensure category ID is positive
      },
      {
        message: "Category is required.",
      }
    )
    .transform((val) => {
      // Transform string to number if needed
      if (typeof val === "string" && val !== "") {
        return parseInt(val, 10);
      }
      return val;
    }),
});

// This is based on the columns needed in the schema.prisma file
export const createCategorySchema = z.object({
  name: z.string().min(1, "A category value is required.").max(20),
});

// This DOES NOT WORK .... will have to refactor it with what does work to still make sure we have a date in the future
// This checks to make sure the date is in the future and not today
// duedate: z
//   .date({
//     required_error: "Due date is required.",
//   })
//   .nullable() // Allow null during form editing
//   .refine(
//     (date) => {
//       if (!date) return false; // Fail validation if null/undefined
//       const today = new Date();
//       today.setHours(0, 0, 0, 0); // Remove time component for comparison
//       return date >= today;
//     },
//     {
//       message: "Due date cannot be earlier than today.",
//     }
//   ),
