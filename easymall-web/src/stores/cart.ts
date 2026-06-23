import { defineStore } from 'pinia'

interface CartItem {
    cartId?: string
    productId: string
    productName: string
    productImage?: string
    price: number
    quantity: number
    skuId?: string
    specValues?: string
}

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [] as CartItem[]
    }),

    getters: {
        totalCount: (state) => {
            return state.items.reduce((sum, item) => sum + item.quantity, 0)
        },

        totalAmount: (state) => {
            return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
    },

    actions: {
        loadCart() {
            const saved = localStorage.getItem('cart')
            if (saved) {
                this.items = JSON.parse(saved)
            }
        },

        saveToLocal() {
            localStorage.setItem('cart', JSON.stringify(this.items))
        },

        addItem(item: CartItem) {
            const existing = this.items.find(i => i.productId === item.productId && i.skuId === item.skuId)
            if (existing) {
                existing.quantity += item.quantity
            } else {
                this.items.push({ ...item, quantity: item.quantity })
            }
            this.saveToLocal()
        },

        updateQuantity(productId: string, quantity: number, skuId?: string) {
            const item = this.items.find(i => i.productId === productId && i.skuId === skuId)
            if (item) {
                item.quantity = Math.max(1, quantity)
                this.saveToLocal()
            }
        },

        removeItem(productId: string, skuId?: string) {
            const index = this.items.findIndex(i => i.productId === productId && i.skuId === skuId)
            if (index !== -1) {
                this.items.splice(index, 1)
                this.saveToLocal()
            }
        },

        clearCart() {
            this.items = []
            this.saveToLocal()
        }
    }
})