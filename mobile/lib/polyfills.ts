// Polyfills for Hermes runtime that @atproto/oauth-client-expo expects but
// the package's own polyfill does not provide.
//
// AbortSignal.timeout is a static method standardized in 2022. Hermes (as of
// RN 0.81) does not implement it. The OAuth client uses it during issuer
// verification on the callback path, so it must be available before the
// ExpoOAuthClient is constructed.
//
// Import this module at the top of any entry point that loads the OAuth
// client (e.g. lib/bskyOAuthClient.ts) — ES module hoisting guarantees the
// polyfill runs before the @atproto/oauth-client-expo import is evaluated.

declare global {
  // AbortSignal.timeout is a static method, but TS doesn't always have it
  // typed in older lib targets. This declaration is a no-op at runtime.
  // biome-ignore lint/suspicious/noExplicitAny: polyfill type narrowing
  interface AbortSignalConstructor {
    timeout?: (ms: number) => AbortSignal;
  }
}

if (
  typeof AbortSignal !== "undefined" &&
  typeof (AbortSignal as unknown as { timeout?: unknown }).timeout !== "function"
) {
  (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout =
    (ms: number): AbortSignal => {
      const controller = new AbortController();
      setTimeout(() => {
        const reason =
          typeof DOMException !== "undefined"
            ? new DOMException("The operation timed out.", "TimeoutError")
            : Object.assign(new Error("The operation timed out."), {
                name: "TimeoutError",
              });
        controller.abort(reason);
      }, ms);
      return controller.signal;
    };
}

export {};
