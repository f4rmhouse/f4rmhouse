// ErrorType represents an error, usually used to format error messages when
// async fetches fail
type ErrorType = {
    code: number,
    message: string,
    link: string
}
  
export default ErrorType;