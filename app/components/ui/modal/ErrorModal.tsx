/**
 * ErrorModal informs user of some error that occured
 */
import { ShieldAlert } from "lucide-react";
import Modal from "./Modal"

export default function ErrorModal({content,open,setIsOpen, title}: Readonly<{content: string, open: boolean, setIsOpen: (b:boolean) => void, title:string}>) {

  return (
    <Modal open={open} title={title}>
      <div className="flex border-neutral-700">
        <div className="text-red-500 bg-opacity-50 rounded-full p-2">
          <ShieldAlert size={60} />
        </div>
        <p className="mt-auto mb-auto ml-5">{content}</p>
      </div>
      <div className="flex m-2">
        <button onClick={() => setIsOpen(false)} className="transition-all rounded pl-2 pr-2 ml-auto hover:bg-gray-800">OK</button>
      </div>
    </Modal>
  )
}
