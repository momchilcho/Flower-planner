"use client";

import React from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlantCard } from "./PlantCard";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function renderContent(content: string): React.ReactNode {
  if (!content) return null;

  // Split by code blocks, bold, italic, etc.
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g);

  return parts.map((part, i) => {
    if (part === "\n") return <br key={i} />;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-garden-green">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="italic text-garden-earth-dark">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="font-mono text-xs bg-garden-cream-dark px-1 py-0.5 rounded text-garden-forest">{part.slice(1, -1)}</code>;
    }
    // Handle bullet points
    if (part.startsWith("• ") || part.startsWith("- ")) {
      return <span key={i} className="block pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-garden-earth">{part.slice(2)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "USER";
  const metadata = message.metadata as Record<string, unknown> | null;
  const plants = metadata?.plants as Array<Record<string, unknown>> | undefined;

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-garden-green flex items-center justify-center flex-shrink-0 mt-1">
          <Leaf className="w-4 h-4 text-garden-cream" />
        </div>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}>
        {/* Image if uploaded */}
        {message.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-garden-earth-light max-w-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Uploaded sketch"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Message content */}
        {(message.content || isStreaming) && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed font-body",
              isUser
                ? "bg-garden-green text-garden-cream rounded-tr-sm"
                : "bg-white border border-garden-earth-light text-garden-forest rounded-tl-sm shadow-sm"
            )}
          >
            <div className="prose-garden">
              {renderContent(message.content)}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-garden-earth ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>
        )}

        {/* Embedded plant cards */}
        {plants && plants.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {plants.map((plant, idx) => (
              <PlantCard
                key={idx}
                plant={plant as Parameters<typeof PlantCard>[0]["plant"]}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-muted-foreground font-body",
          isUser ? "text-right" : "text-left"
        )}>
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-garden-green flex items-center justify-center flex-shrink-0">
        <Leaf className="w-4 h-4 text-garden-cream" />
      </div>
      <div className="bg-white border border-garden-earth-light rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1 h-4">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
