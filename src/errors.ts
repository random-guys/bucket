import { BAD_REQUEST, NOT_FOUND } from "http-status-codes";

class RepositoryError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class DuplicateModelError extends RepositoryError {
  constructor(message: string) {
    super(message, BAD_REQUEST);
  }
}

export class ModelNotFoundError extends RepositoryError {
  constructor(message: string) {
    super(message, NOT_FOUND);
  }
}
