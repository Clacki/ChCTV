export const participantAffiliationTypes = [
  "public",
  "business",
  "personal_business",
  "illegal_business",
  "gang",
] as const;

export type ParticipantAffiliationType = typeof participantAffiliationTypes[number];

export type ParticipantAffiliation = {
  type: ParticipantAffiliationType;
  name: string;
  role?: string;
};

export type Participant = {
  streamerName: string;
  rpName: string | null;
  channelId: string | null;
  affiliations: ParticipantAffiliation[];
  groups: string[];
  tags: string[];
  aliases: string[];
};

export type ParticipantFilters = {
  affiliations?: readonly string[];
  groups?: readonly string[];
  tags?: readonly string[];
};
