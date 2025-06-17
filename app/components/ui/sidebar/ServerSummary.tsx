import { ServerSummaryType } from "../../types/MCPTypes";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ServerSummary({summary}: {summary: ServerSummaryType | undefined}) {
  const [toolsExpanded, setToolsExpanded] = useState(false);
  
  const toggleTools = () => {
    setToolsExpanded(!toolsExpanded);
  };
  if (!summary || (!summary.tools.length && !summary.prompts.length && !summary.resources.length) ) {
    return (
      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle size={12} />
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1 mt-1 ml-5">
      <div>
        <p>{summary.instructions}</p>
        <div 
          className="flex items-center cursor-pointer" 
          onClick={toggleTools}
        >
          {toolsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="font-medium">Tools:</span> {summary.tools?.length || 0}
        </div>
        {
          toolsExpanded && summary.tools?.map((tool, index) => (
            <div key={index} className="pl-4">
              <p className="pl-4 font-bold">{tool.name}</p>
              <p className="pl-4">{tool.descriptions}</p>
              <p className="font-bold pl-4">Parameters</p>
              {Object.keys(tool.inputSchema.properties).map(e => (
                <p className="pl-8" key={e}>{e}: {(tool.inputSchema.properties[e] as any).type}</p>
              ))}
            </div>
          ))
        }
      </div>
      <div>
        <span className="font-medium">Prompts:</span> {summary.prompts?.length || 0}
      </div>
      <div>
        <span className="font-medium">Resources:</span> {summary.resources?.length || 0}
      </div>
      <div>
        <span className="font-medium">Resource templates:</span> {summary.resourceTemplates?.length || 0}
      </div>
      <p>Version: {summary.version}</p>
      <p>URI: {summary.uri}</p>
    </div>
  );
}