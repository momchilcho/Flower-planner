"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/types";

interface UseChatOptions {
  sessionId: string | null;
  onPlanGenerated?: (planId: string) => void;
}

interface SendMessageOptions {
  text: string;
  imageBase64?: string;
}

export function useChat({ sessionId, onPlanGenerated }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const sendMessage = useCallback(
    async ({ text, imageBase64 }: SendMessageOptions) => {
      if (!text.trim() && !imageBase64) return;
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId: currentSessionId ?? "temp",
        role: "USER",
        content: text,
        imageUrl: imageBase64 ? ("data:image/jpeg;base64," + (imageBase64.split(",")[1] || imageBase64)) : null,
        metadata: null,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Placeholder for AI response
      const aiPlaceholderId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiPlaceholderId,
        sessionId: currentSessionId ?? "temp",
        role: "ASSISTANT",
        content: "",
        metadata: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId: currentSessionId,
            imageBase64: imageBase64 ?? null,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error ?? "Failed to send message");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let aiContent = "";
        let newSessionId: string | null = null;
        let planId: string | null = null;
        let metadata: Record<string, unknown> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              if (data.startsWith("[SESSION:")) {
                newSessionId = data.slice(9, -1);
                setCurrentSessionId(newSessionId);
                continue;
              }
              if (data.startsWith("[PLAN:")) {
                planId = data.slice(6, -1);
                if (planId && onPlanGenerated) {
                  onPlanGenerated(planId);
                }
                continue;
              }
              if (data.startsWith("[META:")) {
                try {
                  metadata = JSON.parse(data.slice(6, -1));
                } catch {
                  // ignore parse errors
                }
                continue;
              }
              aiContent += data;
            }
          }

          // Update AI message with streamed content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiPlaceholderId
                ? {
                    ...m,
                    content: aiContent,
                    sessionId: newSessionId ?? m.sessionId,
                    metadata: Object.keys(metadata).length > 0 ? metadata : m.metadata,
                  }
                : m
            )
          );
        }

        // Final update
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === userMsg.id && newSessionId) {
              return { ...m, sessionId: newSessionId };
            }
            if (m.id === aiPlaceholderId) {
              return {
                ...m,
                content: aiContent,
                sessionId: newSessionId ?? m.sessionId,
                metadata: Object.keys(metadata).length > 0 ? metadata : null,
              };
            }
            return m;
          })
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorMessage = err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        // Remove the placeholder AI message on error
        setMessages((prev) => prev.filter((m) => m.id !== aiPlaceholderId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [currentSessionId, isLoading, onPlanGenerated]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    clearError,
    sendMessage,
    cancelStream,
    sessionId: currentSessionId,
    loadMessages,
  };
}
