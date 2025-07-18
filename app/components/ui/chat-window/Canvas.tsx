"use client"

import { useState, useEffect, useRef } from 'react'
import config from '../../../../f4.config'
import { Download, RefreshCcw, X } from 'lucide-react'
import { useArtifact } from '../../../context/ArtifactContext'
import { useTheme } from '../../../context/ThemeContext'

export default function Canvas() {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [artifact, setArtifact] = useState<string>("")
  const { currentArtifact, artifacts, setCurrentArtifact } = useArtifact()
  const [artifactType, setArtifactType] = useState<"image"|"html"|"video"|"url"|null>(null)

  // Function to get file name from URL
  const getFileName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
  
  // Function to determine artifact type based on content or file extension
  const getArtifactType = (content: string) => {
    // Check if content is HTML by looking for DOCTYPE and html tags
    if (content.includes("<!DOCTYPE html") && content.includes("</html>")) {
      return "html";
    }
    
    // Check file extension for URLs
    const format = content.split(".").pop()?.toLowerCase();
    switch (format) {
      case "html":
        return "html";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return "image";
      default:
        // If it starts with http/https, treat as URL
        if (content.startsWith("http://") || content.startsWith("https://")) {
          return "url";
        }
        return "image";
    }
  }

  useEffect(() => {
    if(artifacts.length > 0){
      setArtifact(artifacts[artifacts.length-1])
      const artifactType = getArtifactType(artifacts[artifacts.length-1]);
      setArtifactType(artifactType)
      
      if (artifactType === "html" && iframeRef.current) {
        // For HTML content, create a blob URL
        const blob = new Blob([artifacts[artifacts.length-1]], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;
        
        // Cleanup function to revoke blob URL
        return () => {
          URL.revokeObjectURL(url);
        };
      } else if (artifactType === "url" && iframeRef.current) {
        iframeRef.current.src = artifacts[artifacts.length-1]
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
    <div className={`relative h-full w-full rounded-md flex flex-col overflow-auto`}>
      {/* Tabs for artifacts */}
      <div className={`absolute w-full flex overflow-x-auto ${theme.secondaryColor} bg-opacity-0 rounded-t-md`}>
        {artifacts.map((artifactUrl, index) => (
          <button
            key={index}
            onClick={() => setCurrentArtifact(artifactUrl)}
            className={`px-3 py-2 text-sm whitespace-nowrap flex items-center gap-1 ${
              currentArtifact === artifactUrl 
                ? `${theme.primaryColor} ${theme.textColorPrimary}` 
                : `${theme.textColorSecondary}`
            }`}
          >
            <span className="max-w-[100px] truncate">{getFileName(artifactUrl)}</span>
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className={`z-10 absolute flex gap-0 w-full items-center p-1`}>
        <button
          onClick={reloadIframe}
          className={`ml-auto rounded-md p-2 hover:rotate-[-90deg] ${theme.textColorPrimary} transition-all`}
          title="Reload content"
        >
          <RefreshCcw size={15} />
        </button>
        <a
          href={currentArtifact}
          download={getFileName(currentArtifact || "")}
          className={`rounded-md p-2 transition-all ${theme.textColorPrimary}`}
          title="Download content"
        >
          <Download size={15} />
        </a>
      </div>
      
      {/* Content area */}
      <div className="flex-grow overflow-auto">
        {artifactType === "html" ? (
          <div>
            <div dangerouslySetInnerHTML={{__html: currentArtifact || ""}}>
            </div>
          </div>
          
        ) : artifactType === "url" ? (
          <iframe
            ref={iframeRef}
            src={currentArtifact || ""}
            className="h-full w-full border-none rounded-b-md"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex overflow-auto">
            {artifact.length > 0 &&
              <img
                src={artifact}
                className="rounded-md m-auto"
                alt={getFileName(artifact)}
              />
            }
          </div>
        )}
      </div>
    </div>
  )
}