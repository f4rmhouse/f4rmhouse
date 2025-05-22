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
import { ModelConfig, Endpoint, RequestBody } from "./agent.interfaces";
import { LLMServiceError } from "./agent.errors";
import { ChatOllama } from "@langchain/ollama";

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
        uti: "dashboarder",
        endpoint: endpoint.endpoints[0],
        title: `${endpoint.endpoints[0]}_${Math.random().toString(36).substring(2, 8)}`,
        endpoint_description: endpoint.descriptions[0],
        tool_description: "This tool lets you create a dashboard from a JSON config object.",
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

    let tmp_json_format = `
    {
        "title": "[string] the title of the dashboard",
        "theme": "[string] supports the following: "plotly", "plotly_white", "plotly_dark", "ggplot2", "seaborn", "simple_white", "none"",
        "width": "[number] the pixel width of the dashboard",
        "height": "[number] the pixel height of the dashboard",
        "subplots": {
            "rows": [number] the number of rows in the dashboard,
            "cols": [number] the number of columns in the dashboard,
            "titles": [string[]] the titles of each chart in the dashboard,
            "shared_xaxes": False,
            "shared_yaxes": False
        },
        "data": object[] an array of objects with data for each chart,
        "plots": an array of objects that looks like this [
            {
                "type": the type of chart (poltly charts): "scatter"|"bar"|"heatmap"|"contour"|"surface"|"scatter3d",
                "x": [string] name of x-axis,
                "y": [string] name of y-axis,
                "mode": [string] how data points are displayed in a chart can have any of these values: 'markers', 'lines', 'lines+markers', 'text', 'markers+text', 'lines+text', 'lines+markers+text'
                "line": [Object] an object with the folowing formst: {"color": "[string] "<the_color>", "width": [number] the width in pixels},
                "name": [string] the name of the chart,
                "row": [number] the width of the chart. Has to be lower than the total rows in the dashboard,
                "col": [number] the height of the chart. Has to be lower than the total columns in the dashboard
	            "markers": (optional, used in barcharts) [Object] display different colors for bars in stacked barcharts has the following format: {"colors": [array of colors]}
            }
	         ...
        ],
        "layout": {
            "showlegend": [bool] true = show legend, false = hide legend,
            "legend": [Object] an object with the following format: {"orientation": "h", "y": -0.1}
        }
    } 
    `

    // Create and bind tools
    toolbox = [
      {
        uti: "dashboarder",
        description: "This server provides a function that can create a dashboard from a JSON object. To start the creation process edit layout with uuid as an empty string. This will create an empty layout for you that you can edit.",
        endpoint: "dashboard"
      }
    ]

    endpoints.push({
      endpoints: ["render"],
      descriptions: [`
        Generate a Plotly chart based on a JSON configuration.
        Parameters:
        -----------
        uuid: str
            the uuid of the dashboard to render
        Returns:
        --------
        url: str 
          the url of the dashboard stored as an html file
        `],
      parameters: ["uuid"]
    });
    endpoints.push({
      endpoints: ["edit_layout"],
      descriptions: [`
        Generate a Plotly layout.
    
    Parameters:
    -----------
    uuid: str 
        the uuid of the dashboard to edit
    title:str 
        the title of the dashboard
    theme:str 
        the theme of the dashboard supports all plotly themes
    width:str 
        width in pixels of the dashboard
    height:str 
        height in picels of the dashboard
    rows:str 
        number of rows has to be integer bigger than 0
    cols:str 
        number of columns has to be integer bigger than 0
    
    Returns:
    --------
    uuid: str 
      the uuid of the layout
        `],
      parameters: ["uuid", "title", "theme", "width", "height", "rows", "cols"]
    });

    endpoints.push({
      endpoints: ["insert_chart"],
      descriptions: [`
        Append a new chart to the dashboard.
    
    Parameters:
    -----------
    uuid: str 
        the uuid of the dashboard to append the chart to
    chart_type: str
        the type of chart (poltly charts): "scatter"|"bar"|"heatmap"|"contour"|"surface"|"scatter3d". When creating a line chart use the 'scatter' type.
    x_values: str
        the x values to be displayed in the chart. Has to be an array like: [23,2132,5,43] or ["A", "B", "C"] etc
    y_values: str
        the y values to be displayed in the chart. Has to be an array like: [23,2132,5,43] or ["A", "B", "C"] etc
    z_values: str
        only needed when chart_type is "heatmap","contour","surface" or "scatter3d" optional when chart_type is "scatter" or "bar" (use [] in its place). Has to be an array like: [23,2132,5,43] or ["A", "B", "C"] etc
    row: str
        the row that the chart will be displayed on
    col: str
        the column the chart will be displayed on
    Returns:
    --------
    uuid: str 
      the uuid of the chart
        `],
      parameters: ["uuid", "chart_type", "x_values", "y_values", "z_values", "row", "col"]
    });
    endpoints.push({
      endpoints: ["create_new_dashboard"],
      descriptions: [`
        Create a new dashboard 
        Parameters:
    -----------
    rows: str 
      number of rows in the dashboard 
    cols: str
        number of columns in the dashboard
    --------
    uuid: str 
    the uuid of the new dashboard 
        `],
      parameters: ["rows", "cols"]
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