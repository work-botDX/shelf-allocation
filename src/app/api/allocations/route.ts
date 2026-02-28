import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        product: true,
        shelf: true,
      },
    });
    return NextResponse.json(allocations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch allocations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, shelfId, row, column } = body;

    if (!productId || !shelfId || row === undefined || column === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const allocation = await prisma.allocation.create({
      data: {
        productId,
        shelfId,
        row,
        column,
      },
      include: {
        product: true,
        shelf: true,
      },
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create allocation" },
      { status: 500 }
    );
  }
}
