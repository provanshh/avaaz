import { extractText } from "unpdf";
import mammoth from "mammoth";

const ALLOWED = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EXT_MAP: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export function mimeFromName(name: string, fallback = "") {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EXT_MAP[ext] || fallback;
}

export function isAllowedFile(name: string, type: string) {
  const mime = type || mimeFromName(name);
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ALLOWED.has(mime) || ["pdf", "txt", "csv", "docx"].includes(ext);
}

export function sanitizeExtracted(text: string) {
  return text.replace(/\u0000/g, "").replace(/[^\S\n]+/g, " ").trim().slice(0, 80_000);
}

export async function extractFileText(name: string, type: string, bytes: Buffer) {
  const mime = type || mimeFromName(name);
  const ext = name.split(".").pop()?.toLowerCase();

  if (mime === "text/plain" || ext === "txt") {
    return sanitizeExtracted(bytes.toString("utf8"));
  }

  if (mime === "text/csv" || ext === "csv") {
    return sanitizeExtracted(csvToText(bytes.toString("utf8")));
  }

  if (mime.includes("wordprocessingml") || ext === "docx") {
    const result = await mammoth.extractRawText({ buffer: bytes });
    return sanitizeExtracted(result.value);
  }

  if (mime === "application/pdf" || ext === "pdf") {
    try {
      const { text } = await extractText(new Uint8Array(bytes));
      const joined = Array.isArray(text) ? text.join("\n") : String(text || "");
      const cleaned = sanitizeExtracted(joined);
      if (cleaned) return cleaned;
    } catch {
      /* fall through */
    }
    return sanitizeExtracted(naivePdfText(bytes));
  }

  throw new Error("Unsupported file");
}

function naivePdfText(bytes: Buffer) {
  const raw = bytes.toString("latin1");
  return [...raw.matchAll(/\(([^)]+)\)\s*Tj/g)].map((m) => m[1]).join("\n");
}

function csvToText(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return "";
  const headers = splitCsvLine(lines[0]);
  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      return headers.map((h, i) => `${h}: ${cols[i] || ""}`).join(" · ");
    })
    .join("\n");
}

function splitCsvLine(line: string) {
  return line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
}
