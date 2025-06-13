import { F4ToolParams } from "./agent.interfaces"
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import { z } from "zod";

function createMCPTool({ uti, endpoint, title, endpoint_description, tool_description, parameters = [], authorization, caller }: F4ToolParams) {
    //if (!parameters || !parameters.length) {
    //    throw new Error('No parameters defined for this tool');
    //}

    const zodSchema = z.object(
        Object.fromEntries(
            parameters.map((p:any) => {
                let name = p.parameter.name
                let type = p.parameter.type
                let desc = p.parameter.description
                switch (type) {
                    case "str":
                    case "string":
                        return [
                            name,
                            z.string().describe(desc)
                        ]
                    case "int":
                        return [
                            name,
                            z.number().describe(desc)
                        ]
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
            if(askUserForAuth && authorization) {
                let token = await caller.getToken(uti)
                console.log(token)
                if(token.Code == 404) {
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

            // const url = new URL(`${baseUrl}/products/sse?uti=${uti}`)
            const url2 = new URL("http://127.0.0.1:8080/sse")
            const transport = new SSEClientTransport(url2, {
                eventSourceInit: {
                    fetch: fetchWithAuth,
                },
                requestInit: {
                  headers: customHeaders,
                },
            });
            await client.connect(transport);

            try {
                // Validate that all required parameters are present
                const result = await client.callTool({
                    name: endpoint.split("_").slice(1).join("_"),
                    arguments: args,
                });

                if (!result || !result.content) {
                    throw new Error('No content in response');
                }

                const content = result.content;
                console.log("CONTENT: ", content)
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