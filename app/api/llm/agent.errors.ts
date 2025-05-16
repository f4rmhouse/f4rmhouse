export class LLMServiceError extends Error {
    status: number;
    constructor(message: string, status: number = 500) {
      super(message);
      this.name = 'LLMServiceError';
      this.status = status;
    }
}
  