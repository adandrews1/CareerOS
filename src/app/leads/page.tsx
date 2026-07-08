"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUS_OPTIONS: LeadStatus[] = [
  "contacted",
  "replied",
  "converted",
  "lost",
];

const STATUS_LABELS: Record<LeadStatus, string> = {
  contacted: "Contacted",
  replied: "Replied",
  converted: "Converted",
  lost: "Lost",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  }

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !channel.trim()) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("leads")
      .insert({ name: name.trim(), channel: channel.trim() })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setLeads((prev) => [data, ...prev]);
      setName("");
      setChannel("");
    }
    setSubmitting(false);
  }

  async function updateStatus(lead: Lead, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status } : l))
    );
    const { error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", lead.id);
    if (error) setError(error.message);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-gray-500 mt-1">
          Outreach and opportunities, moving toward conversion.
        </p>
      </div>

      <form onSubmit={addLead} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Doe, Acme Co"
          className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="e.g. LinkedIn, referral, cold email"
          className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
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
        <p className="text-gray-500">Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-500">Nothing here yet — add your first lead above.</p>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
                  {lead.channel}
                </p>
              </div>
              <select
                value={lead.status}
                onChange={(e) =>
                  updateStatus(lead, e.target.value as LeadStatus)
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
