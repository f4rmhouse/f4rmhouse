import F4Session from "@/app/components/types/F4Session";
import { MCPToolType } from "@/app/components/types/MCPTypes";
import { Message } from "ai/react";
import { ToolPermission } from "@/app/components/types/ToolPermissionType";

export type PostDataType = {
    messages: Message[];
    description: string;
    show_intermediate_steps: boolean;
    session: F4Session;
    f4rmer: string;
    model: any; // TODO: Create proper model type
    tools: MCPToolType[]
    allowList: ToolPermission[]
  }