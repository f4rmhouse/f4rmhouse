import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

/**
 * Modal is the component that all modal windows in f4rmhouse use
 * @param param0 
 * @returns 
 */
export default function Modal({children,open,title}: Readonly<{children: React.ReactNode, open: boolean, title:string}>) {

  const [isOpen, setIsOpen] = useState<boolean>(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
    {isOpen ?
        <div id="popup-modal" onClick={handleBackdropClick} className="flex m-auto overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-10 w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative m-auto z-50 p-4 w-full max-w-xl max-h-full">
            <div className="relative z-50 rounded-lg shadow bg-black bg-opacity-50 backdrop-blur-xl p-2">
              <div className="flex">
                <p className="font-bold text-xs text-neutral-200">{title.toLocaleUpperCase()}</p>
                <button onClick={() => setIsOpen(false)} className="transition-all hover:text-red-500 rounded-full cursor-pointer ml-auto p-2 hover:bg-neutral-700"><IoMdClose /></button>
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
