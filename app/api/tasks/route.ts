import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createTaskSchema } from "@/app/validationSchema";

const prisma = new PrismaClient(); // Initialize Prisma Client

export async function POST(request: NextRequest) {
  // When our app sends a POST request, it includes data in the request body {"name": "Category Name"}
  // It then parses the request into a JavaScript object so we can access the properties of the object.
  // It's not actually sent to the database yet, but we can use it to validate the request body.
  const body = await request.json();

  console.log("Raw request body:", body);
  console.log(
    "categoryId BEFORE processing:",
    typeof body.categoryId,
    body.categoryId
  );

  // Validate the request body before sending it to the database
  const validation = createTaskSchema.safeParse(body);

  // Check that the validation is good
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 }); // format gives the same error as above but more formatted
  }

  // This is the actual data that will be sent to the database
  const newTask = await prisma.task.create({
    data: {
      name: body.name,
      description: body.description,
      duedate: new Date(body.duedate), // Convert to Date object
      owner: body.owner,
      status: "OPEN", // Enforce default status
      categoryId: parseInt(body.categoryId, 10), // Convert to number
    },
  });

  // This is the response that will be sent back to the client
  return NextResponse.json(newTask, { status: 201 }); // 201 = object created
}

// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   console.log("Received POST Data:", body);
//   return NextResponse.json({ message: "Debugging data", received: body });
// }

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "API is working!" }, { status: 200 });
}