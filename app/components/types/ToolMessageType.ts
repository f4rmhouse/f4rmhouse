export type ToolMessageType = {
    content: string;
    tool_call_id: string;
    name: string;
    additional_kwargs: Record<string, unknown>;
    response_metadata: Record<string, unknown>;
    id: string;
  };