"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/admin/use-session";

/**
 * Client-side gate only — a logged-out visitor briefly sees this loading
 * state before redirecting. RLS is what actually blocks unauthorized data
 * access regardless of what renders here.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/admin/login");
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-black/50">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
