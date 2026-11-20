"use client";

import { startTransition, useActionState, useId } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions/inquiry";
import { CheckIcon, Spinner } from "@/components/icons";

export function InquiryForm({ productId, productTitle }: { productId: number; productTitle: string }) {
  const [state, formAction, pending] = useActionState<InquiryState, FormData>(sendInquiry, { status: "idle" });
  const uid = useId();
  const ids = { name: `inq-name-${uid}`, email: `inq-email-${uid}`, message: `inq-message-${uid}` };

  if (state.status === "success") {
    return (
      <div role="status" className="flex animate-fade-up items-start gap-3 rounded-xl bg-sage-soft p-4 text-sage">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sage text-white">
          <CheckIcon width={14} height={14} strokeWidth={2.2} />
        </span>
        <div>
          <p className="font-medium text-ink">Inquiry sent</p>
          <p className="mt-0.5 text-sm text-ink-soft">{state.message ?? "Thanks — we'll be in touch soon."}</p>
        </div>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      // Submit manually so React doesn't reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      noValidate
      className="space-y-4"
    >
      <input type="hidden" name="productId" value={productId} />
      {/* Honeypot — hidden from people, irresistible to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className="field-label">
            Name
          </label>
          <input
            id={ids.name}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={state.values?.name}
            aria-invalid={!!fe.name}
            className="input"
          />
          {fe.name && <p className="field-error">{fe.name}</p>}
        </div>
        <div>
          <label htmlFor={ids.email} className="field-label">
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            defaultValue={state.values?.email}
            aria-invalid={!!fe.email}
            className="input"
          />
          {fe.email && <p className="field-error">{fe.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor={ids.message} className="field-label">
          Message
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={4}
          required
          maxLength={5000}
          defaultValue={state.values?.message}
          placeholder={`Hi, I'd love to know more about the ${productTitle}…`}
          aria-invalid={!!fe.message}
          className="input resize-y"
        />
        {fe.message && <p className="field-error">{fe.message}</p>}
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button type="submit" id={`inquiry-submit-${productId}`} disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            <Spinner /> Sending…
          </>
        ) : (
          "Send inquiry"
        )}
      </button>
    </form>
  );
}
