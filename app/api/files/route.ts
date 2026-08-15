import { NextResponse } from "next/server";
import { extractFileText, isAllowedFile, MAX_FILE_BYTES, mimeFromName } from "@/lib/files/extract";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max 8MB." }, { status: 400 });
  }
  if (!isAllowedFile(file.name, file.type)) {
    return NextResponse.json({ error: "Unsupported file. Use PDF, TXT, DOCX or CSV." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractFileText(file.name, file.type, bytes);
    return NextResponse.json({
      name: file.name,
      type: file.type || mimeFromName(file.name),
      extractedText,
    });
  } catch {
    return NextResponse.json({ error: "Could not read that file." }, { status: 400 });
  }
}
