"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { submitAffiliate, type AffiliateFormState } from "./actions";

const initialState: AffiliateFormState = { ok: false };

export function AffiliateForm() {
  const [state, formAction, pending] = useActionState(
    submitAffiliate,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="aff_name">Nome</Label>
        <Input
          id="aff_name"
          name="name"
          autoComplete="name"
          required
          placeholder="Pedro Almeida"
        />
        <FieldError message={state.errors?.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="aff_email">Email</Label>
        <Input
          id="aff_email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="pedro@exemplo.pt"
        />
        <FieldError message={state.errors?.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="aff_whatsapp" hint="(formato 9XXXXXXXX)">
          WhatsApp
        </Label>
        <Input
          id="aff_whatsapp"
          name="whatsapp"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="912345678"
        />
        <FieldError message={state.errors?.whatsapp} />
      </div>

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.errors.form}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "A criar link…" : "Criar o meu link"}
      </Button>
    </form>
  );
}
