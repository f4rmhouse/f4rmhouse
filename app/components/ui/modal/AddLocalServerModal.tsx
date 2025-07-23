import { useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import Modal from "./Modal";
import { HardDrive, Plus } from "lucide-react";
import ProductType from "../../types/ProductType";
import { useAgent } from "@/app/context/AgentContext";
import User from "@/app/microstore/User";
import { useSession } from "next-auth/react";

interface AddLocalServerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddLocalServerModal({ open, onClose }: AddLocalServerModalProps) {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [selectedTransport, setSelectedTransport] = useState<"sse" | "streamable_http">("streamable_http");
  const [authProvider, setAuthProvider] = useState<"apiKeyInURL" | "oauth" | "none">("none");
  const { selectedAgent, setSelectedAgent, client } = useAgent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement the logic to add the local server
    console.log("Adding local server:", {
      name: serverName,
      url: serverUrl,
      description: serverDescription,
      transport: selectedTransport,
      authProvider: authProvider
    });
    
    // Reset form
    setServerName("");
    setServerUrl("");
    setServerDescription("");
    setSelectedTransport("streamable_http");
    setAuthProvider("none");
    
    // Close modal
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setServerName("");
    setServerUrl("");
    setServerDescription("");
    setSelectedTransport("streamable_http");
    setAuthProvider("none");
    onClose();
  };

  const onSubmit = () => {
    let product: ProductType = {
      uid: "randomd-uuid",
      title: serverName,
      uti: serverName,
      description: serverDescription,
      rating: 0,
      price: 0,
      thumbnail: "none",
      overview: "none",
      communityURL: "none",
      reviews: 0,
      developer: "local",
      pricingType: "none",
      releaseType: "none",
      version: "1",
      showcase: [],
      tags: [],
      deployed: false,
      deployment_type: selectedTransport,
      server: {
        transport: selectedTransport,
        uri: serverUrl,
        authorization: {
          authorization_url: "",
          token_url: "",
          revocation_url: "",
          redirect_url: ""
        },
        auth_provider: authProvider
      }
    } 
    let tmp = selectedAgent
    if(tmp && session) {
      tmp?.toolbox.push(product)
      console.log("f4rmer: ", tmp)
      // @ts-expect-error
      let user = new User(session.user.email, session.provider, session.access_token)
      user.updateF4rmer(tmp).then(e => alert("Tool added successfully"))
    }
  }

  return (
    <Modal open={open} title="Add Custom Server" onClose={handleClose}>
      <div className={`p-4 ${theme.textColorPrimary}`}>
        <div className="flex items-center gap-3 mb-4">
          <HardDrive size={24} />
          <p className="text-lg font-medium">
            Connect to Custom MCP Server
          </p>
        </div>
        
        <p className="text-sm mb-6">
          Add a custom MCP (Model Context Protocol) server to extend your agent's capabilities with custom tools and resources.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="serverName" 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textColorPrimary }}
            >
              Server Name *
            </label>
            <input
              id="serverName"
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="e.g., My Local Server"
              required
              className={`${theme.backgroundColor} ${theme.textColorPrimary} w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label 
              htmlFor="serverUrl" 
              className="block text-sm font-medium mb-2"
            >
              Server URL *
            </label>
            <input
              id="serverUrl"
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="e.g., http://localhost:3000"
              required
              className={`${theme.backgroundColor} ${theme.textColorPrimary} w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label 
              htmlFor="serverDescription" 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textColorPrimary }}
            >
              Description (Optional)
            </label>
            <textarea
              id="serverDescription"
              value={serverDescription}
              onChange={(e) => setServerDescription(e.target.value)}
              placeholder="Brief description of what this server provides..."
              rows={3}
              className={`${theme.backgroundColor} ${theme.textColorPrimary} w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: theme.textColorPrimary }}>
              Transport Protocol *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="transport"
                  value="streamable_http"
                  checked={selectedTransport === "streamable_http"}
                  onChange={(e) => setSelectedTransport(e.target.value as "sse" | "streamable_http")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span style={{ color: theme.textColorPrimary }} className="text-sm font-medium">
                    Streamable HTTP
                  </span>
                  <p style={{ color: theme.textColorSecondary }} className="text-xs">
                    Standard HTTP requests with streaming support (Recommended)
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="transport"
                  value="sse"
                  checked={selectedTransport === "sse"}
                  onChange={(e) => setSelectedTransport(e.target.value as "sse" | "streamable_http")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span style={{ color: theme.textColorPrimary }} className="text-sm font-medium">
                    SSE (Server-Sent Events)
                  </span>
                  <p style={{ color: theme.textColorSecondary }} className="text-xs">
                    Real-time streaming using Server-Sent Events
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: theme.textColorPrimary }}>
              Authentication Provider *
            </label>
            <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="authProvider"
                  value="none"
                  checked={authProvider === "none"}
                  onChange={(e) => setAuthProvider(e.target.value as "none" | "oauth" | "apiKeyInURL")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span style={{ color: theme.textColorPrimary }} className="text-sm font-medium">
                    None
                  </span>
                  <p style={{ color: theme.textColorSecondary }} className="text-xs">
                    No authentication required (public server)
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="authProvider"
                  value="oauth"
                  checked={authProvider === "oauth"}
                  onChange={(e) => setAuthProvider(e.target.value as "none" | "oauth" | "apiKeyInURL")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span style={{ color: theme.textColorPrimary }} className="text-sm font-medium">
                    OAuth2.0 Dynamic Client Registration
                  </span>
                  <p style={{ color: theme.textColorSecondary }} className="text-xs">
                    OAuth 2.0 with dynamic client registration for secure authentication
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="authProvider"
                  value="apiKeyInURL"
                  checked={authProvider === "apiKeyInURL"}
                  onChange={(e) => setAuthProvider(e.target.value as "none" | "oauth" | "apiKeyInURL")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span style={{ color: theme.textColorPrimary }} className="text-sm font-medium">
                    API Key
                  </span>
                  <p style={{ color: theme.textColorSecondary }} className="text-xs">
                    Simple authentication using an API key
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-md transition-all hover:opacity-80"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={onSubmit}
              disabled={!serverName.trim() || !serverUrl.trim()}
              className="flex-1 px-4 py-2 rounded-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Server
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
