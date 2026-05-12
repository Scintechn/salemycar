"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { submitOwnerInterest, type OwnerInterestState } from "./actions";

const initial: OwnerInterestState = { ok: false };

export function SellForm() {
  const [state, formAction, pending] = useActionState(
    submitOwnerInterest,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="own_name">Nome</Label>
          <Input
            id="own_name"
            name="name"
            autoComplete="name"
            required
            placeholder="Pedro Almeida"
          />
          <FieldError message={state.errors?.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="own_whatsapp" hint="(9XXXXXXXX)">
            WhatsApp
          </Label>
          <Input
            id="own_whatsapp"
            name="whatsapp"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="912345678"
          />
          <FieldError message={state.errors?.whatsapp} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="own_email" hint="(opcional)">
          Email
        </Label>
        <Input
          id="own_email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="pedro@exemplo.pt"
        />
        <FieldError message={state.errors?.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="own_car"
          hint="(marca, modelo, ano, km — opcional)"
        >
          Que carro quer anunciar
        </Label>
        <Input
          id="own_car"
          name="car_brief"
          placeholder="Peugeot 208 2020, ~60.000 km"
        />
        <FieldError message={state.errors?.car_brief} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="own_message" hint="(opcional)">
          Mensagem
        </Label>
        <Textarea
          id="own_message"
          name="message"
          rows={3}
          placeholder="O que gostaria de saber antes de avançar?"
        />
        <FieldError message={state.errors?.message} />
      </div>

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.errors.form}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "A enviar…" : "Enviar pedido"}
      </Button>
    </form>
  );
}
