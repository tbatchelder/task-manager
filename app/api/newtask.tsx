import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../utility/client";
import { z } from "zod";

// Zod is a TypeScript-first schema declaration and validation library that allows you to define schemas for your data and validate them at runtime. It is particularly useful for validating user input in APIs and forms.
// It provides a simple and expressive syntax for defining schemas, including support for various data types, transformations, and error handling. Zod can be used to ensure that the data you receive matches the expected structure and types, making it easier to catch errors early in your application.
// While the Prisma schema is used to define the structure of your database tables and relationships, Zod is used to validate the data that you receive in your API requests or forms. This separation of concerns allows you to have a clear and maintainable codebase.
// Zod does this by preventing invalid data, catching errors and improving security.

// The taskSchema doesn't define the database; it is used to validate the data that is sent to the API endpoint. The schema defines the expected structure and types of the data, ensuring that it meets certain criteria before being processed or stored in the database. This helps prevent errors and ensures that the data is valid before it is sent to the database.
// The Prisma schema, on the other hand, defines the structure of the database itself, including tables, columns, and relationships. It is used to generate the database schema and manage data access through the Prisma client.
// In summary, the taskSchema is used for validating incoming data in the API endpoint, while the Prisma schema defines the structure of the database. They serve different purposes but work together to ensure that your application handles data correctly and securely.

// Define validation schema
const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().min(1, "Description is required"),
  duedate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
  owner: z.string().min(1, "Owner name is required"),
  categoryId: z.number().min(1, "Category ID is required"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const validationResult = taskSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.errors });
    }

    const { name, description, duedate, status, owner, categoryId } =
      validationResult.data;

    try {
      const newTask = await prisma.task.create({
        data: {
          name,
          description,
          duedate: new Date(duedate),
          status,
          owner,
          categoryId,
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
