import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function OrderedList({children}:Props) {
    return(<div>
        <ol className="space-y-4 mt-4 text-lg text-zinc-300 list-decimal ml-12">
            {children}
        </ol> 
    </div>)
}