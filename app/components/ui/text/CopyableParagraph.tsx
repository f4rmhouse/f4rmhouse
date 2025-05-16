import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * CopyableParagraph is a component that shows a paragagraph that can be copied when
 * you click on it.
 * @param param0 
 * @returns 
 */
const CopyableParagraph = ({text}:{text:string}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-lg">
      <div 
        className="transition-all relative group cursor-pointer p-4 rounded-lg border border-gray-800 hover:bg-gray-900"
        onClick={handleClick}
      >
        <p className="pr-8 text-sm">{text}</p>
        <span className="absolute right-2 top-4 text-gray-500">
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 opacity-0 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </div>
  );
};

export default CopyableParagraph;