import type { Match, MatchFilter, MatchStatus, Score } from "../types/match";

//NOTE: Тут находятся чистые функции- статусы, даты, фильтр, сортировка

// ---------- Статусы ----------

// Record<MatchStatus, string> требует перевод для КАЖДОГО статуса.
// Если добавить новый статус в MatchStatus и забыть перевод — TypeScript покажет ошибку.
const STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: "Запланирован",
  live: "Идёт",
  finished: "Завершён",
  postponed: "Перенесён",
  unknown: "Статус неизвестен",
};

// Статус по-русски. У идущего матча добавляем минуту, если она известна.
export function formatStatus(match: Match): string {
  const label = STATUS_LABELS[match.status];
  if (match.status === "live" && match.minute !== null) {
    return `${label} · ${match.minute}′`;
  }
  return label;
}

// ---------- Дата ----------

// Без опции timeZone Intl берёт часовой пояс устройства — это и требуется в задании.
// Форматтер создаём один раз: создание Intl-объекта дороже, чем вызов format.
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

// Превращает строку в Date или null, если даты нет или строка некорректна.
// new Date('мусор') не бросает ошибку, а возвращает Invalid Date — ловим это через NaN.
function toDate(startsAt: string | null): Date | null {
  if (startsAt === null) return null;
  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

// «сб, 11 октября, 16:00» — в часовом поясе устройства.
// Для матча без даты (перенесённого) — понятный текст вместо 1970 года.
export function formatStartsAt(startsAt: string | null): string {
  const date = toDate(startsAt);
  return date ? dateFormatter.format(date) : "Дата уточняется";
}

// ---------- Счёт ----------

// Проверяем именно null: при `if (score)` всё ок, но при проверке полей
// через truthy счёт 0:0 потерялся бы. Явное сравнение с null — без сюрпризов.
export function formatScore(score: Score | null): string {
  return score !== null ? `${score.home} : ${score.away}` : "– : –";
}

// ---------- Фильтр ----------

// Какие статусы попадают в каждую вкладку. 'all' не описываем — там все матчи.
// «Предстоящие» = всё, у чего ещё нет итогового результата:
//   live — ещё идёт, postponed — будет сыгран позже.
// 'unknown' не входит никуда, кроме «Все»: мы не знаем, что это за матч.
const STATUSES_BY_FILTER: Record<
  Exclude<MatchFilter, "all">,
  readonly MatchStatus[]
> = {
  upcoming: ["scheduled", "live", "postponed"],
  finished: ["finished"],
};

export function filterMatches(matches: Match[], filter: MatchFilter): Match[] {
  if (filter === "all") return matches;
  const statuses = STATUSES_BY_FILTER[filter];
  return matches.filter((match) => statuses.includes(match.status));
}

// ---------- Сортировка ----------

// Время начала в миллисекундах; матчи без даты получают Infinity и уходят в конец.
function sortKey(match: Match): number {
  return toDate(match.startsAt)?.getTime() ?? Infinity;
}

// По времени начала, матчи без даты — в конце.
// Копируем массив: sort меняет исходный, а данные из стейта мутировать нельзя.
export function sortByStartTime(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const timeA = sortKey(a);
    const timeB = sortKey(b);
    // Infinity - Infinity = NaN, а sort с NaN ведёт себя непредсказуемо.
    // Поэтому равные ключи (в том числе два матча без даты) обрабатываем отдельно.
    if (timeA === timeB) return 0;
    return timeA - timeB;
  });
}
