import type { RequestHandler } from 'express';

interface CookieParseOptions {
  decode?(val: string): string;
}

declare function cookieParser(
  secret?: string | string[],
  options?: CookieParseOptions,
): RequestHandler;

export default cookieParser;

declare module 'express-serve-static-core' {
  interface Request {
    cookies: Record<string, string | undefined>;
    signedCookies: Record<string, string | undefined>;
  }
}
