/** Passed in `location.state` when opening `/profile/:userId` so Back returns to the right screen. */
export type ProfileViewLocationState = {
  profileBack?: { path: string; openMatches?: boolean; refreshDeck?: boolean };
};
