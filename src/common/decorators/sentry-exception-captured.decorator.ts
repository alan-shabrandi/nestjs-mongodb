import * as Sentry from '@sentry/node';

export function SentryExceptionCaptured() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const exception = args[0]; // first argument is the exception
      // Capture to Sentry
      Sentry.captureException(exception);

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
