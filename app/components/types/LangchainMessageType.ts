interface TokenDetails {
    cached_tokens?: number;
    audio_tokens?: number;
    reasoning_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
    audio?: number;
    cache_read?: number;
  }
  
  interface UsageMetadata {
    output_tokens: number;
    input_tokens: number;
    total_tokens: number;
    input_token_details: {
      audio: number;
      cache_read: number;
    };
    output_token_details: {
      audio: number;
      reasoning: number;
    };
  }
  
  interface ResponseMetadata {
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finish_reason?: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      prompt_tokens_details: TokenDetails;
      completion_tokens_details: TokenDetails;
    };
    system_fingerprint: string;
  }
  
export type LangchainMessageType = {
    lc_serializable: boolean;
    lc_kwargs: {
      lc_serializable: boolean;
      lc_kwargs: {
        content: string;
        tool_calls: any[];
        invalid_tool_calls: any[];
        additional_kwargs: Record<string, unknown>;
        response_metadata: ResponseMetadata;
        id: string;
      };
      lc_namespace: string[];
      content: string;
      additional_kwargs: Record<string, unknown>;
      response_metadata: ResponseMetadata;
      id: string;
      tool_calls: any[];
      invalid_tool_calls: any[];
      usage_metadata: UsageMetadata;
    };
    lc_namespace: string[];
    content: string;
    additional_kwargs: Record<string, unknown>;
    response_metadata: ResponseMetadata;
    id: string;
    tool_calls: any[];
    invalid_tool_calls: any[];
    usage_metadata: UsageMetadata;
    latency: number
  }