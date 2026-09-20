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

  it("keeps the confirmed first through third admission RP names and filters the confirmed Black Water gang members", () => {
    const participantsByStreamerName = new Map(getParticipants().map((participant) => [participant.streamerName, participant]));

    const confirmedRpNames = {
      기령: "기세령", 다주: "감도이", "미사키 하루": "하게", "쇼코코 도리": "도라희", 슈향: "오왕식",
      유할매: "일오삼", 청목: "청송이", 쵸꾸미: "조규미", "테리 눈나": "박대리", 하네: "쌀먹쥐",
      김아테: "김즥진", 나나양: "나마자", 니르: "오뒤세", 두니주니: null, 디온: "머라카노",
      마무: "김개똥", 망징이: "망키호테", "시아 이르엘린": "탈옥순", 초깨비: "야근중", 쿠뽀미: "구루마",
      나는벌레: "찰리박", 두간: null, 밑줄: "긴빠이더맨", 백은하: "백감동", 요시론: "원장선생님",
      우말: "안경척", 애플: "엥무새", 이도나: "나군기", 조이냥: null, 토꽁: "토나와",
    };

    for (const [streamerName, rpName] of Object.entries(confirmedRpNames)) {
      expect(participantsByStreamerName.get(streamerName)).toMatchObject({ rpName });
    }

    for (const streamerName of ["나는벌레", "두간", "밑줄", "백은하", "요시론", "우말", "애플", "이도나", "조이냥", "토꽁"]) {
      expect(participantsByStreamerName.get(streamerName)).toMatchObject({ channelId: null });
    }

    expect(filterParticipants({ affiliations: ["흑수협"] }).map((participant) => participant.rpName).sort()).toEqual([
      "감도이",
      "먼정학",
      "새아빠",
      "최초면",
      "흑수염",
    ]);
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
