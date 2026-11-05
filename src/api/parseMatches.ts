import type { Match, MatchStatus, Score, Team } from "../types/match";

const KNOWN_STATUSES: readonly MatchStatus[] = [
  "scheduled",
  "live",
  "finished",
  "postponed",
];

// Type guard: если вернул true, TypeScript считает value объектом
// и разрешает обращаться к его полям.
// Проверка на null обязательна: typeof null === 'object'.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Неизвестный статус (например, 'cancelled') не роняет экран, а становится 'unknown'.
// `as` здесь безопасен: мы сразу же проверяем, что значение действительно в списке.
function parseStatus(value: unknown): MatchStatus {
  return KNOWN_STATUSES.includes(value as MatchStatus)
    ? (value as MatchStatus)
    : "unknown";
}

// Без названия команду показать нельзя — возвращаем null.
// id и city не критичны — подставляем запасные значения.
function parseTeam(value: unknown): Team | null {
  if (!isRecord(value) || typeof value.name !== "string") return null;
  return {
    id: typeof value.id === "string" ? value.id : value.name,
    name: value.name,
    city: typeof value.city === "string" ? value.city : "",
  };
}

// Проверяем typeof, а не truthy: счёт 0:0 — валидный, ноль не должен отбрасываться.
// null означает «счёта ещё нет» (матч не начался).
function parseScore(value: unknown): Score | null {
  if (
    !isRecord(value) ||
    typeof value.home !== "number" ||
    typeof value.away !== "number"
  ) {
    return null;
  }
  return { home: value.home, away: value.away };
}

// Дата: строка или null. Перенесённый матч приходит с startsAt: null.
// Корректность самой строки (валидная ли это дата) проверяется при форматировании.
function parseStartsAt(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

// Минута есть только у идущих матчей. Отсутствующее поле (undefined)
// приводим к null, чтобы в модели было одно «пустое» значение.
function parseMinute(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

// Один матч. Возвращает null, если без каких-то полей матч бесполезен:
// id нужен для ключей списка и избранного, команды — для отображения.
export function parseMatch(raw: unknown): Match | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;

  const home = parseTeam(raw.home);
  const away = parseTeam(raw.away);
  if (!home || !away) return null;

  return {
    id: raw.id,
    status: parseStatus(raw.status),
    startsAt: parseStartsAt(raw.startsAt),
    minute: parseMinute(raw.minute),
    home,
    away,
    score: parseScore(raw.score),
  };
}

// Весь ответ сервера.
// Если структура неверна целиком — бросаем ошибку (экран покажет «Повторить»).
// Если сломан отдельный матч — пропускаем его, чтобы не терять остальные.
export function parseMatches(data: unknown): Match[] {
  if (!isRecord(data) || !Array.isArray(data.matches)) {
    throw new Error("Неожиданный формат ответа сервера");
  }

  return (
    data.matches
      .map(parseMatch)
      // Type guard в filter убирает null не только из массива, но и из типа:
      // без него результат был бы (Match | null)[].
      .filter((match): match is Match => match !== null)
  );
}
