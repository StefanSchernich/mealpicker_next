"use client";
import { Spinner } from "@nextui-org/react";
export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center gap-8 py-32">
      <Spinner size="lg" />
      <p className="text-3xl">Loading...</p>
    </div>
  );
}
