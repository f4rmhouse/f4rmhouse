"use client"

import { useState, useEffect, useRef } from 'react'
import config from '../../../../f4.config'
import { Download, RefreshCcw } from 'lucide-react'
import { useArtifact } from '../../../context/ArtifactContext'
import { useTheme } from '../../../context/ThemeContext'

export default function Canvas() {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [artifact, setArtifact] = useState<string>("")
  const { currentArtifact, artifacts, setCurrentArtifact } = useArtifact()
  const [artifactType, setArtifactType] = useState<"image"|"html"|"video"|null>(null)

  useEffect(() => {
    console.log("artifacts: ", artifacts)
    if(artifacts.length > 0){
      setArtifact(artifacts[artifacts.length-1])
      const format = artifacts[artifacts.length-1].split(".").pop()
      switch (format) {
        case "html":
          setArtifactType("html")
          if (iframeRef.current) {
            iframeRef.current.src = artifacts[artifacts.length-1]
          }
          break;
        default:
          setArtifactType("image")
          break;
      }
    }
  },[currentArtifact, artifacts])

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  if (!currentArtifact) {
    return (
      <div className={`flex h-full w-full ${theme.primaryColor} items-center justify-center`}>
        <p className={theme.textColorSecondary}>No content to display</p>
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full rounded-md border ${theme.secondaryColor?.replace('bg-', 'border-')}`}>
      <div className={`absolute z-10 flex gap-2 ${theme.primaryColor ? theme.primaryColor : "bg-neutral-800"} w-full items-center`}>
        <button
          onClick={reloadIframe}
          className={`rounded-md p-2 hover:rotate-[-90deg] ${theme.textColorPrimary ? theme.textColorPrimary : "text-white"} transition-all`}
          title="Reload content"
        >
          <RefreshCcw size={15} className={theme.textColorPrimary} />
        </button>
        <a
          href={currentArtifact}
          download="a_file.html"
          className={`rounded-md p-2 ${theme.primaryColor} hover:${theme.primaryHoverColor} transition-all`}
          title="Download content"
        >
          <Download size={15} className={theme.textColorPrimary} />
        </a>
      </div>
      {artifactType === "html" ? (
        <iframe
          ref={iframeRef}
          src={artifacts[artifacts.length-1]}
          className="h-full w-full border-none rounded-md pt-8"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="flex h-full w-full">
        <img
          src={artifact}
          className="m-auto rounded-md"
        />
        </div>
      )}
    </div>
  )
}