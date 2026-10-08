import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { ArrowUpIcon, MessageSquareIcon } from "lucide-react";
import { Streamdown } from "streamdown";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_app/example/chat")({
  component: ChatPage,
});

function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

const transport = new DefaultChatTransport({ api: "/example/api/chat" });

function ChatPage() {
  const { messages, sendMessage, status } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";
  const handleSend = useCallback((text: string) => void sendMessage({ text }), [sendMessage]);

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-4xl flex-col rounded-xl border bg-card">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="p-6">
              {messages.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquareIcon />
                    </EmptyMedia>
                    <EmptyTitle>Start a conversation</EmptyTitle>
                    <EmptyDescription>Type a message below to begin chatting.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isUser}
                    >
                      <Message align={isUser ? "end" : "start"}>
                        <MessageContent>
                          {message.parts.map((part) =>
                            part.type === "text" ? (
                              <Bubble
                                key={`${message.id}-${part.type}`}
                                variant={isUser ? "default" : "ghost"}
                              >
                                <BubbleContent>
                                  {isUser ? (
                                    <span className="whitespace-pre-wrap">{part.text}</span>
                                  ) : (
                                    <Streamdown animated isAnimating={status === "streaming"}>
                                      {part.text}
                                    </Streamdown>
                                  )}
                                </BubbleContent>
                              </Bubble>
                            ) : null,
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <ChatComposer isBusy={isBusy} onSend={handleSend} />
    </div>
  );
}

// Owns the input state so typing doesn't re-render the message list.
function ChatComposer({ isBusy, onSend }: { isBusy: boolean; onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = input.trim();
      if (!text || isBusy) {
        return;
      }
      onSend(text);
      setInput("");
    },
    [input, isBusy, onSend],
  );
  const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value);
  }, []);

  return (
    <form className="border-t p-4" onSubmit={handleSubmit}>
      <InputGroup>
        <InputGroupTextarea
          aria-label="Message"
          className="min-h-20"
          disabled={isBusy}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          value={input}
        />
        <InputGroupAddon align="block-end" className="justify-end">
          <InputGroupButton
            aria-label="Send message"
            disabled={!input.trim() || isBusy}
            size="icon-sm"
            type="submit"
            variant="default"
          >
            {isBusy ? <Spinner /> : <ArrowUpIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
