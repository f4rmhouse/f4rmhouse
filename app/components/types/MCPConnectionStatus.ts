export type MCPConnectionStatus = {
    status: "success" | "authenticate" | "error"
    remoteMetadata?: any
    remoteAuthServerMetadata?: any
}