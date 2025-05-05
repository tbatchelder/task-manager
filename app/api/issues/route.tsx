import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createTaskSchema } from "@/app/validationSchema";

const prisma = new PrismaClient(); // Initialize Prisma Client

export async function POST(request: NextRequest) {
  // When our app sends a POST request, it includes data in the request body {"name": "Category Name"}
  // It then parses the request into a JavaScript object so we can access the properties of the object.
  // It's not actually sent to the database yet, but we can use it to validate the request body.
  const body = await request.json();
  // Validate the request body before sending it to the database
  const validation = createTaskSchema.safeParse(body);

  // Check that the validation is good
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 }); // format gives the same error as above but more formatted
  }

  // This is the actual data that will be sent to the database
  const newIssue = await prisma.task.create({
    data: {
      name: body.title,
      description: body.description,
      duedate: body.dueDate,

      status: body.status,
    },
  });

  // This is the response that will be sent back to the client
  return NextResponse.json(newIssue, { status: 201 }); // 201 = object created
}
