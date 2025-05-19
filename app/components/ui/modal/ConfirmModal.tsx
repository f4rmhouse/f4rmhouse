/**
 * ConfirmModal is a yes/no confirmation shown to the user
 */
import Modal from "./Modal"

export default function ConfirmModal(
    {content,open,setIsOpen, title, action}: 
    Readonly<{content: string, open: boolean, setIsOpen: (b:boolean) => void, title:string, action: () => void}>) {

  return (
    <Modal open={open} title={title}>
      <div className="flex border-neutral-700">
        <div className="text-yellow-500 bg-opacity-50 rounded-full p-2">
        <p className="text-4xl">🤔</p>
        </div>
        <p className="mt-auto mb-auto ml-5 text-sm">{content}</p>
      </div>
      <div className="flex m-2">
        <div className="flex ml-auto gap-2">
            <button onClick={() => setIsOpen(false)} className="rounded transition-all pl-4 pr-4 p-1 ml-auto hover:bg-gray-800 bg-neutral-700">Cancel</button>
            <button onClick={action} className="rounded transition-all pl-4 pr-4 p-1 ml-auto hover:bg-teal-700 bg-teal-600">Yes I am sure</button>
        </div>
      </div>
    </Modal>
  )
}
