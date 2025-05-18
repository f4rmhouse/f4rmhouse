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
import { F4SessionStorage } from "@/app/microstore/Session";
import { NextApiResponse } from "next";
import { ModelConfig, Endpoint, RequestBody } from "./agent.interfaces";
import { LLMServiceError } from "./agent.errors";
import { ChatOllama } from "@langchain/ollama";
import { isAIMessageChunk } from "@langchain/core/messages";

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
  static async createTools(toolbox: any[] | undefined, endpoints: Endpoint[], email: string) {
    if (!toolbox || !endpoints.length) return [];
    return endpoints.map((endpoint, i) => {
      let a_add = createF4Tool({
        uti: toolbox[i].uti,
        endpoint: endpoints[i].endpoints[0],
        title: toolbox[i].uti,
        endpoint_description: endpoints[i].descriptions[0],
        tool_description: toolbox[i].description
      });
      return a_add;
    });
  }
  static async createMCPTools(toolbox: any[] | undefined, endpoints: Endpoint[], email: string) {
    if (!toolbox || !endpoints.length) return [];

    return endpoints.map((endpoint, i) => {
      return createMCPTool({
        uti: "ascii_gen",
        endpoint: endpoint.endpoints[0],
        title: `${endpoint.endpoints[0]}_${Math.random().toString(36).substring(2, 8)}`,
        endpoint_description: endpoint.descriptions[0],
        tool_description: "This tool lets you write a love letter and generates ascii if needed.",
        parameters: endpoint.parameters
      });
    });

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
    const { description, messages = [], model: selectedModel, email, toolbox: initialToolbox, f4rmer } = body;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const session = new F4SessionStorage();
    
    // Handle toolbox initialization
    let toolbox = initialToolbox;
    if (!toolbox && f4rmer) {
      const f4rmerData = await session.readF4rmer(f4rmer);
      toolbox = f4rmerData?.[0]?.tool_box ?? [];
    }

    toolbox = []

    // Process endpoints
    let endpoints: Endpoint[] = [];
    for (const tool of toolbox ?? []) {
      const summary = await session.getSummary(tool.uti);
      if (summary?.ips) {
        endpoints.push({
          endpoints: Array.from(summary.endpoints),
          descriptions: Array.from(summary.descriptions),
          parameters: Array.from(summary.parameters)
        });
      }
    }

    endpoints = []

    // Initialize model
    if (!selectedModel) {
      throw new LLMServiceError('[ERROR_NO_MODEL] You need to select a model to get a response', 400);
    }
    const model = ModelFactory.create(selectedModel);

    // Create and bind tools
    toolbox = [
      {
        uti: "ascii-gen",
        description: "This server provides a function that returns a fun ascii art made by a volunteer",
        endpoint: "gen_ascii"
      }
    ]

    endpoints.push({
      endpoints: ["create_love_letter"],
      descriptions: ["Create a love letter for the two character names given as parameter"],
      parameters: ["fr", "to"]
    });
    endpoints.push({
      endpoints: ["gen_ascii"],
      descriptions: ["Returns an ascii animal"],
      parameters: ["name"]
    });

    const tools = await ToolManager.createMCPTools(toolbox ?? [], endpoints, email);
    const toolNode = new ToolNode(tools);
    
    if (!model.bindTools) {
      throw new LLMServiceError('Selected model does not support tools', 400);
    }
    const newModel = model.bindTools(tools);

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