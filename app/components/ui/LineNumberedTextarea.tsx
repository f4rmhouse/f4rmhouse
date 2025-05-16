import React, { useState, useRef, useEffect } from 'react';

interface LineNumberedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
}

export const LineNumberedTextarea: React.FC<LineNumberedTextareaProps> = ({ className, ...props }) => {
  const [lineCount, setLineCount] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n').length;
    const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
    setLineCount(lines);
    setWordCount(words);
    adjustHeight();
    if (props.onChange) {
      props.onChange(e);
    }
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  useEffect(() => {
    if (props.value) {
      const lines = props.value.toString().split('\n').length;
      const words = props.value.toString().trim() ? props.value.toString().trim().split(/\s+/).length : 0;
      setLineCount(lines);
      setWordCount(words);
      adjustHeight();
    }
  }, [props.value]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-right text-sm text-neutral-500">
        {wordCount} word{wordCount !== 1 ? 's ' : ''}
        (~{wordCount*0.75} tokens)
      </div>
      <div className="relative flex">
        <div className="select-none pt-2 pr-2 text-right bg-neutral-800/30 rounded-l-md border-l border-t border-b border-neutral-700/50">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="text-neutral-500 text-sm px-2 font-mono">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{
          '--scrollbar-color': '#4b5563',
          '--scrollbar-bg': 'rgba(38, 38, 38, 0.3)',
        } as React.CSSProperties}>
          <textarea
            {...props}
            ref={textareaRef}
            onChange={handleTextChange}
            className={`w-full font-mono text-sm rounded-l-none whitespace-nowrap overflow-y-hidden ${className}`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--scrollbar-color) var(--scrollbar-bg)',
            }}
            rows={1}
          />
        </div>
      </div>
    </div>
  );
};
