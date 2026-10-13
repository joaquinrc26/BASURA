"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleProductPublication, type AdminState } from "@/lib/admin-actions";

export function ProductListActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(toggleProductPublication, {} satisfies AdminState);
  return (
    <div className="admin-row-actions">
      <Link href={`/admin?edit=${encodeURIComponent(id)}`}>EDITAR</Link>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published" value={String(!published)} />
        <button disabled={pending}>{published ? "OCULTAR" : "PUBLICAR"}</button>
        {state.error && <p className="admin-message admin-error" role="alert">{state.error}</p>}
        {state.success && <p className="admin-message admin-success" role="status">{state.success}</p>}
      </form>
    </div>
  );
}
