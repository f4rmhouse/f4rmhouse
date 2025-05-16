import Header from "@/app/components/text/Header";
import OrderedList from "@/app/components/text/OrderedList";
import Paragraph from "@/app/components/text/Paragraph";
import UnorderedList from "@/app/components/text/UnoroderdList";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default function Article() {

    return (
        <div className="pt-18 grid grid-cols-12">
          <div className="p-10 lg:p-0 col-span-12 lg:col-start-5 lg:col-span-5 lg:pt-10">
            <Link href="/" className="bg-red-500 m-2 bg-red-500"><FaArrowLeft size={30} className="transition-all hover:bg-zinc-600 bg-zinc-700 p-2 rounded-full" /></Link>
            <p className="text-4xl font-white font-bold">a proposition for an agentic web</p>
            <hr className="border-neutral-600 mt-8" />
            <Paragraph>
            <p className="italic text-purple text-xl text-white">"The web will have to evolve for a world where humans aren’t the primary foot traffic. A lot of design choices made for humans (like CAPTCHAs) just slow down these tools [OpenAI operators], adding friction to what could be a smoother operator experience."</p> 
            </Paragraph>
            <p className="text-lg text-zinc-300 mt-2">- anonymous redditor</p>
            <Paragraph>
              <span className="text-white font-bold">AI agents that can</span> accomplish all tasks that humans can on computers would allow trillions of dollars to be automated. Currently numerous regulatory and technological barriers stifle this innovation. We propose a new agentic framework built upon an "agentic web" that will allow generalist agents to automate most human digital work.
            </Paragraph>
            <br />
            <Header>why?</Header>
            <Paragraph>LLMs are used today by users mostly as an easy way to get information. While LLMs work well for this task LLMs are capable of much more. Products like OpenAI operators and Anthropics "Computer use" feature the ability to create plans and use tools to complete tasks using a computer or a browser. By doing this, reasoning agents can impact all productive work done with computers by humans.</Paragraph>
            <Paragraph>Current approaches to AI-driven automation come with significant inefficiencies and security concerns. General GUI-based agents rely on human-oriented interfaces, requiring them to interpret websites through screenshots (processed by vision-language models) or parse raw HTML. This workaround introduces latency, compliance risks, and usability trade-offs that are difficult to address without fundamentally rethinking how AI interacts with digital environments. Just try to make an OpenAI operator use a website with date pickers; easy for humans to understand and use, but extremely tedious for operators [1]. Indeed the most common criticism of operators is that they're fun but <span className="text-white font-bold">too slow, expensive, and error-prone</span>. [2], [3], [4]</Paragraph>
            <Paragraph>We have a strong conviction that there is no way around these limitations with the methods being developed today. To fully unlock the potential of LLMs, we propose a dedicated AI-native internet—a truly <span className="text-white font-bold">agentic web</span>.</Paragraph>
            <Header>how?</Header>
            <Paragraph>All necessary hardware is already in place. What needs to be updated is our software. We propose new application paradigm. Instead of developing applications for humans, developers will create **AI-first actions** tailored for LLM-driven automation.</Paragraph>
            <OrderedList>
                <li><span className="text-white font-bold">Action-Oriented Development:</span> Developers deploy actions—modular, AI-invokable functions—on a public platform akin to npm (for JavaScript) or pip (for Python). These actions serve as the fundamental building blocks for AI automation.</li>
                <li><span className="text-white font-bold">Agent Construction:</span> Users compose custom AI agents by defining their capabilities through an action space. An agent consists of an LLM paired with an action library, enabling it to execute complex tasks autonomously.</li>
                <li><span className="text-white font-bold">Task Execution:</span> Instead of interacting with human-designed interfaces, the LLM directly invokes structured actions, much like a human using apps on a computer or phone. This streamlined interaction reduces inefficiencies, improves security, and enhances reliability.</li>
            </OrderedList>
            <Header>but...</Header>
            <Paragraph>Several challenges exist to this approach. Here is a list and an outline of how we combat them: </Paragraph>
            <OrderedList>
                <li><span className="text-white font-bold">Initially extremely limited:</span> OpenAI tried this approach before and found that, while it works well, it provides an extremely limited set of applications (leading to limited usability). Rather than creating the applications OpenAI chose to instead let the agent act like a human. We accept that this is the case, but that it does not always have to be the case. Decentralizing the creation of these actions and creating the right incentives we can create a future will this approach works better than the GUI approach.</li>
                <li>
                    <span className="text-white font-bold">Security:</span> novel threat vectors that need to be discussed:
                    <OrderedList>
                        <li>
                            <span className="text-white font-bold">Privacy</span>: developers can create malicious actions that could steal users confidential data. To combat this we will copy methods that have been proven to work in the past. Centralized distributers (e.g. Apple app store, Steam or Amazon) that maintain a strict TOS. Privacy and safety is ensured through a combination of automated checks, manual reviews and policy enforcements.
                        </li>
                        <li className=""><span className="font-bold text-white">Authentication</span>: When an operator wants to get into a website that needs authentication a user needs to manually login using their credentials. An agentic web could lead to far smoother auth experience because the user can login only once (to use the agent) and the agent would then use these credentials wherever it needs to.</li>
                        <li>
                            <span className="font-bold text-white">Malicous code execution:</span> In addition to the privacy concerns there will also, no doubt, exist black hats that will seek to exploit actions for their own benefits by deploying malicious actions that makes the agent do things that they're not supposed to. This could range to excessive use of paid services to generated content designed to harm users.
                            <UnorderedList>
                                <li>All actions are executed in isolated environments and receive context only through prompts.</li>
                                <li>Paid features are initially non-existent and will be limited when they are introduced. By limited we mean that users can set a maximum spend which cannot be breached.</li>
                                <li>These are of course non-exhaustive. Continous work would have to be made to find and respond to all new and old threats that are created.</li>
                            </UnorderedList>
                        </li>
                    </OrderedList>
                </li>
                <li><span className="text-white font-bold">Increased complexity:</span> Developing a parallel internet just for agents will initially seem like a stretch. However, the popularity of agents and the increasing tensions between humans and AI online (most notably recorded on basically all social media sites) make this an increasing necessity.</li>
            </OrderedList>
            <p className="mt-4 text-lg text-zinc-300">We have proposed the agentic web, a internet for agents. Many challenges face us, but if implemented correctly it could result in massive growth for any company or individual that uses it.</p>
            <hr className="border-neutral-600 mt-6" />
            <p className="mt-10 text-xl text-center text-white">Where?</p>
            <div className="w-[50%] mt-6 m-auto flex">
              <Link href={"/"} className="m-auto text-center transition-all rounded-md m-auto p-2 text-blue-500 pr-8 pl-8 hover:bg-neutral-400 hover:text-blue-100 flex bg-neutral-200 rounded-full">here</Link>
            </div>
            <hr className="border-neutral-600 mt-8 mb-8" />
            <p className="mt-8 text-2xl text-white font-bold">sources</p>
            <p>[1] {"https://www.reddit.com/r/ChatGPTCoding/comments/1i8jl52/i_am_among_the_first_people_to_gain_access_to/"}</p>
            <p>[2] https://www.integralreview.com/trying-openai-operator</p>
            <p>[3] https://www.reddit.com/r/ChatGPTPro/comments/1i96h99/what_is_your_experience_with_operator_by_openai/</p>
            <p>[4] https://www.techradar.com/computing/artificial-intelligence/i-used-the-openai-operator-rival-browser-use-and-its-impressive-but-takes-some-technical-skill-to-use</p>
            <hr className="border-neutral-600 mb-8" />
          </div>
        </div>
    );
  }
  