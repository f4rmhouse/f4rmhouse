import { F4ToolParams } from "./agent.interfaces"
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolListChangedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

function createMCPTool({ uti, endpoint, title, tool_description, parameters, authorization, caller, uri, transport, mcp_type, allowList, generatedContent, onContentGenerated}: F4ToolParams) {

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

    async function execute(args: Record<string, string>) : Promise<any>{
        try {
            const client = new Client({
                name: "f4rmhouse-client",
                version: "1.0.0",
            });
            // const baseUrl = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'http://localhost:8000' : 'http://localhost:8000';
            // Check if auth needed
            // TODO: Add auth check
            let askUserForConfirmation = true 

            allowList.map(e => {
                if(e.name == endpoint) {
                    askUserForConfirmation = false
                }
            })

            let accessToken = {Code: 0, Token: ""}
            if(askUserForConfirmation) {
                return {
                    message: "Confirmation needed to continue. Please inform user to confirm or cancel the request so that personal or confidential data isn't sent to the server. DO NOT WRITE ANY 'SYNTHETIC RESPONSE' or HALLUCINATIONS", 
                    tool_identifier: endpoint, 
                    code: 401, 
                    data: {
                        name: endpoint,
                        arguments: args,
                    }
                }
            }

            let token = await caller.getToken(uti) 
            if(token.encryptedData.length > 0) {
                accessToken = token.token.token
            }

            const authToken = "Bearer " + accessToken

            console.log("Auth token: ", authToken)

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
                const filteredArgs = Object.fromEntries(
                    Object.entries(args).filter(([key, value]) => {
                        // Remove null, undefined, empty strings, and empty arrays
                        if (value === null || value === undefined || value === '') {
                            return false;
                        }
                        // Remove empty arrays
                        if (Array.isArray(value) && value.length === 0) {
                            return false;
                        }
                        // Remove empty objects
                        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                            return false;
                        }
                        return true;
                    })
                );

                // Validate that all required parameters are present
                let result : any;
                let content: any;
                if(mcp_type == "tool") {
                    console.log("Calling tool: ", endpoint)
                    console.log("Arguments: ", filteredArgs)
                    result = await client.callTool({
                        name: endpoint,
                        arguments: filteredArgs,
                    }); 
                    console.log("Result: ", result)
                    if (!result || !result.content) {
                        throw new Error('Empty response');
                    }
    
                    content = result.content;
                }
                if (mcp_type == "prompt") {
                    result = await client.getPrompt({
                        name: endpoint,
                        arguments: filteredArgs,
                    });
                    content = result.messages[0].content;
                }

                if (!content) {
                    throw new Error('Empty response');
                }

                if(content.length > 2) {
                    // Call the callback to store the large content
                    onContentGenerated(content);
                    // await client.close()
                    return ["The result does not fit into the context window."];
                }

                // await client.close()
                return content;
            } finally {
                // await client.close();
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