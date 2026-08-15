"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { publicAgentUrl, shareLabel } from "@/lib/utils";

export function ShareModal({
  open,
  onOpenChange,
  slug,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  name: string;
}) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? publicAgentUrl(slug) : `https://avaaz.ai/talk/${slug}`;

  useEffect(() => {
    if (!open) return;
    void QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: "#111111", light: "#ffffff" } }).then(setQr);
  }, [open, url]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: name, url, text: `Talk to ${name} on Avaaz` });
      return;
    }
    await copy();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Your agent is ready to talk.</DialogTitle>
        <DialogDescription>{shareLabel(slug)}</DialogDescription>
        {qr && (
          // QR is a generated data URL; next/image is not useful here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR code for public agent" className="mx-auto mt-6 size-44 rounded-2xl border border-border" />
        )}
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" onClick={() => void copy()}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy Link
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => void share()}>
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
