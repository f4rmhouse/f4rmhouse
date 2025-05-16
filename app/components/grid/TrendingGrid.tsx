import InfoCardGrid from "./InfoCardGrid";
import SectionType from "../types/SectionType";

/**
 * TrednginGrid is an async grid that shows currently trending tools 
 */
export default async function TrendingGrid({section}: {section: SectionType}) {
    return (
        <div className="mt-10">
            <InfoCardGrid apps={section.content} />
        </div>
    )
}