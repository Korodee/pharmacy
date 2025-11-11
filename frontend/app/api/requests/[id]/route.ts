import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

const COLLECTION_NAME = "requests";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const requestId = resolvedParams.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update request status in MongoDB
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.updateOne(
      { id: requestId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Request status updated successfully",
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update request status",
      },
      { status: 500 }
    );
  }
}

