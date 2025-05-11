import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createTaskSchema } from "@/app/validationSchema";

const prisma = new PrismaClient(); // Initialize Prisma Client

// When our app sends a POST request, it includes data in the request body {"name": "Category Name"}
// t then parses the request into a JavaScript object so we can access the properties of the object.
// It's not actually sent to the database yet, but we can use it to validate the request body.
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate the request body before sending it to the database
  const validation = createTaskSchema.safeParse(body);

  // Check that the validation is good
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 }); // format gives the same error as above but more formatted
  }

  // This is the actual data that will be sent to the database
  // This is forcing the status to be OPEN since any New task should be OPEN by default
  // and the categoryId to be a number since it is a foreign key in the database
  // The duedate is converted to a Date object since it is a date in the database
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

// This is a GET request to test the API endpoint
export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { status: { not: "DELETED" } }, // Filter out deleted tasks
    include: { category: true }, // Fetch category name along with task data
    orderBy: { duedate: "asc" }, // Sort tasks by due date
  });

  return NextResponse.json(tasks, { status: 200 });
}

// This is a GET request to test the API endpoint
export async function PUT(request: NextRequest) {
  const { id, status } = await request.json(); // Extract ID & new status from request body

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}