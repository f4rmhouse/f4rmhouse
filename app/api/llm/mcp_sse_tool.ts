import { F4ToolParams } from "./agent.interfaces"
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

function createMCPTool({ uti, endpoint, title, endpoint_description, tool_description, parameters = [] }: F4ToolParams) {
    //if (!parameters || !parameters.length) {
    //    throw new Error('No parameters defined for this tool');
    //}

    const zodSchema = z.object(
        Object.fromEntries(
            parameters.map((p:string) => {
                let name = p.split("::")[0]
                let type = p.split("::")[1]
                let desc = p.split("::")[2]
                console.log(name, type, desc)
                switch (type) {
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

            const url = new URL(`${baseUrl}/products/sse?uti=${uti}`)
            const url2 = new URL("http://127.0.0.1:8080/sse")
            const transport = new SSEClientTransport(url2);
            await client.connect(transport);

            try {
                // Validate that all required parameters are present
                const result = await client.callTool({
                    name: endpoint,
                    arguments: args 
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