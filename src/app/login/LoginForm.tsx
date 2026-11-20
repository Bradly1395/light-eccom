"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/icons";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "login-error" : undefined}
          className="input"
        />
        {state.error && (
          <p id="login-error" role="alert" className="field-error">
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" id="login-submit" disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
