"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { BacklogItem, BacklogItemType, BacklogStatus } from "@/lib/types";

const STATUS_OPTIONS: BacklogStatus[] = [
  "backlog",
  "in_progress",
  "shipped",
  "archived",
];

const STATUS_LABELS: Record<BacklogStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  shipped: "Shipped",
  archived: "Archived",
};

export default function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<BacklogItemType>("experiment");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("backlog_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("backlog_items")
      .insert({ title: title.trim(), item_type: itemType })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setItems((prev) => [data, ...prev]);
      setTitle("");
    }
    setSubmitting(false);
  }

  async function updateStatus(item: BacklogItem, status: BacklogStatus) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status } : i))
    );
    const { error } = await supabase
      .from("backlog_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) setError(error.message);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Backlog</h1>
        <p className="text-gray-500 mt-1">
          Experiments and artifacts you&apos;re shipping.
        </p>
      </div>

      <form onSubmit={addItem} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Test a new outreach cadence"
          className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value as BacklogItemType)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="experiment">Experiment</option>
          <option value="artifact">Artifact</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading backlog...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Nothing here yet — add your first item above.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
                  {item.item_type}
                </p>
              </div>
              <select
                value={item.status}
                onChange={(e) =>
                  updateStatus(item, e.target.value as BacklogStatus)
                }
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
