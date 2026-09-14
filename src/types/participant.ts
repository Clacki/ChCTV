export type ParticipantAffiliation = {
  type: string;
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
