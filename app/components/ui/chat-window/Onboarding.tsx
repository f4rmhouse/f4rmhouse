import { useTheme } from "@/app/context/ThemeContext";
import { BrainCircuit, Circle, CircleCheckBig, Paperclip, Sticker, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../modal/Modal";
import ThemeModal from "../modal/ThemeModal";
import { toast } from "sonner";
import { useOnboarding } from "@/app/context/OnboardingContext";
import CreateProfileForm from "../../forms/CreateProfileForm";

function OnboardingButton({
  icon, 
  text, 
  action
}: {
  icon: string, 
  text: string, 
  action: () => void
}) {
  const { theme } = useTheme();

  const [isFinished, setIsFinished] = useState<boolean>(false)

  const clicked = () => {
    setIsFinished(true)
    action()
  }

  return(
    <button onClick={clicked} className={`flex text-sm transition-all p-2 rounded text-left hover:${theme.hoverColor} my-auto`}>
      <img className="w-7 rounded-full" src={icon}/>
      <span className="my-auto ml-2">{text}</span>
      {isFinished ? 
      <CircleCheckBig size={20} className={`my-auto ml-auto text-green-600 ${theme.textColorSecondary}`} />
      : 
      <Circle size={20} className={`my-auto ml-auto ${theme.textColorSecondary}`} />
      }
    </button>
  )
}

function MCPProfileModal({open}: Readonly<{open: boolean}>) {
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    setShowProfileModal(open)
  }, [open])

  return(
    <div>
    <Modal 
        open={showProfileModal} 
        title="" 
        onClose={() => setShowProfileModal(false)}
      >
        <div className="m-10">
          <img className="w-1/2 m-auto" src="https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/cyberpunk_character_transparent_bg.png"/>
          <h2 className={`text-center text-2xl mb-4 ${theme.textColorPrimary}`}>
            The MCP profile
          </h2>
          <p className="text-center">An LLM connected to a set of MCP servers and a system prompt.</p>
          <div className="mt-10">
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <WandSparkles size={18} className="text-green-600 fill-current"/>
              <span className="my-auto ml-2">Make it personal</span>
            </div>
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <BrainCircuit size={18} className="text-purple-600 fill-current"/>
              <span className="my-auto ml-2">Choose your own tools</span>
            </div>
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <Sticker size={18} className="text-yellow-500"/>
              <span className="my-auto ml-2">Create and share artifacts with your team</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setShowProfileModal(false)}
              className={`w-1/2 px-4 py-2 rounded ${theme.textColorSecondary} hover:${theme.hoverColor} transition-all`}
            >
              Not now
            </button>
            <button 
              onClick={() => {
                // Handle profile creation logic here
                setShowProfileModal(false);
                setShowCreateProfileModal(true)
              }}
              className={`w-1/2 px-4 py-2 rounded ${theme.accentColor} text-white hover:opacity-90 transition-all`}
            >
              Create a new Profile 
            </button>
          </div>
        </div>
      </Modal>
      <Modal open={showCreateProfileModal} title="Create New Profile" onClose={() => setShowCreateProfileModal(false)}>
        <CreateProfileForm />
      </Modal>
      </div>
    )
}

function BrowseStoreModal({open}: Readonly<{open: boolean}>) {
  const { theme } = useTheme();
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setShowModal(open)
  }, [open])
  return(
    <Modal 
        open={showModal} 
        title="" 
        onClose={() => setShowModal(false)}
      >
        <div className="m-10">
          <img className="w-1/2 m-auto" src="https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/computer_transparent_bg.png"/>
          <h2 className={`text-center text-2xl mb-4 ${theme.textColorPrimary}`}>
            Introducing the Action Store 
          </h2>
          <p className="text-center">Search, browse, review any remote MCP server available on the web.</p>
          <div className="mt-10">
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <WandSparkles size={18} className="text-green-600 fill-current"/>
              <span className="my-auto ml-2">Customize you profiles to make them personal</span>
            </div>
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <BrainCircuit size={18} className="text-purple-600 fill-current"/>
              <span className="my-auto ml-2">Automate repetitive tasks</span>
            </div>
            <div className={`p-5 flex text-sm transition-all p-2 rounded text-left my-auto`}>
              <Sticker size={18} className="text-yellow-500"/>
              <span className="my-auto ml-2">Share your creations with your friends or your team</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setShowModal(false)}
              className={`w-1/2 px-4 py-2 rounded ${theme.textColorSecondary} hover:${theme.hoverColor} transition-all`}
            >
              Not now
            </button>
            <button 
              onClick={() => {
                setShowModal(false);
                window.open('/store', '_blank');
              }}
              className={`w-1/2 px-4 py-2 rounded ${theme.accentColor} text-white hover:opacity-90 transition-all`}
            >
              Check it out
            </button>
          </div>
        </div>
      </Modal>)
}

function ShareProfileModal({open}: Readonly<{open: boolean}>) {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState<boolean>(false);

  let baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.f4rmhouse.com'

  useEffect(() => {
    setShowModal(open)
  }, [open])

  const copyLinkToClipboard = () => {
    const shareLink = `${baseURL}/share/default/123`;
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success("Link copied to clipboard")
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });  
  }

  return(
    <Modal 
        open={showModal} 
        title="" 
        onClose={() => setShowModal(false)}
      >
        <div className="m-10">
          <img className="w-1/2 m-auto" src="https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/paper_plane_blue_transparent_bg.png"/>
          <h2 className={`text-center text-2xl mb-4 ${theme.textColorPrimary}`}>
            Share your profiles!
          </h2>
          <p className="text-center">Profiles can be really useful, make sure to share them with the people around you.</p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setShowModal(false)}
              className={`w-1/2 px-4 py-2 rounded ${theme.textColorSecondary} hover:${theme.hoverColor} transition-all`}
            >
              Not now
            </button>
            <button 
              onClick={() => {
                // Handle profile creation logic here
                copyLinkToClipboard()
              }}
              className={`w-1/2 px-4 py-2 rounded ${theme.accentColor} text-white hover:opacity-90 transition-all`}
            >
              Copy link
            </button>
          </div>
        </div>
      </Modal>
    )
}

export default function Onboarding(
  {setOnboardingDone}: 
  Readonly<{setOnboardingDone: () => void}>
) {

  const { theme } = useTheme();
  const { completeStep, skipOnboarding, isStepCompleted, currentStep } = useOnboarding();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showStoreModal, setShowStoreModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState<boolean>(false);

  const [done, setDone] = useState<boolean>(false)

  useEffect(() => {
    if(showShareModal && showProfileModal && showThemeModal && showStoreModal) {
      finishOnboarding()
    }
  }, [showShareModal, showProfileModal, showThemeModal, showStoreModal])

  const finishOnboarding = () => {
    completeStep(currentStep)
    setDone(true)
  }

  const profileAction = () => {
    setShowProfileModal(true);
    completeStep(currentStep)
  }

  return (
    <>
    {currentStep < 5 && !isStepCompleted(5) ?
      <>
        <div className="text-center w-[75%] m-auto">
          <h1 className={`text-base m-auto sm:text-4xl mb-5 ${theme.textColorPrimary}`}>Welcome to f4rmhouse!</h1>
          <p className={`${theme.textColorPrimary} mb-5`}>This is your brand new, shiny AI buzzword app. Here are some steps that will help you get started.</p>
          <div className={`flex gap-2 flex-col mb-5 ${theme.textColorPrimary}`}>
            <OnboardingButton icon={"https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/cyberpunk_character_transparent_bg.png"} text="Create an MCP profile" action={() => {profileAction()}} />
            <OnboardingButton icon={"https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/paint_brush_transparent_bg.png"} text="Customize your workspace" action={() => {setShowThemeModal(true);completeStep(currentStep)}} />
            <OnboardingButton icon={"https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/computer_transparent_bg.png"} text="Add your first MCP server" action={() => {setShowStoreModal(true);completeStep(currentStep)}} />
            <OnboardingButton icon={"https://f4-public.s3.eu-central-1.amazonaws.com/public/assets/paper_plane_blue_transparent_bg.png"} text="Share your MCP profile" action={() => {setShowShareModal(true);completeStep(currentStep)}} />
          </div>
          <button className={`text-xs text-center ${theme.textColorPrimary} mb-5`} onClick={() => {skipOnboarding();setDone(true)}}>Skip this</button>
        </div>
      </>
      :
      <>
      </>
    }
    <MCPProfileModal open={showProfileModal}/>
    <ThemeModal open={showThemeModal} setIsOpen={setShowThemeModal}/>
    <BrowseStoreModal open={showStoreModal}/>
    <ShareProfileModal open={showShareModal}/>
    <Modal open={showCreateProfileModal} title="Create New Profile" onClose={() => setShowCreateProfileModal(false)}>
      <CreateProfileForm />
    </Modal>
    </>
  )
}