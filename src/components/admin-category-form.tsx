"use client";

import { useActionState } from "react";
import { saveCategory, type AdminState } from "@/lib/admin-actions";

export function AdminCategoryForm() {
  const [state, action, pending] = useActionState(saveCategory, {} satisfies AdminState);
  return (
    <form className="admin-inline" action={action}>
      <label>
        NUEVA CATEGORÍA
        <input name="name" required minLength={2} maxLength={60} />
      </label>
      <button className="button" disabled={pending}>{pending ? "AGREGANDO…" : "AGREGAR"}</button>
      {state.error && <p className="admin-message admin-error" role="alert">{state.error}</p>}
      {state.success && <p className="admin-message admin-success" role="status">{state.success}</p>}
    </form>
  );
}
