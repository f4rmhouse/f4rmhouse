import F4Session from "@/app/components/types/F4Session";
import { InputSchema, MCPOAuthType, MCPToolType } from "@/app/components/types/MCPTypes";
import User from "@/app/microstore/User";
import { BaseMessage } from "@langchain/core/messages";

export interface F4ToolParams {
    uti: string;
    endpoint: string;
    title: string;
    endpoint_description: string;
    tool_description: string;
    parameters: InputSchema;
    authorization?: MCPOAuthType
    caller: User
    uri: string
    transport: string
    mcp_type: string
}

export interface F4ToolExecuteParams {
    data: any;
}

export interface ModelConfig {
    id: string;
    provider: string;
    name: string;
}
  
export interface RequestBody {
  description: string;
  messages: BaseMessage[];
  model: ModelConfig;
  session: F4Session;
  toolbox?: any[];
  f4rmer?: string;
  tools: MCPToolType[]
}
  
export interface Endpoint {
  endpoints: string[];
  descriptions: string[];
  parameters: string[];
}

export interface ToolExecuteFunction {
  (params: { [key: string]: any }): Promise<string>;
}

export interface ToolSignature {
  title: string;
  description: string;
  execution: ToolExecuteFunction;
  params: any; // This is for Zod schema
}

export interface Tool {
  name: string;
  description: string;
  execute: ToolExecuteFunction;
  schema: any; // This is for Zod schema
}