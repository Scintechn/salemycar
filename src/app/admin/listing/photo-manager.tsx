"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  deletePhoto,
  reorderPhotos,
  uploadPhotos,
  type UploadState,
} from "./actions";

const initial: UploadState = { ok: false };

export function PhotoManager({ photos }: { photos: string[] }) {
  const [state, formAction, uploading] = useActionState(uploadPhotos, initial);
  const [busyUrl, setBusyUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(url: string) {
    setBusyUrl(url);
    startTransition(async () => {
      await deletePhoto(url);
      setBusyUrl(null);
    });
  }

  function move(url: string, dir: -1 | 1) {
    const idx = photos.indexOf(url);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= photos.length) return;
    const newOrder = [...photos];
    [newOrder[idx], newOrder[next]] = [newOrder[next], newOrder[idx]];
    setBusyUrl(url);
    startTransition(async () => {
      await reorderPhotos(newOrder);
      setBusyUrl(null);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-5">
      {/* Existing photos */}
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((url, idx) => (
            <li
              key={url}
              className={`group relative overflow-hidden rounded-lg border border-zinc-200 ${
                busyUrl === url ? "opacity-50" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              {idx === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  destaque
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <IconButton
                    title="Mover para cima"
                    disabled={idx === 0}
                    onClick={() => move(url, -1)}
                  >
                    ←
                  </IconButton>
                  <IconButton
                    title="Mover para baixo"
                    disabled={idx === photos.length - 1}
                    onClick={() => move(url, 1)}
                  >
                    →
                  </IconButton>
                </div>
                <IconButton title="Apagar" onClick={() => remove(url)}>
                  ✕
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          Sem fotos. Adicione abaixo.
        </p>
      )}

      {/* Upload */}
      <form action={formAction} className="flex flex-col gap-3">
        <label
          htmlFor="photos-input"
          className="cursor-pointer rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-600 hover:bg-zinc-100"
        >
          Escolher fotos (JPG / PNG / WEBP / HEIC, máx. 4 MB cada)
          <input
            id="photos-input"
            name="photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                e.target.form?.requestSubmit();
              }
            }}
          />
        </label>
        {uploading ? (
          <p className="text-sm text-zinc-500">A carregar…</p>
        ) : null}
        {state.ok && state.added ? (
          <p className="text-sm text-emerald-700">
            {state.added} foto(s) adicionada(s).
          </p>
        ) : null}
        {state.error ? (
          <p className="text-sm text-red-700">{state.error}</p>
        ) : null}
      </form>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded bg-white/95 text-xs font-semibold text-zinc-900 shadow hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
