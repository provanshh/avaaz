"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Check, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { CreateProgress } from "@/components/create/progress";
import { useCreateFlow } from "@/lib/create-flow";
import { cn } from "@/lib/utils";
import { VoicePicker } from "@/components/create/voice-picker";

const ACCEPT = ".pdf,.txt,.docx,.csv,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function KnowledgePage() {
  const { files, setFiles, voice, setVoice } = useCreateFlow();
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const router = useRouter();

  const addFiles = useCallback(async (list: FileList | File[]) => {
    setError("");
    const incoming = Array.from(list);
    for (const file of incoming) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "txt", "docx", "csv"].includes(ext || "")) {
        setError("Unsupported file. Use PDF, TXT, DOCX or CSV.");
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} is too large. Max 8MB.`);
        continue;
      }
      setProgress((p) => ({ ...p, [file.name]: 20 }));
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/files", { method: "POST", body: form });
        const data = await res.json();
        setProgress((p) => ({ ...p, [file.name]: 100 }));
        if (!res.ok) {
          setError(data.error || "File upload failed.");
          continue;
        }
        setFiles((current) => [
          ...current.filter((f) => f.name !== file.name),
          { name: data.name, type: data.type, extractedText: data.extractedText },
        ]);
      } catch {
        setError("File upload failed.");
      }
    }
  }, [setFiles]);

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pt-16">
        <CreateProgress step={4} />
        <h1 className="mt-10 text-center font-serif text-4xl sm:text-5xl">Anything else I should know?</h1>
        <p className="mt-3 text-center text-muted">Upload files that help your agent understand you better.</p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "mt-12 flex cursor-pointer flex-col items-center rounded-3xl border border-dashed bg-white px-6 py-16 transition-colors",
            dragging ? "border-accent bg-accent-soft/40" : "border-border",
          )}
        >
          <FileUp className="size-6 text-accent" />
          <p className="mt-4 text-sm">Drop files here, or click to browse</p>
          <p className="mt-1 text-xs text-muted">PDF, TXT, DOCX, CSV · up to 8MB</p>
          <input
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files && void addFiles(e.target.files)}
          />
        </label>

        <div className="mt-6 space-y-2">
          {files.map((file) => (
            <div key={file.name} className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm">
              <Check className="size-4 text-accent" />
              <span className="flex-1">{file.name}</span>
              {progress[file.name] !== undefined && progress[file.name] < 100 && (
                <span className="text-xs text-muted">{progress[file.name]}%</span>
              )}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-12">
          <VoicePicker value={voice} onChange={setVoice} />
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/create/generating")}>
            Skip
          </Button>
          <Button size="lg" onClick={() => router.push("/create/generating")}>
            Create agent →
          </Button>
        </div>
      </main>
    </div>
  );
}
