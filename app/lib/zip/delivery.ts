// Delivery estimate math. Pure functions, no React or DOM.
// Calendar math uses UTC-midnight Dates that stand for calendar days in the cutoff time zone.

export type DayRange = { min: number; max: number };

export type DeliveryOverrides = {
  handlingDaysMin?: number | undefined;
  handlingDaysMax?: number | undefined;
  transitExtraDays?: number | undefined;
};

// Store-wide defaults. Edit these numbers. Per-product metafields override handling and add transit days.
export const DELIVERY_CONFIG: {
  timeZone: string;
  cutoffHour: number;
  handlingDays: DayRange;
  transitDays: DayRange;
} = {
  timeZone: "America/Los_Angeles",
  cutoffHour: 14, // orders before 2 PM on a business day start counting that day
  handlingDays: { min: 1, max: 2 },
  transitDays: { min: 5, max: 9 },
};

const DAY_MS = 86_400_000;

const utcDay = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

function nthWeekday(year: number, month: number, weekday: number, n: number) {
  const first = utcDay(year, month, 1);
  const offset = (7 + weekday - first.getUTCDay()) % 7;
  return utcDay(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number) {
  const last = utcDay(year, month + 1, 0);
  const offset = (7 + last.getUTCDay() - weekday) % 7;
  return utcDay(year, month, last.getUTCDate() - offset);
}

// Saturday holidays are observed on Friday, Sunday holidays on Monday.
function observed(date: Date) {
  const dow = date.getUTCDay();
  if (dow === 6) return new Date(date.getTime() - DAY_MS);
  if (dow === 0) return new Date(date.getTime() + DAY_MS);
  return date;
}

const holidayCache = new Map<number, Set<string>>();

function holidays(year: number) {
  let set = holidayCache.get(year);
  if (!set) {
    set = new Set(
      [
        observed(utcDay(year, 0, 1)), // New Year's Day
        nthWeekday(year, 0, 1, 3), // Martin Luther King Jr. Day
        nthWeekday(year, 1, 1, 3), // Presidents Day
        lastWeekday(year, 4, 1), // Memorial Day
        observed(utcDay(year, 5, 19)), // Juneteenth
        observed(utcDay(year, 6, 4)), // Independence Day
        nthWeekday(year, 8, 1, 1), // Labor Day
        nthWeekday(year, 9, 1, 2), // Columbus Day
        observed(utcDay(year, 10, 11)), // Veterans Day
        nthWeekday(year, 10, 4, 4), // Thanksgiving
        observed(utcDay(year, 11, 25)), // Christmas
      ].map(dayKey),
    );
    holidayCache.set(year, set);
  }
  return set;
}

function isHoliday(date: Date) {
  const year = date.getUTCFullYear();
  const key = dayKey(date);
  // A Saturday New Year's Day is observed on Dec 31 of the previous year.
  return holidays(year).has(key) || (date.getUTCMonth() === 11 && holidays(year + 1).has(key));
}

export function isBusinessDay(date: Date) {
  const dow = date.getUTCDay();
  return dow !== 0 && dow !== 6 && !isHoliday(date);
}

export function addBusinessDays(date: Date, count: number) {
  let current = date;
  let remaining = count;
  while (remaining > 0) {
    current = new Date(current.getTime() + DAY_MS);
    if (isBusinessDay(current)) remaining -= 1;
  }
  return current;
}

function zonedParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { day: utcDay(get("year"), get("month") - 1, get("day")), hour: get("hour") };
}

export function resolveHandling(overrides?: DeliveryOverrides): DayRange {
  const base = DELIVERY_CONFIG.handlingDays;
  const min =
    overrides?.handlingDaysMin ?? Math.min(base.min, overrides?.handlingDaysMax ?? base.min);
  const max = overrides?.handlingDaysMax ?? Math.max(base.max, min);
  return { min, max: Math.max(min, max) };
}

const label = (range: DayRange) =>
  range.min === range.max ? String(range.min) : `${range.min}-${range.max}`;

// Day ranges for the "no ZIP yet" message, e.g. { handling: "1-2", transit: "5-9" }.
export function genericRanges(overrides?: DeliveryOverrides) {
  const extra = overrides?.transitExtraDays ?? 0;
  const transit = DELIVERY_CONFIG.transitDays;
  return {
    handling: label(resolveHandling(overrides)),
    transit: label({ min: transit.min + extra, max: transit.max + extra }),
  };
}

// Handling days count from the order day (next business day if after the cutoff or on a closed day),
// then transit days count from the ship day. Returned dates are UTC-midnight calendar days.
export function estimateDelivery(overrides?: DeliveryOverrides, now: Date = new Date()) {
  const { day, hour } = zonedParts(now, DELIVERY_CONFIG.timeZone);
  const start =
    isBusinessDay(day) && hour < DELIVERY_CONFIG.cutoffHour ? day : addBusinessDays(day, 1);
  const handling = resolveHandling(overrides);
  const extra = overrides?.transitExtraDays ?? 0;
  const transit = DELIVERY_CONFIG.transitDays;
  return {
    arriveMin: addBusinessDays(addBusinessDays(start, handling.min), transit.min + extra),
    arriveMax: addBusinessDays(addBusinessDays(start, handling.max), transit.max + extra),
  };
}
