// DataItemType is used to represent a point in a timeseries linechart
type ChatMessageType = {
    id: string,
    content: string,
    tool_calls: any[],
    role: "system"|"user"|"tool_response"|"tool_init"|"error"|"auth",
    timestamp: number 
    status?: "pending" | "completed" | "cancelled"
}

export default ChatMessageType 