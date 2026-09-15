import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const participantsPath = resolve("src/data/participants.json");
const liveApiUrl = "https://openapi.chzzk.naver.com/open/v1/lives";

function normalizeChannelName(value) {
  return value.trim().replaceAll(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

function normalizeDiagnosticName(value) {
  return normalizeChannelName(value).replaceAll(/[^\p{L}\p{N}]/gu, "");
}

function levenshteinDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + Number(left[leftIndex - 1] !== right[rightIndex - 1]),
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function findPotentialParticipant(channelName, participants) {
  const normalizedChannelName = normalizeDiagnosticName(channelName);
  const candidates = participants.flatMap((participant) => [participant.streamerName, ...participant.aliases].map((name) => ({
    participant,
    name,
    normalizedName: normalizeDiagnosticName(name),
  })));
  const suffixStrippedName = normalizedChannelName.replace(/^\d+|(?:씨|님|형|tv|\d+)$/gi, "");
  const suffixMatch = candidates.find(({ normalizedName }) => normalizedName === suffixStrippedName);

  if (suffixMatch) {
    return { participant: suffixMatch.participant, matchType: "suffix" };
  }

  const additionalNameMatches = candidates
    .filter(({ normalizedName }) => normalizedName.length >= 2 && suffixStrippedName.includes(normalizedName))
    .sort((left, right) => right.normalizedName.length - left.normalizedName.length)[0];

  if (additionalNameMatches) {
    return { participant: additionalNameMatches.participant, matchType: "additional_name" };
  }

  const nearest = candidates
    .map((candidate) => ({
      ...candidate,
      distance: levenshteinDistance(normalizedChannelName, candidate.normalizedName),
    }))
    .sort((left, right) => left.distance - right.distance)[0];

  if (!nearest || nearest.distance > 1) {
    return null;
  }

  return { participant: nearest.participant, matchType: "single_character" };
}

function classifyUnmatchedLive(potentialParticipant) {
  if (!potentialParticipant) {
    return "participant_missing";
  }

  if (potentialParticipant.matchType === "suffix") {
    return "suffix_or_number_difference";
  }

  if (potentialParticipant.matchType === "additional_name") {
    return "additional_english_or_korean_name";
  }

  return "single_character_or_special_character_difference";
}

function getPotentialParticipantDetails(potentialParticipant) {
  if (!potentialParticipant) {
    return null;
  }

  const { participant, matchType } = potentialParticipant;

  return {
    streamerName: participant.streamerName,
    aliases: participant.aliases,
    channelId: participant.channelId,
    matchType,
  };
}

function classifyExactNameCandidate(participant) {
  if (!participant) {
    return "participant_missing";
  }

  return participant.channelId === null ? "ambiguous_exact_name" : "different_participant_channel_id";
}

function isBongnudoLive(live) {
  return /봉누도/.test(live.liveTitle ?? "") || (live.tags ?? []).some((tag) => /봉누도/.test(tag));
}

async function getCurrentChzzkLives() {
  const clientId = process.env.CHZZK_CLIENT_ID;
  const clientSecret = process.env.CHZZK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("CHZZK_CLIENT_ID and CHZZK_CLIENT_SECRET are required.");
  }

  const lives = [];
  let next;

  do {
    const url = new URL(liveApiUrl);
    url.searchParams.set("size", "20");

    if (next) {
      url.searchParams.set("next", next);
    }

    const response = await fetch(url, {
      headers: {
        "Client-Id": clientId,
        "Client-Secret": clientSecret,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`CHZZK LIVE API request failed: ${response.status}`);
    }

    const body = await response.json();
    lives.push(...(body.content?.data ?? []));
    next = body.content?.page?.next ?? null;
  } while (next);

  return lives;
}

const participants = JSON.parse(await readFile(participantsPath, "utf8"));
const lives = await getCurrentChzzkLives();
const targetLives = lives.filter(isBongnudoLive);
const participantByChannelId = new Map(
  participants.filter((participant) => participant.channelId).map((participant) => [participant.channelId, participant]),
);
const participantsByName = new Map();

for (const participant of participants) {
  for (const name of new Set([participant.streamerName, ...participant.aliases])) {
    const normalizedName = normalizeChannelName(name);
    participantsByName.set(normalizedName, [...(participantsByName.get(normalizedName) ?? []), participant]);
  }
}

const candidatesByParticipant = new Map();

for (const live of targetLives) {
  const directParticipant = participantByChannelId.get(live.channelId);

  if (directParticipant) {
    candidatesByParticipant.set(directParticipant.streamerName, [live]);
    continue;
  }

  for (const participant of participantsByName.get(normalizeChannelName(live.channelName)) ?? []) {
    candidatesByParticipant.set(participant.streamerName, [...(candidatesByParticipant.get(participant.streamerName) ?? []), live]);
  }
}

let channelIdMatchedCount = 0;
let nameFallbackMatchedCount = 0;
const channelIdMatches = [];
const nameFallbackMatches = [];

const unmatched = targetLives.flatMap((live) => {
  const directParticipant = participantByChannelId.get(live.channelId);
  const nameCandidates = directParticipant ? [directParticipant] : participantsByName.get(normalizeChannelName(live.channelName)) ?? [];
  const hasSingleParticipant = nameCandidates.length === 1;
  const potentialParticipant = nameCandidates[0]
    ? { participant: nameCandidates[0], matchType: "exact" }
    : findPotentialParticipant(live.channelName, participants);
  const participant = potentialParticipant?.participant;
  const hasSingleLiveCandidate = participant && candidatesByParticipant.get(participant.streamerName)?.length === 1;

  if (directParticipant) {
    channelIdMatchedCount += 1;
    channelIdMatches.push({
      channelId: live.channelId,
      channelName: live.channelName,
      participant: getPotentialParticipantDetails({ participant: directParticipant, matchType: "channel_id" }),
    });
    return [];
  }

  if (hasSingleParticipant && hasSingleLiveCandidate) {
    nameFallbackMatchedCount += 1;
    nameFallbackMatches.push({
      channelId: live.channelId,
      channelName: live.channelName,
      participant: getPotentialParticipantDetails({ participant, matchType: "exact_name_or_alias" }),
    });
    return [];
  }

  return [{
    channelId: live.channelId,
    channelName: live.channelName,
    participant: getPotentialParticipantDetails(potentialParticipant),
    reason: nameCandidates.length > 1 ? classifyExactNameCandidate(participant) : classifyUnmatchedLive(potentialParticipant),
  }];
});

const reasonCounts = Object.groupBy(unmatched, (live) => live.reason);

console.log(JSON.stringify({
  totalChzzkLiveChannelCount: lives.length,
  bongnudoLiveChannelCount: targetLives.length,
  matchedCount: channelIdMatchedCount + nameFallbackMatchedCount,
  channelIdMatchedCount,
  nameFallbackMatchedCount,
  eligibleChannelIdRegistrationCount: nameFallbackMatches.filter((match) => match.participant.channelId === null).length,
  channelIdMatches,
  nameFallbackMatches,
  unmatchedCount: unmatched.length,
  unmatchedReasonCounts: Object.fromEntries(Object.entries(reasonCounts).map(([reason, items]) => [reason, items.length])),
  unmatched,
}, null, 2));
