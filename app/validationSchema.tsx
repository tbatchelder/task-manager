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
  // This checks to make sure the date is in the future and not today
  duedate: z
    .date({
      required_error: "Due date is required.",
    })
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time component for comparison
        return date >= today;
      },
      {
        message: "Due date cannot be earlier than today.",
      }
    ),
  categoryId: z.number().int("Category ID must be an integer."),
});

// This is based on the columns needed in the schema.prisma file
export const createCategorySchema = z.object({
  name: z.string().min(1, "A category value is required.").max(20),
});
