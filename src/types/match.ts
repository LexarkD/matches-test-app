// NOTE: Почкольку нет точного API - контракта, создал доменную модель (гарантированно правильную)
// NOTE: Сервер  → parseMatch → Match (доменная модель) → весь остальной код

export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "unknown";

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  status: MatchStatus;
  // ISO-строка в UTC или null, если дата ещё не назначена (перенесённый матч).
  startsAt: string | null;
  // Минута матча, есть только у идущих матчей.
  minute: number | null;
  home: Team;
  away: Team;
  score: Score | null;
};

export type MatchFilter = "all" | "upcoming" | "finished";
