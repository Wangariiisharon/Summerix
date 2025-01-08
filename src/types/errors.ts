export type ErrorCode = 'INVALID_USER' | 'INVALID_COUNTRY' | 'SAVE_FAILED' | 'VALIDATION_ERROR';

export interface AppError {
  message: string;
  code: ErrorCode;
}

export const createError = (message: string, code: ErrorCode): AppError => ({
  message,
  code,
});
