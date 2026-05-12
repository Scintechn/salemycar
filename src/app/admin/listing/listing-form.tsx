"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveListing, type SaveState } from "./actions";
import type { Listing } from "@/lib/listing";

const initial: SaveState = { ok: false };

interface Props {
  listing: Listing;
  envDefaults: {
    list_price: number;
    buyer_discount: number;
    affiliate_commission: number;
  };
}

export function ListingForm({ listing, envDefaults }: Props) {
  const [state, formAction, pending] = useActionState(saveListing, initial);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Spec */}
      <div>
        <h2 className="text-lg font-semibold">Especificação</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="title" label="Título" defaultValue={listing.title} />
          <Field
            name="year"
            label="Ano"
            type="number"
            defaultValue={listing.year}
          />
          <Field
            name="km"
            label="Quilómetros"
            type="number"
            defaultValue={listing.km}
          />
          <Field name="fuel" label="Combustível" defaultValue={listing.fuel} />
          <Field
            name="transmission"
            label="Caixa"
            defaultValue={listing.transmission}
          />
          <Field name="power" label="Potência" defaultValue={listing.power} />
          <Field name="color" label="Cor" defaultValue={listing.color} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={listing.description}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="options" hint="(uma por linha)">
            Equipamento
          </Label>
          <Textarea
            id="options"
            name="options"
            rows={8}
            defaultValue={listing.options.join("\n")}
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-lg font-semibold">Preço e bónus</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Em branco usa o valor configurado em ambiente (predefinido). O valor
          aqui sobrepõe-se aos env vars.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field
            name="list_price"
            label="Preço de tabela (€)"
            type="number"
            placeholder={`pred. ${envDefaults.list_price}`}
            defaultValue={overrideValue(listing.list_price, envDefaults.list_price)}
          />
          <Field
            name="buyer_discount"
            label="Desconto comprador (€)"
            type="number"
            placeholder={`pred. ${envDefaults.buyer_discount}`}
            defaultValue={overrideValue(
              listing.buyer_discount,
              envDefaults.buyer_discount,
            )}
          />
          <Field
            name="affiliate_commission"
            label="Bónus afiliado (€)"
            type="number"
            placeholder={`pred. ${envDefaults.affiliate_commission}`}
            defaultValue={overrideValue(
              listing.affiliate_commission,
              envDefaults.affiliate_commission,
            )}
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "A guardar…" : "Guardar alterações"}
        </Button>
        {state.ok && state.savedAt ? (
          <span className="text-sm text-emerald-700">guardado ✓</span>
        ) : null}
      </div>
    </form>
  );
}

function overrideValue(actual: number, envDefault: number): string | number {
  return actual === envDefault ? "" : actual;
}

function Field(props: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        id={props.name}
        name={props.name}
        type={props.type ?? "text"}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
      />
    </div>
  );
}
