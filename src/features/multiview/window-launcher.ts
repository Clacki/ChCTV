export type OpenMultiviewResult =
  | { ok: true }
  | { ok: false; reason: "popup-blocked" };

export function getMultiviewUrl(channelIds: readonly string[]): string {
  const params = new URLSearchParams();
  channelIds.forEach((channelId) => {
    params.append("channel", channelId);
  });
  return `/multiview?${params.toString()}`;
}

export function openMultiviewWindow(browserWindow: Window, channelIds: readonly string[]): OpenMultiviewResult {
  const multiviewWindow = browserWindow.open(getMultiviewUrl(channelIds), "_blank");

  if (!multiviewWindow) {
    return { ok: false, reason: "popup-blocked" };
  }

  // `noopener` can make window.open return null even when the popup succeeds,
  // which would break the existing popup-blocked feedback.
  multiviewWindow.opener = null;

  return { ok: true };
}
