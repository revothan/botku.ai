import { PostgrestError } from '@supabase/supabase-js';

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultError = PostgrestError;

export function isError<T>(
  result: T | PostgrestError
): result is PostgrestError {
  return (result as PostgrestError)?.code !== undefined;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}