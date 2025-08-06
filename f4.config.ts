// Model type definition
interface Model {
  id: string;
  name: string;
  provider: string;
  logo: string;
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
        "groq": [
            {"id": "moonshotai/kimi-k2-instruct", "name": "Kimi K2", "provider": "groq", "logo": "https://media.licdn.com/dms/image/v2/D560BAQHwFiXHVZqcpA/company-logo_200_200/company-logo_200_200/0/1704352802668?e=2147483647&v=beta&t=pe9LRKD3jwxHyazkswfWDa9KWIyBTg2wbOYMnDwQ-nI"},
            {"id": "meta-llama/llama-4-maverick-17b-128e-instruct", "name": "Llama 4 Maverick", "provider": "groq", "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFM23hF3C0Gcai4Vk6TZHh5dsGwLpvpK28bA&s"},
            {"id": "qwen/qwen3-32b", "name": "Qwen 3.2 32B", "provider": "groq", "logo": "https://brandlogos.net/wp-content/uploads/2025/06/qwen_icon-logo_brandlogos.net_gb71b-512x512.png"},
            {"id": "qwen-qwq-32b", "name": "Qwen QwQ 32B", "provider": "groq", "logo": "https://brandlogos.net/wp-content/uploads/2025/06/qwen_icon-logo_brandlogos.net_gb71b-512x512.png"},
        ],
        "openai": [
            { "id": "gpt-4o-mini", "name": "GPT-4o", "provider": "openai", "logo": "https://d-cb.jc-cdn.com/sites/crackberry.com/files/styles/large/public/article_images/2023/08/openai-logo.jpg"},
            { "id": "openai/gpt-oss-120b", "name": "GPT-OSS", "provider": "groq", "logo": "https://d-cb.jc-cdn.com/sites/crackberry.com/files/styles/large/public/article_images/2023/08/openai-logo.jpg"},
        ],
        "anthropic": [
            { "id": "claude-sonnet-4-20250514", "name": "Claude 4 Sonnet", "provider": "anthropic", "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s"},
            { "id": "claude-3-7-sonnet-20250219", "name": "Claude 3.7 Sonnet", "provider": "anthropic", "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s"},
        ],
        "google": [
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "google", "logo": "https://brandlogos.net/wp-content/uploads/2025/03/gemini_icon-logo_brandlogos.net_bqzeu-300x300.png"}
        ],
        "local": [
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