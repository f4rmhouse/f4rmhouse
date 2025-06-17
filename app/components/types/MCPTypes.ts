export type InputSchema = {
  type: string,
  required: string[],
  properties: {
    [key: string]: {
      default?: string,
      title?: string,
      type: string
    }
  }

}

export type Tool = {
  name: string,
  descriptions: string,
  inputSchema: InputSchema,
}

export type Prompt = {
  name: string,
  description: string,
  // Add any other fields that might be needed based on the actual data structure
}

export type ServerSummaryType = {
  name: string,
  version: string
  instructions:string 
  tools: Tool[],
  prompts: Prompt[],
  resources: Object[],
  resourceTemplates: Object[],
  serverCapabilities: Object[]
  uri: string
}