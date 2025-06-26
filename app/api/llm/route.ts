// This code was taken from https://github.com/langchain-ai/langchain-nextjs-template/blob/main/app/api/chat/route.ts
// this boilerplace example is from the official langhcain github repo. We use it here because it's a fast way to implement
// llms into the app not because it's going to be the approach used in prod
// export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import createF4Tool from "./f4-tool";
import createMCPTool from "./mcp_sse_tool";
import { ModelConfig, Endpoint, RequestBody } from "./agent.interfaces";
import { LLMServiceError } from "./agent.errors";
import { ChatOllama } from "@langchain/ollama";
import {ChatGroq} from "@langchain/groq";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import User from "@/app/microstore/User";
import { MCPToolType, Prompt, Tool } from "@/app/components/types/MCPTypes";
import { ToolPermission } from "@/app/components/types/ToolPermissionType";

class ModelFactory {
  static create(config: ModelConfig): BaseChatModel {
    const { provider, id } = config;

    switch (provider.toLowerCase()) {
      case 'openai':
        return new ChatOpenAI({
          temperature: 0.8,
          model: id,
          openAIApiKey: process.env.OPENAI_SECRET
        });
      case 'anthropic':
        return new ChatAnthropic({
          temperature: 0.8,
          model: id,
          anthropicApiKey: process.env.ANTHROPIC_SECRET
        });
      case 'groq':
        return new ChatGroq({
          model: id,
          apiKey: process.env.GROQ_SECRET,
          maxRetries: 2,
        });
      case "google":
        return new ChatGoogleGenerativeAI({
          model: id,
          apiKey: process.env.GOOGLE_SECRET,
          maxRetries: 2,
          temperature: 0.8,
        });
      case 'local':
        return new ChatOllama({
          model: "llama3.2",
          temperature: 0.8,
          maxRetries: 2,
        });
      default:
        throw new LLMServiceError(`Unsupported model provider: ${provider}`, 400);
    }
  }
}

class ToolManager {
  static createMCPTools(toolbox: MCPToolType[] | undefined, endpoints: any[], caller: User, allowList: ToolPermission[]): any[] {
    let f4tools: any[] = []
    if (!toolbox) return f4tools;
    for (const tool of toolbox) {
      tool.tools.map((t: Tool) => {
        f4tools.push(createMCPTool({
          uti: tool.uti,
          endpoint: t.name,
          title: `${t.name}`,
          endpoint_description: t.description,
          tool_description: t.description,
          parameters: t.inputSchema,
          authorization: tool.authorization,
          caller: caller,
          uri: tool.uri,
          transport: tool.transport,
          mcp_type: "tool",
          allowList: allowList
        }))
      })
      tool.prompts.map((p: Prompt) => {
        f4tools.push(createMCPTool({
          uti: tool.uti,
          endpoint: p.name,
          title: `${p.name}_${Math.random().toString(36).substring(2, 8)}`,
          endpoint_description: p.description,
          tool_description: p.description,
          parameters: p.inputSchema,
          authorization: tool.authorization,
          caller: caller,
          uri: tool.uri,
          transport: tool.transport,
          mcp_type: "prompt",
          allowList: allowList
        }))
      })
    }
    return f4tools
  }
  static createEmptyToolbox() {
    return [];
  }
}

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

const TEMPLATE = `{description}

Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;
    const { description, messages = [], model: selectedModel, session, toolbox: initialToolbox, tools, allowList} = body;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const caller = new User(session.user.email, session.provider, session.access_token);

    console.log("ALLOW LIST: ", allowList)

    // Handle toolbox initialization
    let toolbox = tools;
    //if (!toolbox && f4rmer) {
    //  const f4rmerData = await chat_session.readF4rmer(f4rmer);
    //  toolbox = f4rmerData?.[0]?.tool_box ?? [];
    //}

    // Process endpoints
    let endpoints: Endpoint[] = [];

    if(toolbox?.length) {
      toolbox?.map((tool: MCPToolType) => {})
    }
    else {
      endpoints = []
    }

    // Initialize model
    if (!selectedModel) {
      throw new LLMServiceError('[ERROR_NO_MODEL] You need to select a model to get a response', 400);
    }
    const model = ModelFactory.create(selectedModel);


    const mcpTools = ToolManager.createMCPTools(toolbox ?? [], endpoints, caller, allowList);
    const emptyToolbox = ToolManager.createEmptyToolbox()
    const toolNode = new ToolNode(mcpTools);

    if (!model.bindTools) {
      throw new LLMServiceError('Selected model does not support tools', 400);
    }
    const newModel = model.bindTools(mcpTools);

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    // const outputParser = new HttpResponseOutputParser();

    let modelWithPrompt = prompt.pipe(newModel)

    const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
      const lastMessage = messages[messages.length - 1] as AIMessage;
    
      // If the LLM makes a tool call, then we route to the "tools" node
      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      // Otherwise, we stop (reply to the user) using the special "__end__" node
      return "__end__";
    }

    const callModel = async (
      state: typeof StateAnnotation.State,
    ) => {
      const { messages } = state;
      const responseMessage = await modelWithPrompt.invoke({description: description, chat_history: messages, input: messages[messages.length-1].content});
      return { messages: [responseMessage] };
    };

    let inputs = {messages: messages}

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    const graph = workflow.compile();

    let res = await graph.stream(
      inputs, 
      {streamMode: "messages"}
    )


    const reader = res.getReader();
    const encoder = new TextEncoder();

    const newStream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(JSON.stringify(value)))
        }
        controller.close();
      }
    });

    // We stream only updates from the ReAct agent we don't stream any text. 
    return new Response(newStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (e: any) {
    console.log("ERROR: ", e)
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}