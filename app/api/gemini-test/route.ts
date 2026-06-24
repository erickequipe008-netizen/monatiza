import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function GET() {
  try {
    const result = await model.generateContent(
      "Responda apenas: Gemini conectado com sucesso"
    );

    return NextResponse.json({
      success: true,
      response: result.response.text(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}