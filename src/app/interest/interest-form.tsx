"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { submitInterest, type LeadFormState } from "./actions";

const initialState: LeadFormState = { ok: false };

export function InterestForm() {
  const [state, formAction, pending] = useActionState(
    submitInterest,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="buyer_name">Nome completo</Label>
        <Input
          id="buyer_name"
          name="buyer_name"
          autoComplete="name"
          required
          placeholder="Maria Silva"
        />
        <FieldError message={state.errors?.buyer_name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="buyer_whatsapp" hint="(formato 9XXXXXXXX)">
          WhatsApp
        </Label>
        <Input
          id="buyer_whatsapp"
          name="buyer_whatsapp"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="912345678"
        />
        <FieldError message={state.errors?.buyer_whatsapp} />
      </div>

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.errors.form}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "A enviar…" : "Receber o meu código"}
      </Button>

      <p className="text-xs text-zinc-500">
        Ao submeter aceita ser contactado pelo proprietário por WhatsApp sobre
        este anúncio. Os seus dados não são partilhados com terceiros.
      </p>
    </form>
  );
}
