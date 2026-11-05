import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMatches } from "../api/fetchMatches";
import type { Match } from "../types/match";

// Что хук отдаёт экрану. Явный тип — чтобы по нему сразу было понятно,
// чем пользоваться, не читая реализацию.
export type UseMatchesResult = {
  // null — данные ещё ни разу не загружались. [] — загрузились, но матчей нет.
  matches: Match[] | null;
  // Текст последней ошибки или null, если последний запрос успешен.
  error: string | null;
  // Идёт ли запрос прямо сейчас (и первая загрузка, и обновление).
  isLoading: boolean;
  // Момент последней успешной загрузки — для «Обновлено N сек назад».
  updatedAt: Date | null;
  // Загрузить заново (кнопка «Обновить», «Повторить», pull-to-refresh).
  reload: () => Promise<void>;
};

export function useMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // true с самого начала: запрос стартует сразу при появлении экрана.
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Номер последнего запущенного запроса.
  // Если нажать «Обновить» два раза подряд, первый запрос может ответить позже второго
  // и перезаписать свежие данные старыми. Поэтому применяем ответ, только если
  // он от самого последнего запроса.
  // useRef, а не useState: номер не влияет на отрисовку, и его изменение
  // не должно вызывать перерендер.
  const lastRequestId = useRef(0);

  // useCallback сохраняет одну и ту же функцию между рендерами.
  // Это нужно, потому что load указана в зависимостях useEffect ниже:
  // новая функция на каждом рендере запускала бы эффект снова и снова.
  const load = useCallback(async () => {
    const requestId = ++lastRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchMatches();
      if (requestId !== lastRequestId.current) return; // устаревший ответ
      // Старые данные не сбрасываем до прихода новых:
      // при обновлении список остаётся на экране.
      setMatches(result);
      setUpdatedAt(new Date());
    } catch (e) {
      if (requestId !== lastRequestId.current) return; // устаревшая ошибка
      // В catch прилетает unknown: бросить можно что угодно, не только Error.
      setError(e instanceof Error ? e.message : "Не удалось загрузить матчи");
    } finally {
      // finally выполняется и после успеха, и после ошибки —
      // загрузку выключаем в одном месте.
      if (requestId === lastRequestId.current) setIsLoading(false);
    }
  }, []);

  // Первая загрузка при появлении экрана.
  // Эффект не может быть async-функцией (он должен вернуть функцию очистки или ничего),
  // поэтому вызываем async-функцию внутри. void — явный знак, что промис мы не ждём намеренно.
  useEffect(() => {
    void load();
  }, [load]);

  return { matches, error, isLoading, updatedAt, reload: load };
}
