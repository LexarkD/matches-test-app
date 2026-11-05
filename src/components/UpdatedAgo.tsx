import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
// NOTE: Было: интервал запоминал seconds = 0 из первого рендера и всегда ставил 1,
// проп since не использовался, интервал не очищался.
export function UpdatedAgo({ since }: Props) {
  // Храним текущее время, а не счётчик.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Колбэк не читает значения из рендера — замыкание на старый стейт ему не страшно.
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    // Очистка: интервал останавливается при размонтировании.
    return () => clearInterval(intervalId);
  }, []);

  // Секунды вычисляем от since при каждом рендере: новый since сразу даёт 0.
  // Math.max защищает от «-1 сек» сразу после обновления.
  const seconds = Math.max(0, Math.floor((now - since.getTime()) / 1000));

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: "#6b7280",
  },
});
