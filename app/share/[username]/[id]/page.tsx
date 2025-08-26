import Boxes from "@/app/components/ui/chat-window/Boxes";
import HelpModal from "@/app/components/ui/HelpModal";
import ThemeToggleButton from "@/app/components/ui/ThemeToggleButton";
import getSession from "@/app/context/getSession";
import Store from "@/app/microstore/Store";
import config from "../../../../f4.config";
import { Github } from "lucide-react";
import RightSidebar from "@/app/components/ui/sidebar/RightSidebar";

interface SharePageProps {
  params: Promise<{
    username: string;
    id: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { username: rawUsername, id: rawId } = await params;
  
  // Decode URL-encoded strings
  const username = decodeURIComponent(rawUsername);
  const id = decodeURIComponent(rawId);

  const session = await getSession()
  let store = new Store()
  let f4rmers = []
  let f4rmer = await store.getF4rmer(username, id)
  console.log(id)
  console.log(f4rmer)
  f4rmers = [f4rmer]

  return (
    <div className="">
      <div className="">
        <Boxes f4rmers={f4rmers} session={session}/>
        <RightSidebar />
      </div>
      <div className="absolute hidden sm:flex bottom-0 flex right-24">
          <a 
            href="https://github.com/f4rmhouse/f4rmhouse" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-neutral-500 flex hover:text-white px-1 underline text-xs"
          >
            <Github className="w-4 h-4" />
            GitHub 
          </a>
          <ThemeToggleButton />
          <HelpModal />
          <p className="text-neutral-500 text-xs">v{config.version}</p>
        </div>
    </div>
  );
}