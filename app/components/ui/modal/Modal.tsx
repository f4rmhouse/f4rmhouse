import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";

/**
 * Modal is the component that all modal windows in f4rmhouse use
 * @param param0 
 * @returns 
 */
export default function Modal({children, open, title, onClose}: Readonly<{children: React.ReactNode, open: boolean, title:string, onClose?: () => void}>) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  return (
    <>
    {isOpen ?
        <div id="popup-modal" onClick={handleBackdropClick} className="flex m-auto overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-10 w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative m-auto z-50 p-4 w-full max-w-xl max-h-full">
            <div className={`relative z-50 rounded-lg shadow p-2 ${theme.backgroundColor} ${theme.textColorPrimary}`}>
              <div className="flex">
                <p className="font-bold text-xs">{title.toLocaleUpperCase()}</p>
                <button onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }} className="transition-all hover:text-red-500 rounded-full cursor-pointer ml-auto p-2 hover:opacity-80"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.backgroundColor;
                }}><X /></button>
              </div>
              {children}
            </div>
          </div>
        </div>
      :
      <></>
    }
    </>
  )
}
