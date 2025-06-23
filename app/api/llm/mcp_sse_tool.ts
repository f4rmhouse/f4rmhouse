import { F4ToolParams } from "./agent.interfaces"
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

function createMCPTool({ uti, endpoint, title, tool_description, parameters, authorization, caller, uri, transport, mcp_type}: F4ToolParams) {
    //if (!parameters || !parameters.length) {
    //    throw new Error('No parameters defined for this tool');
    //}

    //{tool.inputSchema.properties ? 
    //    Object.keys(tool.inputSchema.properties).map(e => (
    //      <p className="pl-8" key={e}>{e}: {(tool.inputSchema.properties[e] as any).type}</p>
    //    ))
    //  :
    //    <p>JSON Schema: {JSON.stringify(tool.inputSchema.properties)}</p>
    //  }

    let zodSchema;

    if(parameters.properties) {
        zodSchema = z.object(
        Object.fromEntries(
            Object.keys(parameters.properties).map((p:string) => {
                let name = p
                let type = parameters.properties[p].type
                let desc = tool_description
                switch (type) {
                    case "str":
                    case "string":
                        return [
                            name,
                            z.string().describe(desc)
                        ]
                    case "int":
                    case "integer":
                    case "number":
                        return [
                            name,
                            z.number().describe(desc)
                        ]
                    case "bool":
                    case "boolean":
                        return [
                            name,
                            z.boolean().describe(desc)
                        ]
                    case "list":
                    case "array":
                        return [
                            name,
                            z.array(z.string()).describe(desc)
                        ]
                    case "object":
                    case "obj":
                        return [
                            name,
                            z.object({}).describe(desc)
                        ]
                    default:
                        return [
                            name,
                            z.string().describe(desc)
                        ]
                }
            })
        )
    )
    }

    else {
        zodSchema = z.object({})
    }

    async function execute(args: Record<string, string>) {
        try {
            const client = new Client({
                name: "f4rmhouse-client",
                version: "1.0.0"
            });
            const baseUrl = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'http://localhost:8000' : 'http://localhost:8000';
            // Check if auth needed
            // TODO: Add auth check
            let askUserForAuth = true 
            let accessToken = ""
            if(askUserForAuth) {
                let token = await caller.getToken(uti)
                if(token.Code == 404 || token.Token.length == 0) {
                    return {message: "Authentication needed. Inform user to authenticate using the trusted OAuth provider given in the previous dialog message to continue or to cancel the request.", tool_identifier: endpoint, code: 401}
                }
                else {
                    accessToken = token.Token
                }
            }

            const authToken = "Bearer " + accessToken

            const fetchWithAuth = (url: string | URL, init?: RequestInit) => {
              const headers = new Headers(init?.headers);
              headers.set("Authorization", authToken);
              return fetch(url.toString(), { ...init, headers });
            };

            const customHeaders = {
                Authorization: authToken,
            };


            let mcpStreamableHTTPtransport: StreamableHTTPClientTransport;
            let mcpSSEtransport: SSEClientTransport;
            if(transport == "sse") {
                const url = new URL(uri)
                mcpSSEtransport = new SSEClientTransport(url, {
                    eventSourceInit: {
                        fetch: fetchWithAuth,
                    },
                    requestInit: {
                    headers: customHeaders,
                    },
                });
                await client.connect(mcpSSEtransport);
            }
            else {
                const url = new URL(uri)
                mcpStreamableHTTPtransport = new StreamableHTTPClientTransport(url, {
                    requestInit: {
                        headers: customHeaders,
                    },
                });
                await client.connect(mcpStreamableHTTPtransport);
            }

            try {
                // Validate that all required parameters are present
                let result : any;
                let content: any;
                if(mcp_type == "tool") {
                    result = await client.callTool({
                        name: endpoint,
                        arguments: args,
                    }); 
                    if (!result || !result.content) {
                        throw new Error('Empty response');
                    }
    
                    content = result.content;
                }
                if (mcp_type == "prompt") {
                    console.log("Prompt: ", endpoint)
                    console.log("Prompt args: ", args)
                    result = await client.getPrompt({
                        name: endpoint,
                        arguments: args,
                    });
                    content = result.messages[0].content;
                }

                console.log("CONTENT: ", content)

                if (!content) {
                    throw new Error('Empty response');
                }

                client.close()
                return Array.isArray(content) ? content[0] : content;
            } finally {
                client.close();
            }
        } catch (error) {
            console.error("Tool execution error:", error);
            return "an error occurred: " + String(error);
        }
    }

    const t = new DynamicStructuredTool({
        name: title,
        description: tool_description,
        schema: zodSchema, 
        func: execute,
    });

    return t;
}

export default createMCPTool;