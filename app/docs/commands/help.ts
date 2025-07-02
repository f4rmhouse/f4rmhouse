export const helpContent = `### Basics
**MCP profiles:** Use \`@\` to call an MCP profile connected to a system prompt e.g. \`@ads\` to use a profile that can generate ads or \`@pm\` to prompt a profile that can manage your projects. 
\n
**Models**: Choose an LLM using the button to the right of the chat window or use \`#\` to pick a specific model just for the current prompt.

### Commands
- \`/help\` - Show this help message
- \`/clear\` - Clear the current chat session
- \`/tab\` - Create a new session tab 

### Tips
- Create your own MCP profiles. You can browse available MCP servers in the \`Action Store\` or you can add local ones.
- Use specific, clear instructions for best results.
- Check the sidebar for available MCP servers and tools.
- Use OpenRouter to automatically route your prompt to the best model.
- Use multiple \`#\` to run prompts in parallel and choose the response you want to keep working with.

### Example prompts
- @pm tell me what I did last week #llama-4-maverick
- @ads generate an ad for a showcase. It should contain 3 phones in a line with the words: step 1 step 2 step 3 below. The phones should have a green screen so that I can replace the content on the phones with my own screenshots. Bright yellow background #llama-4-maverick #gpt-4o #gemini-flash-2.5 #gemini-pro-2.5.
- Pick out some nice japanese selvedge jeans for a night out @shopping .

### Need More Help?
Visit our documentation or contact support for additional assistance.`;
