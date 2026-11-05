import { MATCHES_URL } from "../config";
import type { Match } from "../types/match";
import { parseMatches } from "./parseMatches";

// NOTE: Загружает матчи тура с сервера. Отвечает только за сеть: запрос, проверка HTTP-статуса, чтение JSON.

export async function fetchMatches(): Promise<Match[]> {
  const response = await fetch(MATCHES_URL);

  // fetch бросает ошибку только при отсутствии сети.
  // 404 и 500 для него — «успешный» ответ, поэтому проверяем сами.
  if (!response.ok) {
    throw new Error(`Сервер ответил с ошибкой (${response.status})`);
  }

  const data: unknown = await response.json();

  // NOTE: Разбор данных — в parseMatches.
  return parseMatches(data);
}
