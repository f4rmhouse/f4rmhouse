// Model type definition
interface Model {
  id: string;
  name: string;
  provider: string;
}

// Provider configuration
interface ProviderConfig {
  [provider: string]: Model[];
}

export interface Theme {
    primaryColor: string;
    secondaryColor: string; 
    accentColor: string;
    hoverColor: string;
    backgroundColor: string;
    backgroundImage?: string;
    primaryHoverColor: string;
    secondaryHoverColor:string;
    textColorPrimary: string;
    textColorSecondary: string;
    chatWindowStyle?: string;
    aiMessageStyle?: string;

}

// Full configuration interface
interface Config {
    name: string;
    version: string;
    welcomeText: string[];
    loadingMessages: string[];
    models: ProviderConfig;
    theme: Theme;
    defaultState: "canvas" | "chat";
    allowLayoutSwitching: boolean;
}

const config: Config = {
    "name": "f4rmhouse",
    "version": "1.1.3-beta",
    "welcomeText": ["{{username}} returns!" ,"> anon joins the chat!", "ASIC speed. OMGGGGGGG", "Try out the open source models. They're super fast!", "Ask me about roko's basilisk.", "Security is always 1st but spongebob dancing is a close 2nd", "Have you said thank you once??"],
    "loadingMessages": ["Generating slop...", "Analyzing Memes...", "Pretending to Like Matcha...", "Taking a coffee break...", "Summoning the Council of Elrond...", "Asking the Jedi Council...", "Generating slop..."],
    "models": {
        "openai": [
            { "id": "gpt-4o-mini", "name": "GPT-4o", "provider": "openai"},
        ],
        "anthropic": [
            { "id": "claude-sonnet-4-20250514", "name": "Claude 4 Sonnet", "provider": "anthropic"},
            { "id": "claude-3-7-sonnet-20250219", "name": "Claude 3.5 Sonnet", "provider": "anthropic"},
            { "id": "claude-3-5-haiku-20241022", "name": "Claude 3.7 Haiku", "provider": "anthropic"},
        ],
        "groq": [
            {"id": "meta-llama/llama-4-maverick-17b-128e-instruct", "name": "Llama 4 Maverick", "provider": "groq"},
            {"id": "qwen/qwen3-32b", "name": "Qwen 3.2 32B", "provider": "groq"},
            {"id": "deepseek-r1-distill-llama-70b", "name": "DeepSeek R1 70B", "provider": "groq"},
            {"id": "llama3-70b-8192", "name": "Llama 3.7 70B 8192", "provider": "groq"}
        ],
        "google": [
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "google"}
        ],
        "local": [
            { "id": "llama3.2 ", "name": "Llama 3.2", "provider": "local"},
        ]
        /**
         * To add new providers just add them to this array using the following schema:
         * "<provider>": [{"id": "<model_id>", "name": "<model_name>"}, ...]
         * then add an API key in .env.local and you should be able to use the model 
         * by selecting it in the prompt box.
         */
    },
    "theme": {
        "primaryColor": "bg-zinc-950 shadow-sm",
        "secondaryColor": "bg-zinc-800",
        "accentColor": "bg-violet-600 shadow-sm",
        "hoverColor": "bg-violet-500",
        "backgroundColor": "bg-zinc-900",
        "backgroundImage": "",
        "primaryHoverColor": "bg-zinc-800",
        "secondaryHoverColor": "bg-zinc-800",
        "textColorPrimary": "text-zinc-50",
        "textColorSecondary": "text-zinc-400",
        "chatWindowStyle": "bg-zinc-900"

    }, 
    "defaultState": "chat",
    "allowLayoutSwitching": true
}

export default config;