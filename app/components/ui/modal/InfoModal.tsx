/**
 * InfoModal informs a user about something
 */
import Modal from "./Modal"
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function InfoModal({
  content, open, setIsOpen, title}: 
  Readonly<{content: string, open: boolean, setIsOpen: (b:boolean) => void, title:string}>) 
{
  return (
    <Modal open={open} title={title}>
      <div className="flex border-neutral-700">
        <div className="text-sky-500 bg-opacity-50 rounded-full p-2">
          <IoMdInformationCircleOutline size={60} />
        </div>
        <p className="mt-auto mb-auto ml-5 text-sm">{content}</p>
      </div>
      <div className="flex m-2">
        <button onClick={() => setIsOpen(false)} className="transition-all text-xs rounded pl-2 pr-2 ml-auto hover:bg-gray-800">OK</button>
      </div>
    </Modal>
  )
}
