type ErrorConstructorWithIsError = ErrorConstructor & {
  isError?: (value: unknown) => value is Error;
};

const objectTag = (value: unknown) => Object.prototype.toString.call(value);

export function isError(value: unknown): value is Error {
  const isNativeError = (Error as ErrorConstructorWithIsError).isError;

  if (typeof isNativeError === "function") {
    return isNativeError(value);
  }

  const tag = objectTag(value);
  return tag === "[object Error]" || tag === "[object DOMException]";
}

export function toError(value: unknown, fallbackMessage = "Unexpected MCP App error"): Error {
  if (isError(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return new Error(value);
  }

  return new Error(fallbackMessage);
}
