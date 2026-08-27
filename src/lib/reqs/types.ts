export const reqStatusOptions = ["Open", "Filled", "Closed"] as const;
export type ReqStatus = (typeof reqStatusOptions)[number];

export interface Req {
  id: string;
  created_at: string;
  title: string;
  domain: string;
  duty_location: string;
  need_by_date: string | null;
  key_requirement: string | null;
  status: ReqStatus;
}
