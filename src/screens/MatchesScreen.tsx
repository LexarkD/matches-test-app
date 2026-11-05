import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FilterTabs } from "../components/FilterTabs";
import { MatchCard } from "../components/MatchCard";
import { UpdatedAgo } from "../components/UpdatedAgo";
import { useMatches } from "../hooks/useMatches";
import type { MatchFilter } from "../types/match";
import { filterMatches, sortByStartTime } from "../utils/matches";
import { useFavorites } from "../hooks/useFavorites";

// NOTE: Экран собирает всё вместе. Данные и их состояния — в useMatches,
// форматирование — в utils, отображение одного матча — в MatchCard.
// Здесь только решение «что показать» и связка компонентов.

export function MatchesScreen() {
  const { matches, error, isLoading, updatedAt, reload } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>("all");

  // Пересчитываем список только когда меняются данные или фильтр,
  // а не на каждом рендере (например, при смене isLoading).
  const visibleMatches = useMemo(
    () => (matches ? filterMatches(sortByStartTime(matches), filter) : []),
    [matches, filter]
  );

  // ---------- Первая загрузка: данных ещё нет ----------
  if (matches === null && isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Загружаем матчи…</Text>
      </View>
    );
  }

  // ---------- Первая загрузка упала: показать нечего ----------
  if (matches === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Не удалось загрузить матчи</Text>
        {error && <Text style={styles.hint}>{error}</Text>}
        <Pressable
          onPress={reload}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- Данные есть (возможно, идёт обновление или оно упало) ----------

  // Два разных пустых состояния: пустой тур и пустая вкладка фильтра.
  const emptyText =
    matches.length === 0
      ? "В этом туре пока нет матчей"
      : "Нет матчей в этой категории";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      <View style={styles.toolbar}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        {/* Кнопка нужна обязательно: pull-to-refresh в браузере не работает */}
        <Pressable
          onPress={reload}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Обновляем…" : "Обновить"}
          </Text>
        </Pressable>
      </View>

      {/* Обновление упало, но старые данные остались — показываем и их, и ошибку */}
      {error && (
        <Text style={styles.errorBanner}>Не удалось обновить: {error}</Text>
      )}

      <FilterTabs value={filter} onChange={setFilter} />

      <FlatList
        data={visibleMatches}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggle(item.id)}
          />
        )}
        // FlatList перерисовывает строки, только когда меняется data.
        // Избранное — внешнее для списка состояние, поэтому сообщаем о нём через extraData.
        extraData={favorites}
        refreshing={isLoading}
        onRefresh={reload}
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  hint: { color: "#6b7280", textAlign: "center" },
  errorTitle: { fontSize: 18, fontWeight: "600" },
  errorBanner: { color: "#b91c1c", marginBottom: 8 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 32 },
});
