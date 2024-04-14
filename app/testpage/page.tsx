// TODO: Remove test page in production
import { Spinner } from "@nextui-org/react";
export default function Test() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center gap-8">
      <Spinner size="lg" />
      <p className="text-3xl">Loading...</p>
    </div>
  );
}
