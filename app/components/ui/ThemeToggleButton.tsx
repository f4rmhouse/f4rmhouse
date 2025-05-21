'use client'

import { Palette } from "lucide-react"
import { useTheme } from "@/app/context/ThemeContext"
import { useState } from "react"
import Modal from "./modal/Modal"
import { Theme } from "@/f4.config"

// Define theme presets
const themePresets: Record<string, Theme> = {
  midnight: {
    primaryColor: "bg-zinc-950 shadow-sm",
    secondaryColor: "bg-zinc-800",
    accentColor: "bg-violet-600 shadow-sm",
    hoverColor: "bg-violet-500",
    backgroundColor: "bg-zinc-900",
    backgroundImage: "",
    primaryHoverColor: "bg-zinc-800",
    secondaryHoverColor: "bg-zinc-800",
    textColorPrimary: "text-zinc-50",
    textColorSecondary: "text-zinc-400",
    chatWindowStyle: "bg-zinc-900"
  },
  nostalgic: {
    primaryColor: "bg-[#cbcbcb]",
    secondaryColor: "bg-[#cbcbcb]",
    accentColor: "bg-blue-700 shadow-sm",
    hoverColor: "bg-blue-600",
    backgroundColor: "bg-[#cbcbcb]",
    backgroundImage: "",
    primaryHoverColor: "bg-neutral-400 transition-none",
    secondaryHoverColor: "bg-neutral-400 transition-none",
    textColorPrimary: "text-black",
    textColorSecondary: "text-neutral-900",
    chatWindowStyle: "bg-white shadow-[inset_1px_1px_1px_4px_rgba(0,_0,_0,_0.3)] font-w95fa"
  },
  sleek: {
    "primaryColor": "bg-gray-50 shadow-sm",
    "secondaryColor": "bg-gray-100",
    "accentColor": "bg-blue-500 shadow-sm",
    "hoverColor": "bg-blue-400",
    "backgroundColor": "bg-white",
    "backgroundImage": "",
    "primaryHoverColor": "bg-gray-100",
    "secondaryHoverColor": "bg-gray-200",
    "textColorPrimary": "text-gray-900",
    "textColorSecondary": "text-gray-500",
    "chatWindowStyle": "bg-white"
  },
  green: {
    "primaryColor": "bg-emerald-700 shadow-sm",
    "secondaryColor": "bg-emerald-600",
    "accentColor": "bg-lime-400 shadow-sm",
    "hoverColor": "bg-lime-300",
    "backgroundColor": "bg-emerald-50",
    "backgroundImage": "",
    "primaryHoverColor": "bg-emerald-800",
    "secondaryHoverColor": "bg-emerald-700",
    "textColorPrimary": "text-black",
    "textColorSecondary": "text-emerald-900",
    "chatWindowStyle": "bg-emerald-50"
  },
  cyberpunk: {
    "primaryColor": "bg-gray-900 shadow-sm",
    "secondaryColor": "bg-gray-800",
    "accentColor": "bg-fuchsia-500 shadow-sm",
    "hoverColor": "bg-fuchsia-400",
    "backgroundColor": "bg-black",
    "backgroundImage": "",
    "primaryHoverColor": "bg-gray-800",
    "secondaryHoverColor": "bg-gray-700",
    "textColorPrimary": "text-cyan-300",
    "textColorSecondary": "text-fuchsia-300",
    "chatWindowStyle": "bg-black"
  },
  gpt: {
    "primaryColor": "bg-[#303030]",
    "secondaryColor": "bg-[#303030]",
    "accentColor": "bg-[#676767]",
    "hoverColor": "bg-[#676767]",
    "backgroundColor": "bg-[#212121]",
    "backgroundImage": "",
    "primaryHoverColor": "bg-[#876767]",
    "secondaryHoverColor": "bg-[#876767]",
    "textColorPrimary": "text-white",
    "textColorSecondary": "text-gray-400",
    "chatWindowStyle": "bg-[#212121] text-xs"
  },
  sophie: {
    "primaryColor": "bg-[#30302e]",
    "secondaryColor": "bg-[#30302e]",
    "accentColor": "bg-[#c96442]",
    "hoverColor": "bg-[#676767]",
    "backgroundColor": "bg-[#262624]",
    "backgroundImage": "",
    "primaryHoverColor": "bg-[#876767]",
    "secondaryHoverColor": "bg-[#876767]",
    "textColorPrimary": "text-white",
    "textColorSecondary": "text-gray-400",
    "chatWindowStyle": "bg-[#262624]"
  },
  shadcn: {
    "primaryColor": "bg-black shadow-sm",
    "secondaryColor": "bg-slate-900",
    "accentColor": "bg-white text-black",
    "hoverColor": "bg-neutral-200",
    "backgroundColor": "bg-black",
    "backgroundImage": "",
    "primaryHoverColor": "bg-slate-900",
    "secondaryHoverColor": "bg-slate-800",
    "textColorPrimary": "text-slate-50",
    "textColorSecondary": "text-slate-400",
    "chatWindowStyle": "bg-black"
  },
  hacker: {
    "primaryColor": "bg-zinc-950 shadow-sm text-sm",
    "secondaryColor": "bg-zinc-900",
    "accentColor": "bg-emerald-500 shadow-sm font-mono text-sm",
    "hoverColor": "bg-emerald-400",
    "backgroundColor": "bg-zinc-950 font-mono text-sm",
    "backgroundImage": "",
    "primaryHoverColor": "bg-zinc-900",
    "secondaryHoverColor": "bg-zinc-800",
    "textColorPrimary": "text-emerald-400",
    "textColorSecondary": "text-emerald-600",
    "chatWindowStyle": "bg-zinc-950"
  },
  vscode: {
    "primaryColor": "bg-[#1f1f1f] shadow-sm",
    "secondaryColor": "bg-[#1f1f1f]",
    "accentColor": "bg-[#282828]",
    "hoverColor": "bg-blue-600",
    "backgroundColor": "bg-[#181818]",
    "backgroundImage": "",
    "primaryHoverColor": "bg-gray-700",
    "secondaryHoverColor": "bg-gray-800",
    "textColorPrimary": "text-gray-100",
    "textColorSecondary": "text-gray-400",
    "chatWindowStyle": "bg-[#1f1f1f]"
  },
  msn: {
    "primaryColor": "bg-[#d5e0f4]",
    "secondaryColor": "bg-[#d1dcef]",
    "accentColor": "hover:bg-gradient-to-t bg-gradient-to-b from-white to-[#cfdaec] text-[#6f7192] shadow border-2 border-[#a4b4d3]",
    "hoverColor": "bg-blue-600",
    "backgroundColor": "bg-gradient-to-r from-[#f0f6fa] via-[#dee4f5] to-[#f0f6fa]",
    "backgroundImage": "",
    "primaryHoverColor": "bg-white",
    "secondaryHoverColor": "bg-white",
    "textColorPrimary": "text-[#53534f]",
    "textColorSecondary": "text-[#53534f]",
    "chatWindowStyle": "bg-white border-2 border-[#808bd2] font-w95fa",
    "aiMessageStyle": "bg-[#f0f6fa] text-[#6f7192] shadow border-2 border-[#a4b4d3] font-w95fa"
  },
  telegraph: {
    "primaryColor": "bg-white text-black",
    "secondaryColor": "bg-neutral-100",
    "accentColor": "bg-white text-black",
    "hoverColor": "bg-blue-100",
    "backgroundColor": "bg-green-500",
    "backgroundImage": "https://r4.wallpaperflare.com/wallpaper/366/185/207/pattern-gradient-cake-doughnuts-candy-cane-hd-wallpaper-4d31f4e1a1e771677a1f75a3a6e81f85.jpg",
    "primaryHoverColor": "bg-gray-100",
    "secondaryHoverColor": "bg-gray-100",
    "textColorPrimary": "text-black",
    "textColorSecondary": "text-neutral-800",
    "chatWindowStyle": "bg-white",
    "aiMessageStyle": "bg-white"
  },
  gpt6: {
    "primaryColor": "bg-white text-black",
    "secondaryColor": "bg-neutral-100",
    "accentColor": "bg-gradient-to-b from-[#9c70a3] to-[#e79e95] text-white",
    "hoverColor": "bg-blue-100",
    "backgroundColor": "bg-green-500",
    "backgroundImage": "https://images7.alphacoders.com/134/1343197.jpeg",
    "primaryHoverColor": "bg-gray-100",
    "secondaryHoverColor": "bg-gray-100",
    "textColorPrimary": "text-black",
    "textColorSecondary": "text-neutral-800",
    "chatWindowStyle": "bg-white"
  },
};

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const applyTheme = (themeKey: string) => {
    setTheme(themePresets[themeKey])
    setIsModalOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex text-neutral-500 hover:text-white px-1 underline text-xs"
      >
        <Palette className="w-4 h-4" />
        Theme
      </button>
      
      <Modal 
        open={isModalOpen} 
        title="Choose a Theme"
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(themePresets).map(([key, themePreset]) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className={`p-4 rounded-md transition-all ${themePreset.primaryColor} ${themePreset.textColorPrimary} hover:opacity-90 capitalize`}
              >
                <div className="flex items-center justify-between">
                  <span>{key}</span>
                  <div className={`w-4 h-4 rounded-full ${themePreset.accentColor}`}></div>
                </div>
                <div className="mt-2 text-xs">
                  <div className={`h-2 w-full rounded-full ${themePreset.secondaryColor}`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
