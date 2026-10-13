"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteProduct, deleteCategory } from "@/lib/admin-actions";

export function ProductDeleteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteProduct, {});

  return (
    <form action={action} onSubmit={(event) => {
      if (!window.confirm("¿Eliminar esta prenda? Esta acción no se puede deshacer.")) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <button className="admin-logout" disabled={pending}>{pending ? "ELIMINANDO…" : "ELIMINAR PRENDA"}</button>
      {state.error && <span className="admin-message admin-error" role="alert">{state.error}</span>}
      {state.success && <span className="admin-message admin-success" role="status">{state.success}</span>}
      {state.warning && <span className="admin-message admin-error" role="alert">{state.warning}</span>}
    </form>
  );
}

export function CategoryDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <form action={(formData) => {
      if (!window.confirm("¿Eliminar esta categoría? Las prendas quedarán sin categoría.")) return;
      setError("");
      startTransition(() => {
        void deleteCategory(formData).catch((cause: unknown) => {
          console.error("Unable to delete category.", cause);
          setError("No se pudo eliminar la categoría.");
        });
      });
    }}>
      <input type="hidden" name="id" value={id} />
      <button className="admin-logout" disabled={pending}>{pending ? "ELIMINANDO…" : "ELIMINAR"}</button>
      {error && <span className="admin-message admin-error" role="alert">{error}</span>}
    </form>
  );
}
