import type { NextApiRequest, NextApiResponse } from 'next';

// app/api/stream/route.js (App Router)
export async function GET() {
    // Set up the stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < 10; i++) {
          const data = { message: `This is chunk ${i}` };
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        controller.close();
      }
    });
  
    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
}