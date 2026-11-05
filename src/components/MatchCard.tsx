import { StyleSheet, Text, View } from "react-native";
import type { Match } from "../types/match";
import { formatScore, formatStartsAt, formatStatus } from "../utils/matches";

// NOTE: Карточка только отображает матч. Вся логика форматирования — в utils/matches,
// поэтому здесь нет условий про null, 0:0 или неизвестный статус.

type Props = {
  match: Match;
};

export function MatchCard({ match }: Props) {
  const isLive = match.status === "live";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatStartsAt(match.startsAt)}</Text>
        <Text style={[styles.status, isLive && styles.statusLive]}>
          {formatStatus(match)}
        </Text>
        {/* Часть 2: здесь будет FavoriteButton */}
      </View>

      <View style={styles.teams}>
        {/* numberOfLines: длинные названия («Пари Нижний Новгород»)
            переносятся максимум на 2 строки и не ломают вёрстку */}
        <Text style={styles.team} numberOfLines={2}>
          {match.home.name}
        </Text>
        <Text style={styles.score}>{formatScore(match.score)}</Text>
        <Text style={[styles.team, styles.teamAway]} numberOfLines={2}>
          {match.away.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  // flexShrink: длинная дата сжимается, а не выталкивает статус за край
  date: { fontSize: 13, color: "#6b7280", flexShrink: 1 },
  status: { fontSize: 13, color: "#374151" },
  statusLive: { color: "#ef3124", fontWeight: "600" },
  teams: { flexDirection: "row", alignItems: "center" },
  // flex: 1 у обеих команд — они делят ширину поровну, счёт ровно по центру
  team: { flex: 1, fontSize: 16 },
  teamAway: { textAlign: "right" },
  score: { fontSize: 18, fontWeight: "700", marginHorizontal: 12 },
});
