import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const participantsPath = resolve(projectRoot, "src/data/participants.json");
const overridesPath = resolve(projectRoot, "src/data/chzzk-channel-overrides.json");
const channelIdPattern = /^[0-9a-f]{32}$/;
const apply = process.argv.includes("--apply");

function fail(message) {
  throw new Error(`CHZZK channel enrichment failed: ${message}`);
}

function validateOverrides(participants, overrides) {
  if (Array.isArray(overrides) || overrides === null || typeof overrides !== "object") {
    fail("chzzk-channel-overrides.json must be an object keyed by streamerName.");
  }

  const participantByStreamerName = new Map(
    participants.map((participant) => [participant.streamerName, participant]),
  );
  const existingChannelIds = new Set(
    participants
      .map((participant) => participant.channelId)
      .filter((channelId) => channelId !== null),
  );
  const pendingChannelIds = new Set();
  const matched = [];

  for (const [streamerName, channelId] of Object.entries(overrides)) {
    const participant = participantByStreamerName.get(streamerName);

    if (!participant) {
      fail(`override streamerName does not exist: ${streamerName}`);
    }

    if (participant.channelId !== null) {
      fail(`refusing to overwrite an existing channelId: ${streamerName}`);
    }

    if (typeof channelId !== "string" || !channelIdPattern.test(channelId)) {
      fail(`invalid channelId for ${streamerName}`);
    }

    if (existingChannelIds.has(channelId) || pendingChannelIds.has(channelId)) {
      fail(`duplicate channelId for ${streamerName}`);
    }

    pendingChannelIds.add(channelId);
    matched.push({ streamerName, channelId });
  }

  return matched;
}

const participants = JSON.parse(await readFile(participantsPath, "utf8"));
const overrides = JSON.parse(await readFile(overridesPath, "utf8"));
const initialTargetCount = participants.filter((participant) => participant.channelId === null).length;
const matched = validateOverrides(participants, overrides);
const matchedNames = new Set(matched.map(({ streamerName }) => streamerName));
const notFound = participants
  .filter((participant) => participant.channelId === null && !matchedNames.has(participant.streamerName))
  .map((participant) => participant.streamerName);

console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
console.log(`Total targets: ${initialTargetCount}`);
console.log("MATCHED");

for (const { streamerName, channelId } of matched) {
  console.log(`- ${streamerName} -> ${channelId}`);
}

console.log("AMBIGUOUS");
console.log("- None (automatic channel search is intentionally not implemented)");
console.log("NOT FOUND");

for (const streamerName of notFound) {
  console.log(`- ${streamerName}`);
}

if (apply && matched.length > 0) {
  const channelIdByStreamerName = new Map(matched.map(({ streamerName, channelId }) => [streamerName, channelId]));
  const updatedParticipants = participants.map((participant) =>
    channelIdByStreamerName.has(participant.streamerName)
      ? { ...participant, channelId: channelIdByStreamerName.get(participant.streamerName) }
      : participant,
  );

  await writeFile(participantsPath, `${JSON.stringify(updatedParticipants, null, 2)}\n`, "utf8");
}

console.log("Summary");
console.log(`matched: ${matched.length}`);
console.log("ambiguous: 0");
console.log(`notFound: ${notFound.length}`);
console.log("conflict: 0");
