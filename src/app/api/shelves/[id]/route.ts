import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.shelf.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete shelf" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, row, column, cellWidth, cellHeight } = body;

    const shelf = await prisma.shelf.update({
      where: { id },
      data: {
        name,
        row: row || 3,
        column: column || 5,
        cellWidth: cellWidth || 30,
        cellHeight: cellHeight || 25,
      },
    });

    return NextResponse.json(shelf);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update shelf" },
      { status: 500 }
    );
  }
}
