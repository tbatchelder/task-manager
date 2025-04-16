import { z } from "zod"; //"@/node_modules/zod/lib/external";

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
