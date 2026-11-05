import { useEffect } from "react";
import { Text, View } from "react-native";
import { fetchMatches } from "../api/fetchMatches";
import { useMatches } from "../hooks/useMatches";

// ВРЕМЕННЫЙ экран для проверки — потом заменим на настоящий.
export function MatchesScreen() {
  const { matches, error, isLoading, updatedAt, reload } = useMatches();

  // Прямая проверка fetchMatches, без хука.
  useEffect(() => {
    fetchMatches()
      .then((result) => {
        console.log("[fetchMatches] ok, матчей:", result.length);
        console.table(
          result.map((m) => ({
            id: m.id,
            status: m.status,
            startsAt: m.startsAt,
            minute: m.minute,
            score: m.score ? `${m.score.home}:${m.score.away}` : null,
          }))
        );
      })
      .catch((e) => console.error("[fetchMatches] ошибка:", e));
  }, []);

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>isLoading: {String(isLoading)}</Text>
      <Text>error: {error ?? "—"}</Text>
      <Text>matches: {matches === null ? "null" : matches.length}</Text>
      <Text>updatedAt: {updatedAt?.toLocaleTimeString() ?? "—"}</Text>
      <Text onPress={reload} style={{ color: "blue" }}>
        [ reload ]
      </Text>
    </View>
  );
}
