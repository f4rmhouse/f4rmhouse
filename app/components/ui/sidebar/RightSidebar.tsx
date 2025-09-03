/**
 * SideBar is shown on the dashboard for logged in users. It let's users navigate the 
 * f4rmhouse playground.
 */

"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BadgeCheck, BrainCircuit, HardDrive, Share, Store as StoreIcon} from "lucide-react";
import { PanelLeftClose } from 'lucide-react';
import { useTheme } from "../../../context/ThemeContext";
import { useOnboarding } from "../../../context/OnboardingContext";
import { useAgent } from "../../../context/AgentContext";
import AddLocalServerModal from "../modal/AddLocalServerModal";
import { useKeyboardShortcuts } from '@/app/utils/keyboardShortcuts';
import RightSidebarItem from './RightSidebarItem';
import { toast } from 'sonner';


export default function RightSidebar() {
  let baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.f4rmhouse.com'
  const { theme } = useTheme()
  const { selectedAgent, trustedServers, setTrustedServers } = useAgent();

  // Track trusted servers
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [visible, setVisible] = useState<boolean>(false)

  const { registerShortcuts, cleanup } = useKeyboardShortcuts({
    TOGGLE_RIGHT_SIDEBAR: {
      key: 'm',
      metaKey: true,
      preventDefault: true,
      callback: () => setVisible(prev => !prev),
    },
  });

  // Register keyboard shortcuts
  useEffect(() => {
    registerShortcuts();
    return cleanup;
  }, []);

  const copyLinkToClipboard = () => {
    const shareLink = `${baseURL}/share/${selectedAgent?.creator}/${selectedAgent?.uid}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success("Link copied to clipboard")
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });  
  }

  return (
    <div className="hidden sm:block">
      <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} className={`p-2 fixed right-0 w-[50%] sm:w-[25%] mt-9 h-[92vh] z-10 top-0 border-${theme.secondaryColor?.replace("bg-", "")} ${theme.chatWindowStyle} transition-transform duration-300 ease-in-out rounded-md transform p-3 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='h-[95%] flex flex-col'>
          <p className={`pl-2 pb-2 flex text-base flex mb-2 ${theme.textColorPrimary}`}><span className='my-auto'>{selectedAgent?.title}</span></p>
          <p className={`pl-2 text-base flex mb-2 ${theme.textColorPrimary} w-[100%]`}>MCP Servers</p>
          {selectedAgent?.toolbox ?
            <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
              {selectedAgent.toolbox.map((tool, index) => (
                <RightSidebarItem 
                  key={index}
                  id={index} 
                  tool={tool} 
                  trustedServers={trustedServers} 
                  setTrustedServers={setTrustedServers}
                />
              ))}
            </div>
          :
            <p>No tools have been added yet</p>
          }
          <div className='flex gap-2 w-full pt-2'>
            <Link href="/store" className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}><StoreIcon size={20}/><BadgeCheck className='ml-[-20px] rounded-full bg-blue-500 text-white' size={12}/> Browse verified servers</Link>
          </div>
          <div className=''>
            <button 
              onClick={() => setShowAddServerModal(true)}
              className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}
            >
              <HardDrive size={20}/> Add custom server
            </button>
          </div>
          <div className=''>
            <button 
              onClick={() => {copyLinkToClipboard()}}
              className={`hover:${theme.textColorPrimary} p-2 rounded-md transition-all hover:${theme.hoverColor} cursor-pointer flex ${theme.textColorSecondary} w-full text-base gap-3 my-auto`}
            >
              <Share size={20}/> Share 
            </button>
          </div>
        </div>
      </div>
      <div onMouseEnter={() => {
        setVisible(true); 
      }} className="bg-transparent absolute sm:fixed top-16 right-0 w-[50px] h-[10vh] sm:h-[100vh] z-0">
        <button onClick={() => setVisible(p => !p)} className={`z-10 ml-4 ${theme.textColorPrimary ? theme.textColorPrimary : "text-white" }`}><PanelLeftClose /></button>
      </div>
      <AddLocalServerModal 
        open={showAddServerModal}
        onClose={() => setShowAddServerModal(false)}
      />
    </div>
  )
}
