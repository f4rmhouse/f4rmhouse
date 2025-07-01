import ChatMessageType from '../../../types/ChatMessageType';
import F4rmerType from '../../../types/F4rmerType';
import F4Session from '../../../types/F4Session';
import User from '@/app/microstore/User';
import { PostDataType } from './types';
import { ToolPermission } from '../../../types/ToolPermissionType';
import ChatSession from './ChatSession';

export class MessageHandlers {
  constructor(
    private chatSession: ChatSession,
    private selectedAgent: F4rmerType | null,
    private selectedModel: any,
    private session: F4Session,
    private client: any,
    private processStream: (id: number, stream: ReadableStreamDefaultReader<Uint8Array>, MSStart: number) => Promise<void>,
    private setLoading: (loading: boolean) => void,
    private updateLatestMessage: () => void,
    private setChatSession: (session: ChatSession) => void,
    private setCurrentSession: (messages: ChatMessageType[]) => void,
    private setSelectedAgent: (agent: F4rmerType) => void,
    private setState: (state: "canvas" | "chat" | "preview" | "edit") => void
  ) {}

  authenticateMessage = async (m: ChatMessageType) => {
    const tools = await this.client.preparePrompt();

    if (this.selectedModel == null) {
      alert("Please select a model to use.");
      return;
    }
    if (this.selectedAgent == null || this.selectedAgent.title == "") {
      alert("Please select an agent to use.");
      return;
    }

    const MSStart = new Date().getTime();
    this.setLoading(true);
    let permission: ToolPermission[] = [];
    if (this.chatSession.getDebug(m.id) != undefined) {
      const p = this.chatSession.getDebug(m.id) as ToolPermission;
      permission = [p];
    }

    const postData: PostDataType = {
      messages: this.chatSession.getNextJSMessages(),
      description: this.selectedAgent.jobDescription,
      show_intermediate_steps: false,
      session: this.session,
      f4rmer: this.selectedAgent.title,
      model: this.selectedModel,
      tools: tools,
      allowList: permission
    };

    // Send message
    const stream = await this.chatSession.send(postData);
    if (!stream) {
      alert("There was a server error while sending your request. This is completely our fault, we will do better in the future.");
      return;
    }

    await this.processStream(this.chatSession.getMessages().length, stream, MSStart);

    const updatedSession = this.chatSession.updateStatus(m.id, "completed");
    this.updateLatestMessage();
    this.setChatSession(updatedSession);
    this.setCurrentSession(updatedSession.getMessages());
  };

  updateF4rmer = async (updatedF4rmer: F4rmerType) => {
    const user = new User(this.session.user.email, this.session.provider, this.session.access_token);
    try {
      await user.updateF4rmer(updatedF4rmer);
      this.setSelectedAgent(updatedF4rmer);
      alert("Your f4rmer was updated successfully!");
      this.setState("chat");
    } catch (e) {
      console.log("Failed to update f4rmer:", e);
      alert("Failed to update f4rmer. Make sure you're logged in to update f4rmers!");
    }
  };

  cancelMessage = (m: ChatMessageType) => {
    const updatedSession = this.chatSession.updateStatus(m.id, "cancelled");
    this.updateLatestMessage();
    this.setChatSession(updatedSession);
    this.setCurrentSession(updatedSession.getMessages());
  };
}
