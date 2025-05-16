import { Message } from "ai/react";

export type PostDataType = {
    messages: Message[];
    description: string;
    show_intermediate_steps: boolean;
    email: string;
    provider: string;
    token: string;
    f4rmer: string;
    model: any; // TODO: Create proper model type
  }