"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-provider";

export function AddToCartButton({
  item,
  disabled = false,
  label = "SUMAR A LA BOLSA",
}: {
  item: CartItem | null;
  disabled?: boolean;
  label?: string;
}) {
  const { addItem, setOpen } = useCart();
  const [message, setMessage] = useState("");

  function add() {
    if (!item) return;
    const error = addItem(item);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("Agregada a la bolsa.");
    setOpen(true);
  }

  return (
    <>
      <button className="button button-ink" onClick={add} disabled={disabled || !item}>
        {label} <span aria-hidden="true">↗</span>
      </button>
      <span className="admin-message" aria-live="polite">{message}</span>
    </>
  );
}
