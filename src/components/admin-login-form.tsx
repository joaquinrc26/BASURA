"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/lib/admin-actions";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form className="admin-form" action={action}>
      <label>
        USUARIO
        <input name="username" autoComplete="username" required maxLength={100} />
      </label>
      <label>
        CONTRASEÑA
        <input name="password" type="password" autoComplete="current-password" required maxLength={200} />
      </label>
      {state.error && <p className="admin-message admin-error" role="alert">{state.error}</p>}
      <button className="button button-ink" disabled={pending}>
        {pending ? "VERIFICANDO…" : "ENTRAR AL TALLER"} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
