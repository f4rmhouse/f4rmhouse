import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function UnorderedList({children}:Props) {
    return(<div>
        <ul className="space-y-4 mt-4 text-lg text-zinc-300 list-disc ml-12">
            {children}
        </ul> 
    </div>)
}