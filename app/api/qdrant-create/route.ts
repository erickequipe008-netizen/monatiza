import { NextResponse } from "next/server";
import { qdrant } from "@/services/qdrant";

export async function GET() {
  try {
    await qdrant.createCollection("artigos", {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Coleção criada",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}