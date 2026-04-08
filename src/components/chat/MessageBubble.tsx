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

function stripInternalBlocks(content: string): string {
  return content
    // Remove complete special blocks first
    .replace(/```json-garden-plan[\s\S]*?```/g, "")
    .replace(/```json-garden-spec[\s\S]*?```/g, "")
    .replace(/```json-plants[\s\S]*?```/g, "")
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    // Remove incomplete/open blocks (streaming: closing ``` not yet received)
    .replace(/```[\s\S]*$/g, "")
    // Collapse 3+ consecutive newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderContent(rawContent: string): React.ReactNode {
  const content = stripInternalBlocks(rawContent);
  if (!content) return null;

  const nodes: React.ReactNode[] = [];
  const lines = content.split("\n");

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) nodes.push(<br key={`br-${lineIdx}`} />);

    // Bullet point lines
    const isBullet = /^[\-•*]\s/.test(line);
    const text = isBullet ? line.replace(/^[\-•*]\s/, "") : line;

    // Parse inline formatting within the line
    const inline = parseInline(text);

    if (isBullet) {
      nodes.push(
        <span key={lineIdx} className="flex items-start gap-1.5 mt-0.5">
          <span className="text-garden-earth mt-0.5 flex-shrink-0">•</span>
          <span>{inline}</span>
        </span>
      );
    } else {
      nodes.push(<span key={lineIdx}>{inline}</span>);
    }
  });

  return nodes;
}

function parseInline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, `code` patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold text-garden-green">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="italic text-garden-earth-dark">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={i} className="font-mono text-xs bg-garden-cream-dark px-1 py-0.5 rounded text-garden-forest">{part.slice(1, -1)}</code>;
    }
    return part || null;
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
