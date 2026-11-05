import { MATCHES_URL } from "../config";
import type { Match } from "../types/match";
import { parseMatches } from "./parseMatches";

// NOTE: Загружает матчи тура с сервера. Отвечает только за сеть: запрос, проверка HTTP-статуса, чтение JSON.

export async function fetchMatches(): Promise<Match[]> {
  // no-store: кнопка «Обновить» должна получать свежие данные, а не ответ из кеша браузера.
  const response = await fetch(MATCHES_URL, { cache: "no-store" });

  // fetch бросает ошибку только при отсутствии сети.
  // 404 и 500 для него — «успешный» ответ, поэтому проверяем сами.
  if (!response.ok) {
    throw new Error(`Сервер ответил с ошибкой (${response.status})`);
  }

  // Статус 200 ещё не гарантирует JSON: например, сервер может вернуть HTML-страницу.
  // Без этой обёртки пользователь увидел бы «Unexpected token '<'...».
  // Проверять Content-Type нельзя: raw.githubusercontent отдаёт JSON как text/plain.
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Сервер вернул данные в неверном формате");
  }

  // NOTE: Разбор данных — в parseMatches.
  return parseMatches(data);
}
