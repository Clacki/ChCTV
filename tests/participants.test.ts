import { describe, expect, it } from "vitest";

import participantData from "../src/data/participants.json";
import {
  filterParticipants,
  getParticipants,
  matchesParticipantFilters,
  searchParticipants,
} from "../src/lib/participants";

describe("participant catalog", () => {
  it("exposes the confirmed participant data", () => {
    expect(getParticipants()).toContainEqual({
      streamerName: "달콤레나",
      rpName: "종조이",
      channelId: "a67b328bcc8eea4451ccfa754bc19ae1",
      affiliations: [{ type: "public", name: "교통정비공사", role: "기사" }],
      groups: ["인챈트"],
      tags: [],
      aliases: ["죵쬐", "저그"],
    });
  });

  it.each(["달콤레나", "종조이", "죵쬐"])(
    "searches every discovery field: %s",
    (query) => {
      expect(searchParticipants(query)).toContainEqual(
        expect.objectContaining({ streamerName: "달콤레나" }),
      );
    },
  );

  it("filters by one affiliation or multiple affiliations within the same facet", () => {
    const hasAnyAffiliation = (names: readonly string[]) => (participant: typeof participantData[number]) =>
      participant.affiliations.some((affiliation) => names.includes(affiliation.name));

    expect(filterParticipants({ affiliations: ["교통정비공사"] })).toEqual(
      participantData.filter(hasAnyAffiliation(["교통정비공사"])),
    );
    expect(filterParticipants({ affiliations: ["봉누도경찰청", "병원"] })).toEqual(
      participantData.filter(hasAnyAffiliation(["봉누도경찰청", "병원"])),
    );
  });

  it("combines affiliation, group, and tag facets with AND", () => {
    const participant = {
      streamerName: "복수 소속",
      rpName: null,
      channelId: null,
      affiliations: [
        { type: "gang", name: "백호파", role: "간부" },
        { type: "business", name: "봉누카페", role: "직원" },
      ],
      groups: ["스텔라이브"],
      tags: ["버튜버"],
      aliases: [],
    };

    expect(matchesParticipantFilters(participant, { affiliations: ["백호파", "봉누카페"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { groups: ["스텔라이브"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { tags: ["버튜버"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["백호파"], groups: ["스텔라이브"], tags: ["버튜버"] })).toBe(true);
    expect(matchesParticipantFilters(participant, { affiliations: ["백호파"], groups: ["다른그룹"] })).toBe(false);
  });

  it("applies search and facet filters together", () => {
    const matchingParticipants = searchParticipants("종조이").filter((participant) =>
      matchesParticipantFilters(participant, { affiliations: ["교통정비공사"] }),
    );

    expect(matchingParticipants).toContainEqual(
      expect.objectContaining({ streamerName: "달콤레나" }),
    );
  });

  it("returns the complete source catalog without dropping participant metadata", () => {
    const participants = getParticipants();

    expect(participants).toEqual(participantData);
    expect(filterParticipants({})).toEqual(participantData);
  });

  it("reflects confirmed roster corrections without treating known RP names as unknown", () => {
    const participantsByStreamerName = new Map(getParticipants().map((participant) => [participant.streamerName, participant]));

    expect(participantsByStreamerName.get("쇼코코 도리")).toMatchObject({ rpName: "도라희" });
    expect(participantsByStreamerName.get("버찌")).toMatchObject({ rpName: "찹츄르" });
    expect(participantsByStreamerName.get("셀리")).toMatchObject({ rpName: "안망고" });
    expect(participantsByStreamerName.get("김아테")).toMatchObject({ rpName: "김즥진" });
    expect(participantsByStreamerName.get("니르")).toMatchObject({ rpName: "오뒤세" });
    expect(participantsByStreamerName.get("마무")).toMatchObject({ rpName: "김개똥" });
    expect(participantsByStreamerName.get("망징이")).toMatchObject({ rpName: "망키호테" });
    expect(participantsByStreamerName.get("시아 이르엘린")).toMatchObject({ rpName: "탈옥순" });
    expect(participantsByStreamerName.get("초깨비")).toMatchObject({ rpName: "야근중" });
    expect(participantsByStreamerName.get("쿠뽀미")).toMatchObject({ rpName: "구루마" });
    expect(participantsByStreamerName.get("꽃빈")).toMatchObject({ rpName: "아이현" });
    expect(participantsByStreamerName.get("러너")).toMatchObject({ rpName: "윤대길" });
    expect(participantsByStreamerName.get("서새봄")).toMatchObject({ rpName: "서대녀" });
    expect(participantsByStreamerName.get("나나양")).toMatchObject({ rpName: "나마자" });
    expect(participantsByStreamerName.get("두니주니")).toMatchObject({ rpName: null });
    expect(participantsByStreamerName.get("디온")).toMatchObject({ rpName: "머라카노" });

    for (const streamerName of ["권민권", "김돌돌", "김츄", "댕균", "체리아씨", "하쿠텐 후와"]) {
      expect(participantsByStreamerName.get(streamerName)?.affiliations).toContainEqual(
        { type: "public", name: "봉누도경찰청", role: "경찰" },
      );
    }
  });

  it("keeps the confirmed first through third admission RP names and filters the confirmed Black Water business members", () => {
    const participantsByStreamerName = new Map(getParticipants().map((participant) => [participant.streamerName, participant]));

    const confirmedRpNames = {
      기령: "기세령", 다주: "감도이", "미사키 하루": "하게", "쇼코코 도리": "도라희", 슈향: "오왕식",
      유할매: "일오삼", 청목: "청송이", 쵸꾸미: "조규미", "테리 눈나": "박대리", 하네: "쌀먹쥐",
      김아테: "김즥진", 나나양: "나마자", 니르: "오뒤세", 두니주니: null, 디온: "머라카노",
      마무: "김개똥", 망징이: "망키호테", "시아 이르엘린": "탈옥순", 초깨비: "야근중", 쿠뽀미: "구루마",
      나는벌레: "찰리박", 두간: "두반장", 밑줄: "긴빠이더맨", 백은하: "백감동", 요시론: "원장선생님",
      우말: "안경척", 애플: "엥무새", 이도나: "나군기", 조이냥: "조네오", 토꽁: "토나와",
    };

    for (const [streamerName, rpName] of Object.entries(confirmedRpNames)) {
      expect(participantsByStreamerName.get(streamerName)).toMatchObject({ rpName });
    }

    const confirmedChannelIds = {
      나는벌레: "1a2fe478d52f44d5621f005c91dfa487", 두간: "07bba51bf0a233f3f44b54431704b190",
      밑줄: "16fc49ff5ba7ec5d25a5a978cee3bdda", 백은하: "85eb67daa4822df8a31f1cdbd74c34da",
      요시론: "d510a81b4e261ba7fca8894ac7fc601a", 우말: "00c4d5bbb8b8b874732066dc7e49b47a",
      애플: "e291f5f835f5f7b206413227cf9186da", 이도나: "d81d59f432489a1f9e2af897bf8eab7a",
      조이냥: "a9983d950a0ba4471b3d60bb9c5e0dd7", 토꽁: "5b78a2610119f246785e67761edf2125",
    };

    for (const [streamerName, channelId] of Object.entries(confirmedChannelIds)) {
      expect(participantsByStreamerName.get(streamerName)).toMatchObject({ channelId });
    }

    expect(filterParticipants({ affiliations: ["흑수협"] }).map((participant) => participant.rpName).sort()).toEqual([
      "감도이",
      "골아파덕",
      "먼정학",
      "새아빠",
      "이랑",
      "최초면",
      "흑수염",
    ]);
  });

  it("filters the confirmed Blacklist and Bon Hater gang members", () => {
    expect(filterParticipants({ affiliations: ["흑수협"] }).every((participant) =>
      participant.affiliations.some((affiliation) => affiliation.type === "business" && affiliation.name === "흑수협"),
    )).toBe(true);
    expect(filterParticipants({ affiliations: ["블랙리스트"] }).map((participant) => participant.channelId).sort()).toEqual([
      "0dcec72cd1033032a77dfced6c0c91f8",
      "2e64626093fbf9777311b5602a94af82",
      "416d86cee659cca1320eac67f0e6fc22",
      "5d53f8fa5bef9b1bd4dc884f9907c079",
      "8f433fe01faac742a5cf0819e42397de",
      "981f18d74bceeb1972197209b7400fc4",
      "a46c7bc953605de49b192a4049328274",
      "a6c4ddb09cdb160478996007bff35296",
    ]);
    expect(filterParticipants({ affiliations: ["본헤이터"] }).map((participant) => participant.channelId).sort()).toEqual([
      "1703c76cfc62ebee9254a6fd2ef83b2a",
      "1963bb156cd9a572916827d4fef7516e",
      "343fc0e877aa8ca0cad5106b33d6fa95",
      "65c3035bdc598c81f15a8fe0e958b3ce",
      "6ddd2ff1d43ae1e23e04e72409e40d84",
      "75bd327f6ba6f57106c79fe3f2c3d19f",
      "a048127622edd6c3ee8e477471a1d823",
      "ead28b71f3fdd5e8b52321825217a065",
    ]);
  });

  it.each([
    ["business", "튜닝소", 7],
    ["business", "씨드머니 농장", 8],
    ["business", "카페 해영", 8],
    ["business", "게이스시", 6],
    ["business", "로동당 농장", 8],
    ["gang", "부산갈매기", 8],
    ["gang", "미친개", 8],
    ["gang", "피트스탑", 6],
    ["gang", "네오경찰", 7],
    ["gang", "유젖무죄", 4],
    ["gang", "느와르", 7],
  ])("keeps the confirmed %s %s affiliation members", (type, affiliation, expectedCount) => {
    const participants = filterParticipants({ affiliations: [affiliation] });

    expect(participants).toHaveLength(expectedCount);
    expect(participants.every((participant) => participant.affiliations.some((item) => item.type === type && item.name === affiliation))).toBe(true);
  });

  it("contains no invalid or duplicate participant identifiers", () => {
    const participants = getParticipants();
    const streamerNames = participants.map((participant) => participant.streamerName);
    const channelIds = participants
      .map((participant) => participant.channelId)
      .filter((channelId): channelId is string => channelId !== null);

    expect(streamerNames.every(Boolean)).toBe(true);
    expect(new Set(streamerNames)).toHaveLength(streamerNames.length);
    expect(new Set(channelIds)).toHaveLength(channelIds.length);
    expect(channelIds.every((channelId) => /^[0-9a-f]{32}$/.test(channelId))).toBe(true);
    expect(participants.every((participant) => participant.rpName !== "***")).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.aliases))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.affiliations))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.groups))).toBe(true);
    expect(participants.every((participant) => Array.isArray(participant.tags))).toBe(true);
    expect(participants.every((participant) => participant.affiliations.every((affiliation) => Boolean(affiliation.type && affiliation.name)))).toBe(true);
    expect(participants.every((participant) => participant.groups.every((group) => group.trim().length > 0))).toBe(true);
    expect(participants.every((participant) => participant.affiliations.every((affiliation) => affiliation.name.trim().length > 0))).toBe(true);
    expect(participants.every((participant) => participant.affiliations.every((affiliation) => affiliation.type !== "public" || affiliation.role?.trim()))).toBe(true);
    expect(participants.every((participant) => new Set(participant.groups).size === participant.groups.length)).toBe(true);
    expect(participants.every((participant) => new Set(participant.affiliations.map((affiliation) => `${affiliation.type}:${affiliation.name}:${affiliation.role ?? ""}`)).size === participant.affiliations.length)).toBe(true);
  });
});
