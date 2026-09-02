import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function getPublicFormUrl(value: string) {
  const rawUrl = value.trim();
  if (!rawUrl) return "";

  try {
    const url = new URL(rawUrl);
    if (url.hostname === "docs.google.com" && url.pathname.endsWith("/edit")) {
      url.pathname = url.pathname.replace(/\/edit$/, "/viewform");
      url.search = "";
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function useProjectFormUrl() {
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((settings: Record<string, string>) => {
        setFormUrl(getPublicFormUrl(settings["architects_form"] ?? ""));
      })
      .catch(() => {});
  }, []);

  return formUrl;
}

export function ProjectFormCta({
  formUrl,
  className = "",
  variant = "solid",
}: {
  formUrl: string;
  className?: string;
  variant?: "solid" | "subtle";
}) {
  const buttonClass =
    variant === "subtle"
      ? "bg-transparent text-white/55 hover:bg-transparent hover:text-white border-b border-white/20 hover:border-white/60 rounded-none px-0 py-2 uppercase tracking-[0.25em] text-[10px] font-bold inline-flex items-center gap-2 transition-colors"
      : "bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 uppercase tracking-[0.2em] text-xs font-bold inline-flex items-center gap-3";

  const button = (
    <Button
      disabled={!formUrl}
      className={`${buttonClass} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      Start a Project <ArrowRight size={14} />
    </Button>
  );

  return formUrl ? (
    <a href={formUrl} target="_blank" rel="noopener noreferrer">
      {button}
    </a>
  ) : (
    button
  );
}