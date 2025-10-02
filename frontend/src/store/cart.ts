import { create } from 'zustand'

export type CartItem = {
  productId: number
  name: string
  price: number
  image?: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        }
      }
      return { items: [...state.items, { ...item, quantity }] }
    }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))


