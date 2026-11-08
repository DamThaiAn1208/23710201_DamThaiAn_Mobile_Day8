import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDebounce } from "../hooks/useDebounce";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

// Nút −/+ dùng STATE CỤC BỘ để phản hồi ngay, "lắng" 300 ms rồi mới ghi vào store
export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  // dừng bấm 300 ms → đẩy lên store (một lần)
  useEffect(() => {
    if (debouncedQty !== item.quantity) onChangeQty(item.bookId, debouncedQty);
  }, [debouncedQty]); // eslint-disable-line react-hooks/exhaustive-deps

  // store đổi từ nơi khác (nạp từ AsyncStorage, thêm từ trang chi tiết…) → đồng bộ lại
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  const canDec = qty > 1;
  const canInc = qty < item.stock; // không vượt tồn kho

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <View style={styles.stepper}>
          <Pressable style={[styles.stepBtn, !canDec && styles.stepOff]} disabled={!canDec} onPress={() => setQty((q) => q - 1)} accessibilityLabel="Giảm">
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable style={[styles.stepBtn, !canInc && styles.stepOff]} disabled={!canInc} onPress={() => setQty((q) => q + 1)} accessibilityLabel="Tăng">
            <Text style={styles.stepText}>+</Text>
          </Pressable>
          <Text style={styles.stock}>Còn {item.stock}</Text>
        </View>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.indigo, alignItems: "center", justifyContent: "center" },
  stepOff: { opacity: 0.3 },
  stepText: { color: colors.indigo, fontWeight: "800", fontSize: 16, lineHeight: 18 },
  qty: { fontWeight: "800", color: colors.navy, fontSize: 16, minWidth: 20, textAlign: "center" },
  stock: { color: colors.muted, fontSize: 12, marginLeft: 4 },
  trash: { fontSize: 22 },
});
