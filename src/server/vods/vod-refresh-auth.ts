import "server-only";

export function isVodRefreshAuthorized(request: Request): boolean {
  const secret = process.env.VOD_REFRESH_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}
