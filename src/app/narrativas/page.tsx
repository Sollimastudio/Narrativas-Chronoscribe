// src/app/narrativas/page.tsx
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import NarrativeComposer from "@/components/layout/NarrativeComposer";
import { authOptions } from "@/server/auth/options";

export default async function NarrativasPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=%2Fnarrativas");
  }

  return (
    <main className="min-h-screen w-full">
      <NarrativeComposer />
    </main>
  );
}
