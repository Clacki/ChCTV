export type ParticipantOrganization = {
  /** Source-of-truth organization name from the participant material. */
  name: string;
  /** Short label intended for UI display. */
  shortName: string;
};

export type Participant = {
  streamerName: string;
  rpName: string | null;
  channelId: string | null;
  jobs: string[];
  organization: ParticipantOrganization | null;
  groups: string[];
  aliases: string[];
};

export type ParticipantFilters = {
  jobs?: readonly string[];
  organizationNames?: readonly string[];
  groups?: readonly string[];
};
