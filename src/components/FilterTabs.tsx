import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MatchFilter } from "../types/match";

// NOTE: Список вкладок описан данными, а не тремя одинаковыми кусками JSX.

const OPTIONS: readonly { value: MatchFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "upcoming", label: "Предстоящие" },
  { value: "finished", label: "Завершённые" },
];

type Props = {
  value: MatchFilter;
  onChange: (value: MatchFilter) => void;
};

// Контролируемый компонент: сам ничего не хранит,
// выбранное значение и его смена приходят от родителя.
export function FilterTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            // Для скринридеров: это кнопка, и она сейчас выбрана/не выбрана
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
  tabSelected: { backgroundColor: "#111827" },
  label: { fontSize: 14, color: "#374151" },
  labelSelected: { color: "#fff" },
});
