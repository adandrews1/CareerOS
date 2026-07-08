export type Cadence = "weekly" | "monthly" | "quarterly";

export interface Ritual {
  id: string;
  title: string;
  cadence: Cadence;
  sort_order: number;
}

export interface RitualCheckin {
  id: string;
  ritual_id: string;
  period_key: string;
}

export type BacklogItemType = "experiment" | "artifact";
export type BacklogStatus = "backlog" | "in_progress" | "shipped" | "archived";

export interface BacklogItem {
  id: string;
  title: string;
  item_type: BacklogItemType;
  status: BacklogStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = "contacted" | "replied" | "converted" | "lost";

export interface Lead {
  id: string;
  name: string;
  channel: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
