# Buổi 8 — Trả lời câu hỏi bổ sung

## 1. Cờ ready

Nếu bỏ điều kiện `ready` trong `useAutoPersist`:

1. **Render đầu tiên:** store vừa tạo nên `cart.items = []`. Effect của `useAutoPersist` chạy ngay và ghi `[]` vào `@bookstore/cart`.
2. Cùng lúc đó, effect đọc trong `usePersistence` vẫn đang chờ `loadJSON(CART_KEY)`. Lệnh ghi `[]` ở bước 1 có thể hoàn tất trước khi đọc xong, nên lần đọc nhận về mảng rỗng.
3. **Render sau khi đọc xong:** `hydrateCart` nạp mảng rỗng, và giỏ hàng cũ đã mất.

Cờ `ready` chỉ bật sau khi đọc xong, nên lần ghi đầu tiên luôn diễn ra sau khi dữ liệu cũ đã nằm trong store.

## 2. Token giả

Hai điểm không an toàn:
- Mật khẩu lưu dạng thô trong `db.json`, và app tải user về rồi tự so sánh. Ai xem được request là thấy cả mật khẩu.
- Token do app tự tạo, server không ký và không kiểm tra, nên ai cũng làm giả được và token không bao giờ hết hạn.

Ở hệ thống thật, **server** kiểm tra mật khẩu (so với bản đã băm bằng bcrypt hoặc argon2) rồi cấp token có chữ ký và thời hạn (JWT hoặc access + refresh token). App lưu token trong **expo-secure-store** (Keychain trên iOS, Keystore trên Android) thay cho AsyncStorage, vì AsyncStorage không được mã hoá.

## 3. Hai effect trong CartItemRow

Nếu bỏ effect `setQty(item.quantity)`, số trên nút chỉ lấy từ `useState(item.quantity)` ở lần render đầu. Số đó sẽ lệch khi store đổi từ nơi khác, ví dụ:
- Đang mở tab Giỏ hàng, sang trang Chi tiết bấm **Thêm vào giỏ** thêm lần nữa. Store tăng lên 2 nhưng nút vẫn hiện 1.
- Mở app khi `hydrateCart` chạy sau lần render đầu của dòng đó, hoặc xoá rồi thêm lại cùng sản phẩm.

Tệ hơn, khi người dùng bấm −/+ sau đó, debounce sẽ đẩy con số cũ lên store và ghi đè số đúng.

## 4. Một nguồn state

Nếu mỗi `HeartButton` tự giữ `useState`, mỗi chỗ sẽ có một bản tim riêng. Thả tim ở lưới Home rồi mở trang Chi tiết, tim ở đó vẫn trắng. Màn Yêu thích cũng không biết cuốn nào đã được thả tim. Tải lại app thì mất hết.

Với store `wishlist`, có **một mảng `ids` duy nhất**. Mọi `HeartButton` đều đọc `isFavorite(bookId)` từ đó và ghi bằng `toggle`. Khi store đổi, mọi component đang dùng `useWishlist()` cùng render lại nên luôn khớp nhau. `useAutoPersist` cũng chỉ cần lưu đúng một mảng.

## 5. Code bổ sung: hiện/ẩn mật khẩu

```tsx
const [showPassword, setShowPassword] = useState(false);

<View>
  <FormField label="Mật khẩu" value={password} onChangeText={setPassword}
    error={errors.password} secureTextEntry={!showPassword} style={{ paddingRight: 44 }} />
  <Pressable style={styles.eye} onPress={() => setShowPassword((v) => !v)}
    accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
    <Text style={[styles.eyeText, showPassword && styles.eyeOn]}>👁</Text>
  </Pressable>
</View>
```

Ảnh kết quả nằm trong file KetQua_Buoi8.docx, ở mục Câu 5.
