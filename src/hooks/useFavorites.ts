import { useCallback, useState } from "react";

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // includes возвращает true/false - входит ли идентификатор в избранное;

  //Исправлена ошибка: indexOf возвращает позицию элемента или -1, если элемента нет. Boolean(indexOf): -1 («не найден») давал true, а 0 (первый в списке) — false.
  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  // Создаём НОВЫЙ массив вместо мутации старого.
  // Было push/splice напрямую мутирует состояние favorites + setFavorites(на тот же массив favorites): ссылка не менялась,
  // React считал, что стейт не изменился, и не перерисовывал экран.
  // Функциональное обновление (prev => ...) берёт актуальное значение,
  // даже если нажать несколько раз подряд до перерисовки.
  const toggle = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { favorites, isFavorite, toggle };
}
