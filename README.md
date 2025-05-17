# 🏡 f4rmhouse

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/f4rmhouse/f4rmhouse)
[![Commits/Month](https://img.shields.io/github/commit-activity/m/f4rmhouse/f4rmhouse)](https://github.com/f4rmhouse/f4rmhouse/commits/main)
[![Issues Closed](https://img.shields.io/github/issues-closed/f4rmhouse/f4rmhouse)](https://github.com/f4rmhouse/f4rmhouse/issues?q=is%3Aissue+is%3Aclosed)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/f4rmhouse/f4rmhouse/pulls)
## What is f4rmhouse?

F4rmhouse is an all-in-one, open source platform for building useful agents. It provides every tool you need to create a modern agent with all its bells and MCP whistles. 

Feature list:
[x] [local/custom deployments](https://f4rmhouse.com): many teams want or need full control over their data and infrastructure. Self-hosting avoids vendor lock-in, ensures data never leaves your environment, and simplifies compliance with HIPAA, GDPR, SOC 2, etc.
[x] [shareable agents](https://f4rmhouse.com): We are the leaders of the Create Once Run Anywhere (CORA) movement in tech, we don't want agents to live in a single application but rather integrate into the apps you already use.
[x] [MCP plug-and-play](https://f4rmhouse.com): Users often complain about the complexity associated with attaching MCPs to a chat. f4rmhouse makes this a breeze, using the "action store" you can add MCPs to your chat with one single click. 
[x] [Model selection](https://f4rmhouse.com): different models have different capabilities. The model selector lets you choose the model you want to use to accomplish a specific task, use a public model through an API key or use a local one with ollama.
[x] [Extensible artifacts](https://f4rmhouse.com): LLMs are mostly used to generate text. But give them the right tools and they can generate far more than that, artifacts allow your agents to render web pages, csv files, 3D scenes and much more. You can add artifacts that suit your specific needs.
[] [Agent swarms](https://f4rmhouse.com): (coming soon)
[x] [Deep customizability](https://f4rmhouse.com): people spend more and more time in front of AI chat windows. f4rmhouse gives you the customizability you wish you had on other platforms. You change every aspect of the design using the f4.config file, f4rmhouse also support custom keyboard bindings so that you can work much faster.

This is all mostly free to use on our official [website](https://f4rmhouse.com) which has a very generous free tier. If you're not interested in that you can install a f4rmhouse client on your local system. 

## Getting Started

### Using Docker

```
docker build -t f4rmhouse .
docker run -p 3000:3000 f4rmhouse
```

### Using npm

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Adding secrets

Copy this into your `.env.local` file

```
AUTH_SECRET="" # Added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_GOOGLE_ID="" # if you want Google OAuth
AUTH_GOOGLE_SECRET="" # if you want Google OAuth
AUTH_GITHUB_ID="" # if you want GitHub OAuth
AUTH_GITHUB_SECRET="" # if you want Github OAuth
  
SECRET_KEY= 
AWS_ACCESS_KEY_ID= # (optional) If you want to use AWS 
AWS_SECRET_ACCESS_KEY= # (optional) If you want to use AQS
OPENAI_SECRET= 
ANTHROPIC_SECRET=""
WHATSAPP_ACCESS_TOKEN=''
SESSION_AUTH_TOKEN=""
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Now you should see a chat window on your screen.

## Contributing

We <3 your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug or submitting a fix
- Discussing the current state of the code
- Proposing new features
- Becoming a maintainer

### Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests. If you want to dicuss the project more generally or meet other community members you can join our Dicsord! 

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Issues

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

## License

This repo is available under the MIT expat license, except for the ee directory if applicable.

## Stay Connected

    🏡 Built with love for agents, by humans.
