import AppCardType from "./AppCardType"

// SesctionType represents a section on the home page 
type SectionType = {
    header: string,
    type: string,
    content: AppCardType[]|string
}

export default SectionType;