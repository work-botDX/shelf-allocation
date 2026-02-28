import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const shelves = await prisma.shelf.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        allocations: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(shelves);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shelves" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, row, column, cellWidth, cellHeight } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const shelf = await prisma.shelf.create({
      data: {
        name,
        row: row || 3,
        column: column || 5,
        cellWidth: cellWidth || 30,
        cellHeight: cellHeight || 25,
      },
    });

    return NextResponse.json(shelf, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create shelf" },
      { status: 500 }
    );
  }
}
