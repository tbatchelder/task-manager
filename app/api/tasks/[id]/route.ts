import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Initialize Prisma Client

// app/api/tasks/[id]/route.ts
// GET a specific task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to retrieve task" },
      { status: 500 }
    );
  }
}

// PUT (update) a specific task by ID
// export async function PUT(
//   request: NextRequest,
//   // { params }: { params: { id: string } }
// ) {
//   try {
//     // const id = parseInt(params.id);
//     const { id } = await request.json(); // Extract ID & new status from request body

//     if (isNaN(id)) {
//       return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
//     }
    
//     const body = await request.json();
//     const { name, description, categoryId, duedate, owner } = body;
    
//     const updatedTask = await prisma.task.update({
//       where: { id },
//       data: {
//         name,
//         description,
//         categoryId: Number(categoryId),
//         duedate: new Date(duedate),
//         owner,
//       },
//     });

//     return NextResponse.json(updatedTask, { status: 200 });
//   } catch (error) {
//     console.error("Error updating task:", error);
//     return NextResponse.json(
//       { error: "Failed to update task" },
//       { status: 500 }
//     );
//   }
// }
// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   // const { id, status } = await request.json(); // Extract ID & new status from request body
//   // console.log("ID:", id);
//   // if (!id) {
//   //   return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
//   // }

//   try {
//     const id = parseInt(params.id);
    
//     if (isNaN(id)) {
//       return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
//     }

//     const updatedTask = await prisma.task.update({
//       where: { id: Number(id) },
//       data: { status },
//     });

//     return NextResponse.json(updatedTask, { status: 200 });
//   } catch (error) {
//     console.error("Error updating task status:", error);
//     return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
//   }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }
    
    const body = await request.json();
    console.log("Received update request for task ID:", id, "with data:", body);
    
    const { name, description, categoryId, duedate, owner, status } = body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        name,
        description,
        categoryId: Number(categoryId),
        duedate: new Date(duedate),
        owner,
        status
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}