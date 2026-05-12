"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendTest, type TestState } from "./actions";

const initial: TestState = { ok: false };

interface Props {
  defaultTo: string;
  defaultText: string;
}

export function TestForm({ defaultTo, defaultText }: Props) {
  const [state, formAction, pending] = useActionState(sendTest, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="to" hint="(E.164 sem +, ou 9XXXXXXXX)">
          Número
        </Label>
        <Input
          id="to"
          name="to"
          inputMode="tel"
          required
          defaultValue={defaultTo}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="text">Mensagem</Label>
        <Textarea
          id="text"
          name="text"
          rows={5}
          required
          defaultValue={defaultText}
        />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "A enviar…" : "Enviar teste"}
      </Button>

      {state.ok && state.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          ✓ {state.message}
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          ✗ {state.error}
        </div>
      ) : null}
    </form>
  );
}
