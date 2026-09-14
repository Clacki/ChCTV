export type OpenMultiviewResult =
  | { ok: true }
  | { ok: false; reason: "popup-blocked" };

export function getMultiviewUrl(channelIds: readonly string[]): string {
  const params = new URLSearchParams();
  params.set("channels", channelIds.join(","));
  return `/multiview?${params.toString()}`;
}

export function openMultiviewWindow(browserWindow: Window, channelIds: readonly string[]): OpenMultiviewResult {
  const multiviewWindow = browserWindow.open(getMultiviewUrl(channelIds), "_blank");

  return multiviewWindow ? { ok: true } : { ok: false, reason: "popup-blocked" };
}
