import { NextResponse } from "next/server";
import { qdrant } from "@/services/qdrant";

export async function GET() {
  try {
    const collections = await qdrant.getCollections();

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}