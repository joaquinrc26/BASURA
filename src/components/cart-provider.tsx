"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { formatPrice } from "@/lib/format";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import { getWhatsAppNumber } from "@/lib/social";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  stock: number;
  unitPriceCents: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => string | null;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "basura-cart-v1";
const storageEvent = "basura-cart-updated";

function keyOf(item: Pick<CartItem, "productId" | "variantId">) {
  return `${item.productId}:${item.variantId ?? "unico"}`;
}

function parseStoredItems(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem =>
      Boolean(
        item &&
        typeof item.productId === "string" &&
        typeof item.slug === "string" &&
        typeof item.name === "string" &&
        (typeof item.imageUrl === "string" || item.imageUrl === null) &&
        (typeof item.variantId === "string" || item.variantId === null) &&
        (typeof item.variantName === "string" || item.variantName === null) &&
        Number.isInteger(item.stock) && item.stock >= 0 &&
        Number.isInteger(item.unitPriceCents) && item.unitPriceCents >= 0 &&
        Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99,
      ),
    );
  } catch {
    return [];
  }
}

function subscribeToCart(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(storageEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(storageEvent, callback);
  };
}

function readCartSnapshot() {
  return window.localStorage.getItem(storageKey) ?? "[]";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const storedItems = useSyncExternalStore(subscribeToCart, readCartSnapshot, () => "[]");
  const items = useMemo(() => parseStoredItems(storedItems), [storedItems]);
  const [isOpen, setOpen] = useState(false);

  const updateItems = useCallback((update: (current: CartItem[]) => CartItem[]) => {
    const current = parseStoredItems(readCartSnapshot());
    window.localStorage.setItem(storageKey, JSON.stringify(update(current)));
    window.dispatchEvent(new Event(storageEvent));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    if (item.stock <= 0) return "Esta prenda está agotada.";
    const key = keyOf(item);
    let error: string | null = null;
    updateItems((current) => {
      const existing = current.find((line) => keyOf(line) === key);
      const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
      if (nextQuantity > item.stock) {
        error = `Solo quedan ${item.stock} unidades disponibles.`;
        return current;
      }
      if (existing) {
        return current.map((line) =>
          keyOf(line) === key
            ? { ...line, quantity: nextQuantity, stock: item.stock }
            : line,
        );
      }
      return [...current, item];
    });
    return error;
  }, [updateItems]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    updateItems((current) =>
      current.map((item) =>
        keyOf(item) === key
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock, 99)) }
          : item,
      ),
    );
  }, [updateItems]);

  const removeItem = useCallback((key: string) => {
    updateItems((current) => current.filter((item) => keyOf(item) !== key));
  }, [updateItems]);

  const value = useMemo(
    () => ({ items, isOpen, setOpen, addItem, setQuantity, removeItem }),
    [items, isOpen, addItem, setQuantity, removeItem],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}

function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const whatsappNumber = getWhatsAppNumber();

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.querySelector<HTMLButtonElement>(".cart-close")?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [isOpen, setOpen]);

  async function checkout() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ productId, variantId, quantity }) => ({
            productId,
            variantId,
            quantity,
          })),
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("items" in result)) {
        const message =
          result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo verificar el carrito. Probá de nuevo.";
        setError(message);
        return;
      }
      const verified = result.items as Array<{
        name: string;
        variantName?: string;
        quantity: number;
        unitPriceCents: number;
      }>;
      const url = createWhatsAppOrderUrl(
        whatsappNumber,
        verified.map((item) => ({
          name: item.name,
          variant: item.variantName,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
        formatPrice,
      );
      window.location.assign(url);
    } catch (checkoutError) {
      console.error("Unable to create the WhatsApp link.", checkoutError);
      setError("No se pudo preparar el enlace. Revisá tu conexión y volvé a intentar.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <button className="cart-backdrop" onClick={() => setOpen(false)} aria-label="Cerrar carrito" />
      <aside ref={panelRef} className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1}>
        <div className="cart-head">
          <div>
            <p className="eyebrow">SELECCIÓN EN CURSO</p>
            <h2 id="cart-title">TU BOLSA</h2>
          </div>
          <button className="cart-close" onClick={() => setOpen(false)} aria-label="Cerrar carrito">✕</button>
        </div>
        {items.length ? (
          <>
            <div className="cart-lines">
              {items.map((item) => {
                const key = keyOf(item);
                return (
                  <article className="cart-line" key={key}>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="cart-thumb" src={item.imageUrl} alt="" />
                    ) : <div className="cart-thumb image-placeholder" aria-hidden="true">B!</div>}
                    <div>
                      <h3>{item.name}</h3>
                      {item.variantName && <p>{item.variantName}</p>}
                      <p>{formatPrice(item.unitPriceCents)}</p>
                      <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                        <button onClick={() => setQuantity(key, item.quantity - 1)} aria-label="Restar una unidad">−</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(key, item.quantity + 1)}
                          aria-label="Sumar una unidad"
                          disabled={item.quantity >= item.stock}
                        >+</button>
                      </div>
                    </div>
                    <button className="cart-remove" onClick={() => removeItem(key)}>QUITAR</button>
                  </article>
                );
              })}
            </div>
            <div className="cart-total">
              <p><span>TOTAL ESTIMADO</span><span>{formatPrice(total)}</span></p>
              <p className="whatsapp-note">Disponibilidad, pago y entrega se confirman por WhatsApp.</p>
              {error && <p className="cart-error" role="alert">{error}</p>}
              <button className="button button-ink" onClick={checkout} disabled={loading}>
                {loading ? "VERIFICANDO…" : "LLEVAR ESTO A WHATSAPP"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <p>TODAVÍA NO HAY NADA ACÁ.</p>
            <p>Encontrá algo que merezca otra vida.</p>
            <button className="button button-ink" onClick={() => setOpen(false)}>VOLVER A EMPARCHADAS</button>
          </div>
        )}
      </aside>
    </>
  );
}
