// ReviewType represents a review 
type ReviewType = {
    pid: string,
    uid: string
    title: string,
    value: string,
    content: string,
    creator: string,
    creator_uid: string,
    date: string,
    rating: number 
    rated: boolean 
}

export default ReviewType;