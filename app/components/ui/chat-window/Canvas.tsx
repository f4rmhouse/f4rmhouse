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
  const { currentArtifact, artifacts, setCurrentArtifact, updateArtifact } = useArtifact()
  const [artifactType, setArtifactType] = useState<"image"|"html"|"video"|"url"|null>(null)

  // Function to get file name from URL
  const getFileName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
  
  // Function to get display name for tab
  const getTabName = (content: string, index: number) => {
    const type = getArtifactType(content);
    
    if (type === "html") {
      // Try to extract title from HTML content
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }
      return `HTML Document ${index + 1}`;
    }
    
    if (type === "url") {
      return getFileName(content) || `Link ${index + 1}`;
    }
    
    return getFileName(content) || `Artifact ${index + 1}`;
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

  const downloadFile = () => {
    if (!currentArtifact) return;
    
    if (artifactType === "html") {
      // Create blob from HTML string
      const blob = new Blob([currentArtifact], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getTabName(currentArtifact, artifacts.indexOf(currentArtifact))}.html`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For URLs and other content, use original behavior
      const link = document.createElement('a');
      link.href = currentArtifact;
      link.download = getFileName(currentArtifact);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    <div className={`relative h-full w-full flex flex-col overflow-auto`}>
      {/* Tabs for artifacts */}
      <div className={`absolute z-10 w-full flex overflow-x-auto ${theme.secondaryColor} bg-opacity-0 `}>
        {artifacts.map((artifactUrl, index) => (
          <button
            key={index}
            onClick={() => updateArtifact(index)}
            className={`text-xs whitespace-nowrap flex items-center gap-1 bg-black`}
          >
            <span className="max-w-[100px] truncate">{getTabName(artifactUrl, index)}</span>
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className={`z-0 absolute flex gap-0 w-full items-center p-1`}>
        <button
          onClick={reloadIframe}
          className={`ml-auto p-2 hover:rotate-[-90deg] ${theme.textColorPrimary} transition-all`}
          title="Reload content"
        >
          <RefreshCcw size={15} />
        </button>
        <button
          onClick={downloadFile}
          className={`rounded-md p-2 transition-all ${theme.textColorPrimary}`}
          title="Download content"
        >
          <Download size={15} />
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-grow overflow-auto">
        {artifactType === "html" ? (
          <iframe
            src={`data:text/html;charset=utf-8,${encodeURIComponent(currentArtifact || "")}`}
            className="h-full w-full border-none rounded-b-md"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
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