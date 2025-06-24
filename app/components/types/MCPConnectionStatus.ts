export type MCPConnectionStatus = {
    status: "success" | "authenticate" | "error" | "connecting"
    remoteMetadata?: any
    remoteAuthServerMetadata?: any
}