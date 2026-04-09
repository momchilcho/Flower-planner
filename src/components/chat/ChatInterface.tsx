"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Send, Camera, X, AlertCircle, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { GardenPlan } from "@/types";

interface ChatInterfaceProps {
  sessionId: string | null;
  planId?: string | null;
  onPlanUpdate?: (plan: Partial<GardenPlan>) => void;
  className?: string;
}

const STARTER_PROMPTS = [
  "I have a sunny 4m × 2m border in Belgium with clay soil. I want a low-maintenance cottage-style garden with purple and yellow flowers.",
  "Design a 6m × 1.5m shaded border for the Netherlands. Sandy soil, I prefer white and soft pink tones with a naturalistic feel.",
  "I need a bee-friendly 3m × 3m garden bed in Germany. Full sun, loam soil, mixed colors — medium maintenance is fine.",
  "Create a 5m × 2m fragrant border for the UK. Partial shade, chalky soil, cottage style with blues and whites. Keep it low maintenance.",
];

export function ChatInterface({
  sessionId,
  planId,
  onPlanUpdate,
  className,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePlanGenerated = useCallback((newPlanId: string) => {
    if (onPlanUpdate) {
      fetch(`/api/plans/${newPlanId}`)
        .then((r) => r.json())
        .then((data) => onPlanUpdate(data.plan))
        .catch(console.error);
    }
  }, [onPlanUpdate]);

  const { messages, isLoading, error, sendMessage, clearError, sessionId: activeSessionId } = useChat({
    sessionId,
    onPlanGenerated: handlePlanGenerated,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !imageBase64) return;

    setInput("");
    const img = imageBase64;
    setImagePreview(null);
    setImageBase64(null);

    await sendMessage({ text, imageBase64: img ?? undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLastMessageStreaming =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "ASSISTANT" &&
    !messages[messages.length - 1].content;

  return (
    <div className={cn("flex flex-col h-full bg-garden-cream rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-garden-earth-light flex items-center gap-3">
        <div className="w-8 h-8 bg-garden-green rounded-full flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-garden-cream" />
        </div>
        <div>
          <p className="text-sm font-semibold text-garden-forest font-body">GardenGenius AI</p>
          <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Expert garden designer
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-1 scrollbar-chat transition-colors",
          isDragActive && "bg-garden-green/5 border-2 border-dashed border-garden-green rounded-xl"
        )}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-garden-green/5 rounded-xl">
            <div className="text-center">
              <Camera className="w-12 h-12 text-garden-green mx-auto mb-2" />
              <p className="font-semibold text-garden-green font-body">Drop your sketch here</p>
            </div>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl">🌱</div>
            <div>
              <h3 className="font-display text-xl font-semibold text-garden-forest mb-2">
                Welcome to GardenGenius!
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-sm mx-auto leading-relaxed">
                I&apos;m your AI garden designer. Tell me about your space and I&apos;ll create the perfect planting plan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto mt-4">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="text-left text-xs text-garden-green bg-garden-green/5 border border-garden-green/20 rounded-xl px-4 py-2.5 hover:bg-garden-green/10 transition-colors font-body"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={
              isLoading &&
              idx === messages.length - 1 &&
              msg.role === "ASSISTANT" &&
              msg.content.length > 0
            }
          />
        ))}

        {/* Typing indicator for initial response */}
        {isLastMessageStreaming && <TypingIndicator />}
        {isLoading && messages.length === 0 && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-body">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={clearError} className="ml-auto hover:text-red-800">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-white border-t border-garden-earth-light">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-16 w-auto rounded-lg border border-garden-earth-light object-cover"
            />
            <button
              onClick={() => { setImagePreview(null); setImageBase64(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-garden-earth-light">
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={openFilePicker}
            className="flex-shrink-0 text-garden-earth hover:text-garden-green hover:bg-garden-green/10"
            title="Upload sketch or photo"
          >
            <Camera className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 4m × 2m sunny border in Belgium, clay soil, low maintenance, purple flowers…"
              className="min-h-[44px] max-h-[120px] resize-none pr-2 bg-garden-cream border-garden-earth-light focus-visible:ring-garden-green scrollbar-chat"
              disabled={isLoading}
              rows={1}
            />
          </div>

          <Button
            type="button"
            variant="garden"
            size="icon"
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !imageBase64)}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-body text-center">
          Powered by Claude AI · 50+ European perennials
        </p>
      </div>
    </div>
  );
}
