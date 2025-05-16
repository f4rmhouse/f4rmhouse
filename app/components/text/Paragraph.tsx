import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function Paragraph({ children }: Props) {
    return <div className="mt-8 text-lg text-zinc-300">{children}</div>
}