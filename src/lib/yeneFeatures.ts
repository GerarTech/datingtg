/** Yene premium / growth / trust constants — transparent & fair */

export const FREE_DAILY_LIKES = 15;
export const PLUS_DAILY_LIKES = 50;
export const SLOW_DECK_DAILY_CARDS = 18; // curated deck per day (left + right count)
export const MAX_VOICE_SECONDS = 30;

export type DatingIntent = 'serious' | 'casual' | 'friends' | 'open';

export function intentCompatible(a: DatingIntent | undefined, b: DatingIntent | undefined): boolean {
  const x = a ?? 'open';
  const y = b ?? 'open';
  if (x === 'open' || y === 'open') return true;
  return x === y;
}

export function generateReferralCode(userId: string): string {
  const tail = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'FRIEND';
  return `YENE-${tail}`;
}

export const ICEBREAKERS = (theirName: string, sharedInterest?: string) => {
  const base = [
    `Hey ${theirName} — what's something you're excited about this week?`,
    `Coffee or tea first date? ☕`,
    `If you could travel anywhere this weekend, where would it be?`,
    `What's the last thing that made you laugh out loud?`,
    sharedInterest
      ? `I saw you're into ${sharedInterest} — what's your favorite thing about it?`
      : `What's one thing on your mind lately?`,
  ];
  return base;
};

export const TELEGRAM_GROWTH_COPY = {
  dailyTitle: 'Your daily moment',
  streak: (n: number) => (n <= 1 ? 'Start your streak today' : `${n} day streak — keep showing up`),
};
