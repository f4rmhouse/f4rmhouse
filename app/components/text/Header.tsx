import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function Header({children}:Props) {
    return (<div>
        <p className="mt-8 text-2xl font-bold text-white">{children}</p>
    </div>)
}