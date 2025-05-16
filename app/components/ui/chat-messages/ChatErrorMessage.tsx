export default function ChatErrorMessage({content}:{content:string}) {
  return (
    <div className="gap-2 border bg-red-900 rounded p-2 border-red-700 mb-5 mt-10">
      <p className="text-xs font-mono text-red-500 font-bold">error</p>
      <div className='p-2'>
        <div className="text-red-400 text-sm" style={{ whiteSpace: 'pre-line' }}>{content}</div>
      </div>
    </div>
  )
}