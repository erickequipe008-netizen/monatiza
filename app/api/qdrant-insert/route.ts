import { NextResponse } from "next/server";
import { qdrant } from "@/services/qdrant";

export async function GET() {
  try {
    await qdrant.upsert("artigos", {
      wait: true,
      points: [
        {
          id: 1,
          vector: Array(1536).fill(0.1),
          payload: {
            titulo: "Primeiro artigo da Monatiza",
            categoria: "Tecnologia",
            data: new Date().toISOString(),
          },
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Artigo salvo",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}