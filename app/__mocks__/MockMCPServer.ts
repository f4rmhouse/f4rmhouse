import express from "express";
import http from 'http'; 
import z from "zod"
import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"

const createMockResponse = () => {
    const res = {
      writeHead: jest.fn().mockImplementation(http.ServerResponse.prototype.writeHead),
      write: jest.fn().mockReturnValue(true),
      on: jest.fn(),
    };
    res.writeHead.mockReturnThis();
    res.on.mockReturnThis();
    
    return res as unknown as http.ServerResponse;
  };


const CreateMockTransport = async () => {
    const mockRes = createMockResponse();
    const endpoint = '/messages';
    const transport = new SSEServerTransport(endpoint, mockRes);
    const expectedSessionId = transport.sessionId;

    await transport.start(); 
    return transport
}

export const CreateMockMCPServer = () => {

    const app = express();
    app.use(express.json());

    // Map to store transports by session ID
    const transports: { [sessionId: string]: SSEServerTransport} = {};

    // Handle POST requests for client-to-server communication
    app.post('/mcp', async (req, res) => {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: SSEServerTransport;

    if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = await CreateMockTransport() 

        // Clean up transport when closed
        transport.onclose = () => {
        if (transport.sessionId) {
            delete transports[transport.sessionId];
        }
        };
        const server = new McpServer({
        name: "example-server",
        version: "1.0.0"
        });


        server.tool("add",
            { a: z.number(), b: z.number() },
            async ({ a, b }) => ({
              content: [{ type: "text", text: String(a + b) }]
            })
          );
          
          // Add a dynamic greeting resource
          server.resource(
            "greeting",
            new ResourceTemplate("greeting://{name}", { list: undefined }),
            async (uri, { name }) => ({
              contents: [{
                uri: uri.href,
                text: `Hello, ${name}!`
              }]
            })
          );

        // Connect to the MCP server
        await server.connect(transport);
    } else {
        // Invalid request
        res.status(400).json({
        jsonrpc: '2.0',
        error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
        },
        id: null,
        });
        return;
    }

    // Handle the request
    await transport.handleMessage(req.body);
    });

    // Reusable handler for GET and DELETE requests
    const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }
    
    const transport = transports[sessionId];
    await transport.handleMessage(req.body);
    };

    // Handle GET requests for server-to-client notifications via SSE
    app.get('/sse', handleSessionRequest);

    // Handle DELETE requests for session termination
    app.post('/messages', handleSessionRequest);

    return app.listen(3001);
}
