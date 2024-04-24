"use client";
import React from "react";
import { Button } from "@nextui-org/react";

export default function SubmitBtn({
  isPending,
  actionVerb,
}: {
  isPending: boolean;
  actionVerb: string;
}) {
  return (
    <Button
      type="submit"
      className="max-w-[500px] grow cursor-pointer rounded-3xl border-2 bg-slate-100 px-4 py-2 text-black"
      isDisabled={isPending}
      isLoading={isPending}
    >
      {isPending ? "Warten..." : `${actionVerb}`}
    </Button>
  );
}
