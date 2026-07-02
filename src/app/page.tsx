"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CADENCE_LABELS, periodKeyFor } from "@/lib/periods";
import type { Cadence, Ritual, RitualCheckin } from "@/lib/types";

const CADENCE_ORDER: Cadence[] = ["weekly", "monthly", "quarterly"];

export default function DashboardPage() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [checkins, setCheckins] = useState<RitualCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    const { data: ritualsData, error: ritualsError } = await supabase
      .from("rituals")
      .select("*")
      .order("cadence")
      .order("sort_order");

    if (ritualsError) {
      setError(ritualsError.message);
      setLoading(false);
      return;
    }

    const periodKeys = CADENCE_ORDER.map((c) => periodKeyFor(c));
    const { data: checkinsData, error: checkinsError } = await supabase
      .from("ritual_checkins")
      .select("*")
      .in("period_key", periodKeys);

    if (checkinsError) {
      setError(checkinsError.message);
      setLoading(false);
      return;
    }

    setRituals(ritualsData ?? []);
    setCheckins(checkinsData ?? []);
    setLoading(false);
  }

  function isChecked(ritual: Ritual): boolean {
    const periodKey = periodKeyFor(ritual.cadence);
    return checkins.some(
      (c) => c.ritual_id === ritual.id && c.period_key === periodKey
    );
  }

  async function toggleRitual(ritual: Ritual) {
    const periodKey = periodKeyFor(ritual.cadence);
    const existing = checkins.find(
      (c) => c.ritual_id === ritual.id && c.period_key === periodKey
    );

    if (existing) {
      setCheckins((prev) => prev.filter((c) => c.id !== existing.id));
      const { error } = await supabase
        .from("ritual_checkins")
        .delete()
        .eq("id", existing.id);
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase
        .from("ritual_checkins")
        .insert({ ritual_id: ritual.id, period_key: periodKey })
        .select()
        .single();
      if (error) {
        setError(error.message);
      } else if (data) {
        setCheckins((prev) => [...prev, data]);
      }
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        <p className="font-medium">Couldn&apos;t load dashboard.</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Your rituals, on schedule, not vibes.
        </p>
      </div>

      {CADENCE_ORDER.map((cadence) => {
        const items = rituals.filter((r) => r.cadence === cadence);
        if (items.length === 0) return null;

        return (
          <section key={cadence}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              {CADENCE_LABELS[cadence]}
            </h2>
            <ul className="space-y-2">
              {items.map((ritual) => {
                const checked = isChecked(ritual);
                return (
                  <li key={ritual.id}>
                    <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:border-gray-300">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRitual(ritual)}
                        className="h-4 w-4"
                      />
                      <span className={checked ? "line-through text-gray-400" : ""}>
                        {ritual.title}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
