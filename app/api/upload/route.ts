import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to Buffer in memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate Base64 Data URL
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    console.error("Local upload/Base64 conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
