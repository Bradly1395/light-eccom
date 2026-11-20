"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons";

export function SavedNotice({ title, mode }: { title: string; mode: "created" | "updated" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Drop ?saved=… from the URL so a refresh doesn't re-show the notice.
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    url.searchParams.delete("mode");
    window.history.replaceState(window.history.state, "", url);

    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-pop items-center gap-3 rounded-full bg-ink py-2.5 pl-2.5 pr-5 text-sm text-paper shadow-lift"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-sage">
        <CheckIcon width={14} height={14} strokeWidth={2.2} />
      </span>
      <span className="max-w-[60vw] truncate">
        {mode === "created" ? "Added" : "Saved"} “{title}”
      </span>
    </div>
  );
}
