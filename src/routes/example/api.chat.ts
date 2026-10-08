import { createAnthropic } from "@ai-sdk/anthropic";
import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { env } from "@/lib/env-server";

export const Route = createFileRoute("/example/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!env.ANTHROPIC_API_KEY) {
          return new Response("Set ANTHROPIC_API_KEY to use the chat example.", { status: 500 });
        }
        const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
        const { messages }: { messages: UIMessage[] } = await request.json();

        const result = streamText({
          model: anthropic("claude-sonnet-4-5-20250929"),
          messages: await convertToModelMessages(messages),
        });

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({ stream: result.stream }),
        });
      },
    },
  },
});
