import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export interface ClaimDocument {
  id: string;
  category: "medications" | "appeals" | "manual-claims" | "diapers-pads";
  rxNumber: string;
  productName: string;
  prescriberName: string;
  prescriberLicense: string;
  prescriberFax?: string;
  dinItem?: string;
  dateOfPrescription: string;
  type: "new" | "renewal" | "prior-authorization";
  claimStatus:
    | "new"
    | "case-number-open"
    | "authorized"
    | "denied"
    | "letter-sent-to-doctor"
    | "letters-received"
    | "letters-sent-to-nihb"
    | "form-filled"
    | "form-sent-to-doctor"
    | "sent-to-nihb"
    | "sent"
    | "payment-received";
  patientSignedLetter?: boolean;
  din?: string;
  itemNumber?: string;
  caseNumber?: string;
  authorizationNumber?: string;
  authorizationStartDate?: string;
  authorizationEndDate?: string;
  // Manual claims specific fields
  manualClaimType?: "baby" | "old";
  parentNameOnFile?: boolean;
  parentBandNumberUpdated?: boolean;
  dateOfRefill?: string;
  documents: Array<{
    filename: string;
    filePath: string;
    uploadDate: string;
    type: string;
  }>;
  notes: Array<{
    id: string;
    text: string;
    staffUsername: string;
    timestamp: string;
  }>;
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    changedBy?: string;
  }>;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = "claims";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const now = new Date().toISOString();
    const newClaim: ClaimDocument = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: body.category,
      rxNumber: body.rxNumber,
      productName: body.productName,
      prescriberName: body.prescriberName || "",
      prescriberLicense: body.prescriberLicense || "",
      prescriberFax: body.prescriberFax || "",
      dinItem: body.dinItem || "",
      din: body.din || "",
      itemNumber: body.itemNumber || "",
      dateOfPrescription: body.dateOfPrescription || body.dateOfRefill || "",
      type: body.type || "new",
      claimStatus: body.claimStatus,
      patientSignedLetter: body.patientSignedLetter || false,
      caseNumber: body.caseNumber || "",
      authorizationNumber: body.authorizationNumber || "",
      authorizationStartDate: body.authorizationStartDate || "",
      authorizationEndDate: body.authorizationEndDate || "",
      manualClaimType: body.manualClaimType,
      parentNameOnFile: body.parentNameOnFile || false,
      parentBandNumberUpdated: body.parentBandNumberUpdated || false,
      dateOfRefill: body.dateOfRefill || "",
      documents: body.documents || [],
      notes: body.notes || [],
      statusHistory: [
        {
          fromStatus: "initial",
          toStatus: body.claimStatus,
          changedAt: now,
          changedBy: body.changedBy || "Admin User",
        },
      ],
      priority: body.priority || false,
      createdAt: now,
      updatedAt: now,
    };

    const collection = await getCollection(COLLECTION_NAME);
    await collection.insertOne(newClaim);

    return NextResponse.json({
      success: true,
      claim: newClaim,
    });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create claim" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const id = searchParams.get("id");

    const collection = await getCollection(COLLECTION_NAME);

    if (id) {
      const claim = await collection.findOne({ id });
      if (!claim) {
        return NextResponse.json(
          { success: false, error: "Claim not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, claim });
    } else {
      const query = category ? { category } : {};
      const claims = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json({ success: true, claims });
    }
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    const { id: idFromBody, claimStatus, changedBy, ...updateData } = body;
    const id = idFromBody || idFromQuery || "";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTION_NAME);

    // If status is being updated, track the change
    if (claimStatus) {
      const existingClaim = await collection.findOne({ id });

      if (!existingClaim) {
        return NextResponse.json(
          { success: false, error: "Claim not found" },
          { status: 404 }
        );
      }

      const oldStatus = existingClaim.claimStatus;

      // Only track if status actually changed
      if (oldStatus !== claimStatus) {
        const now = new Date().toISOString();
        const statusHistoryEntry = {
          fromStatus: oldStatus,
          toStatus: claimStatus,
          changedAt: now,
          changedBy: changedBy || "Admin User",
        };

        // Get existing status history or initialize empty array
        const existingHistory = existingClaim.statusHistory || [];

        // If no history exists and this is the initial status, create initial entry
        if (existingHistory.length === 0) {
          existingHistory.push({
            fromStatus: "initial",
            toStatus: oldStatus,
            changedAt: existingClaim.createdAt || now,
            changedBy: "Admin User",
          });
        }

        // Add new status change to history
        existingHistory.push(statusHistoryEntry);

        const result = await collection.updateOne(
          { id },
          {
            $set: {
              ...updateData,
              claimStatus,
              statusHistory: existingHistory,
              updatedAt: now,
            },
          }
        );

        if (result.matchedCount === 0) {
          return NextResponse.json(
            { success: false, error: "Claim not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Claim updated successfully",
        });
      }
    }

    // If status is not being updated, just update normally
    const result = await collection.updateOne(
      { id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Claim updated successfully",
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update claim" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json().catch(() => ({}));
    const { deletionNote, deletedBy } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTION_NAME);
    const archivesCollection = await getCollection("archived_claims");

    // Get the claim before deleting
    const claim = await collection.findOne({ id });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Claim not found" },
        { status: 404 }
      );
    }

    // Archive the claim with deletion note
    const archivedClaim = {
      ...claim,
      archivedAt: new Date().toISOString(),
      deletionNote: deletionNote || "",
      archivedBy: deletedBy || "Admin User",
    };

    await archivesCollection.insertOne(archivedClaim);

    // Delete from main collection
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete claim" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Claim archived successfully",
    });
  } catch (error) {
    console.error("Error deleting claim:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete claim" },
      { status: 500 }
    );
  }
}
