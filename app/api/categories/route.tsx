import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createCategorySchema } from "@/app/validationSchema";

const prisma = new PrismaClient(); // Initialize Prisma Client

export async function POST(request: NextRequest) {
  // When our app sends a POST request, it includes data in the request body {"name": "Category Name"}
  // It then parses the request into a JavaScript object so we can access the properties of the object.
  // It's not actually sent to the database yet, but we can use it to validate the request body.
  const body = await request.json();
  // Validate the request body before sending it to the database
  const validation = createCategorySchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 }); // This formats the error message in a way that can be used by the client - 400 is a bad request
  }

  // This is the actual data that will be sent to the database
  const newCategory = await prisma.category.create({
    data: {
      name: body.name,
    },
  });

  // This is the response that will be sent back to the client
  return NextResponse.json(newCategory, { status: 201 }); // 201 is a created response
}
