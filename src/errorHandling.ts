
type MapFunction<T, E> = <U>(resultMapper: (value: T) => U) => Result<U, E>;
type MapErrFunction<T, E> = <U>(resultMapper: (error: E) => U) => Result<T, U>;

type MapAsyncFunction<T, E> = <U>(resultMapper: (value: T) => Promise<U>) => Promise<Result<U, E>>;
type MapErrAsyncFunction<T, E> = <U>(resultMapper: (error: E) => Promise<U>) => Promise<Result<T, U>>;

type ResultMappers<T, E> = {
  map: MapFunction<T, E>;
  mapErr: MapErrFunction<T, E>;
  mapAsync: MapAsyncFunction<T, E>;
  mapErrAsync: MapErrAsyncFunction<T, E>;
}

type ResultSuccess<T, E> = { isError: false | undefined, value: T } & ResultMappers<T, E>;
type ResultError<T, E> = { isError: true, error: E } & ResultMappers<T, E>;
export type Result<T = undefined, E = Error> = ResultSuccess<T, E> | ResultError<T, E>;


export const ok = <T>(value: T): Result<T, any> => {
  return {
    isError: false,
    value,
    map: <U>(resultMapper: (value: T) => U): Result<U, Error> => {
      const mappedValue = resultMapper(value);
      return ok(mappedValue);
    },
    mapErr: (_resultMapper) => {
      return ok(value);
    },
    mapAsync: async (resultMapper) => {
      const mappedValue = await resultMapper(value);
      return ok(mappedValue);
    },
    mapErrAsync: async (_resultMapper) => {
      return ok(value);
    }
  };
}

export const err = <T>(error: T): Result<any, T> => {
  return {
    isError: true,
    error,
    map: (_resultMapper) => {
      return err(error);
    },
    mapErr: (resultMapper) => {
      const mappedError = resultMapper(error);
      return err(mappedError);
    },
    mapAsync: async (_resultMapper) => {
      return err(error);
    },
    mapErrAsync: async (resultMapper) => {
      const mappedError = await resultMapper(error);
      return err(mappedError);
    }
  };
}
