const smsBase = (process.env.SMSPOOL_BASE_URL || "https://api.smspool.net").replace(/\/$/, "");
const payBase = (process.env.AVERPay_BASE_URL || "https://app.averpay.my.id/api").replace(/\/$/, "");

export async function smspool(path: string, params: Record<string, string | number> = {}, method: "GET" | "POST" = "GET") {
  if (!process.env.SMSPOOL_API_KEY) throw new Error("SMSPool API key belum diatur.");
  const url = new URL(`${smsBase}/${path.replace(/^\//, "")}`);
  const headers: Record<string, string> = { Authorization: `Bearer ${process.env.SMSPOOL_API_KEY}`, Accept: "application/json" };
  let init: RequestInit = { method, headers, cache: "no-store" };
  if (method === "GET") { url.searchParams.set("key", process.env.SMSPOOL_API_KEY); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v))); }
  else {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = new URLSearchParams([["key", process.env.SMSPOOL_API_KEY], ...Object.entries(params).map(([k,v]) => [k, String(v)])]);
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || `SMSPool error (${res.status})`);
  return data;
}
export async function averpay(path: string, params: Record<string, string | number> = {}) {
  if (!process.env.AVERPay_API_KEY) throw new Error("AverPay API key belum diatur.");
  const url = new URL(`${payBase}/${path.replace(/^\//, "")}`);
  url.searchParams.set("apikey", process.env.AVERPay_API_KEY);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `AverPay error (${res.status})`);
  return data;
}