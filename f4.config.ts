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
    welcomeText: string;
    models: ProviderConfig;
    theme: Theme;
    defaultState: "canvas" | "chat";
    allowLayoutSwitching: boolean;
}

const config: Config = {
    "name": "f4rmhouse",
    "version": "1.1.2-beta",
    "welcomeText": "{{username}} returns!",
    "models": {
        "openai": [
            { "id": "gpt-4o-mini", "name": "GPT-4o", "provider": "openai"},
        ],
        "anthropic": [
            { "id": "claude-sonnet-4-20250514", "name": "Claude 4 Sonnet", "provider": "anthropic"},
            { "id": "claude-3-7-sonnet-20250219", "name": "Claude 3.5 Sonnet", "provider": "anthropic"},
            { "id": "claude-3-5-haiku-20241022", "name": "Claude 3.7 Haiku", "provider": "anthropic"},
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