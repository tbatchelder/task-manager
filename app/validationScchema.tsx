import { z } from "zod"; //"@/node_modules/zod/lib/external";

export const createIssueSchema = z.object({
  // title: z.string().min(1).max(255),     Orginal - below is added to customize the error message
  title: z.string().min(1, "Title is required.").max(255),
  // description: z.string().min(1),        Same here
  description: z.string().min(1, "Description is required."),
});
