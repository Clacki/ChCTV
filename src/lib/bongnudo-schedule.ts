export type ScheduleStatus = "OPEN" | "CLOSED" | "DAY_OFF";

export type BongnudoSchedule = {
  status: ScheduleStatus;
  operatingDate: string;
};

const KOREA_TIME_ZONE = "Asia/Seoul";

function getKoreaDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);

  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour") };
}

function formatOperatingDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getBongnudoScheduleStatus(now: Date = new Date()): BongnudoSchedule {
  const { year, month, day, hour } = getKoreaDateParts(now);
  const operatingDate = new Date(Date.UTC(year, month - 1, day));
  const isOperatingHours = hour >= 18 || hour < 3;

  if (hour < 3) {
    operatingDate.setUTCDate(operatingDate.getUTCDate() - 1);
  }

  if (!isOperatingHours) {
    return { status: "CLOSED", operatingDate: formatOperatingDate(operatingDate) };
  }

  if (operatingDate.getUTCDay() === 5) {
    return { status: "DAY_OFF", operatingDate: formatOperatingDate(operatingDate) };
  }

  return { status: "OPEN", operatingDate: formatOperatingDate(operatingDate) };
}
