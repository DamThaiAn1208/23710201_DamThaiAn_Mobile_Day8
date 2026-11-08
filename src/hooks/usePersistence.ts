import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";
import { clearAuth, loadAuth, saveAuth } from "../storage/authStorage"; // đã viết sẵn
import { loadJSON } from "../storage/storage"; // đã viết sẵn
import { useAutoPersist } from "./useAutoPersist";
import { CartItem } from "../types";

export const CART_KEY = "@bookstore/cart";
export const WISHLIST_KEY = "@bookstore/wishlist";

// Mở app → nạp dữ liệu đã lưu; sau đó mọi thay đổi tự ghi lại. App.tsx chỉ hiện màn hình chính khi ready = true.
export function usePersistence() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  useEffect(() => {
    (async () => {
      // đọc song song: phiên đăng nhập, giỏ hàng, yêu thích
      const [auth, cart, wish] = await Promise.all([
        loadAuth(),
        loadJSON<CartItem[]>(CART_KEY),
        loadJSON<number[]>(WISHLIST_KEY),
      ]);
      if (auth?.token && auth.user) dispatch(setCredentials(auth)); // BT8.3: auto-login
      if (cart) dispatch(hydrateCart(cart)); // BT8.7b
      if (wish) dispatch(hydrateWishlist(wish)); // BT8.7b
      setReady(true);
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!ready) return;
    if (user && token) saveAuth({ user, token }); // đăng nhập → ghi phiên
    else clearAuth(); // đăng xuất → xóa phiên
  }, [ready, user, token]);

  useAutoPersist(CART_KEY, cartItems, ready); // BT8.7b
  useAutoPersist(WISHLIST_KEY, wishlistIds, ready); // BT8.7b

  return ready;
}
