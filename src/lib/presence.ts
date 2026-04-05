/** Telegram-style last seen formatting */

export function formatLastSeen(ts: number | undefined): string {
  if (ts == null || !Number.isFinite(ts)) return 'last seen a while ago';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'last seen just now';
  if (diff < 3600_000) {
    const m = Math.floor(diff / 60_000);
    return `last seen ${m} min ago`;
  }
  if (diff < 86400_000) {
    const h = Math.floor(diff / 3600_000);
    return `last seen ${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(diff / 86400_000);
  if (d === 1) return 'last seen yesterday';
  if (d < 7) return `last seen ${d} days ago`;
  return `last seen ${new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export function peerStatusLine(peer: {
  isOnline?: boolean;
  lastSeenAt?: number;
  hideLastSeenFromOthers?: boolean;
  premiumPlus?: boolean;
}): { kind: 'online' | 'hidden' | 'lastSeen'; text: string } {
  if (peer.isOnline) return { kind: 'online', text: 'online' };
  if (peer.hideLastSeenFromOthers && peer.premiumPlus) {
    return { kind: 'hidden', text: 'last seen recently' };
  }
  return { kind: 'lastSeen', text: formatLastSeen(peer.lastSeenAt) };
}
