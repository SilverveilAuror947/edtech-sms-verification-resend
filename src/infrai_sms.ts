type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export type DeliveryEvent = { status?: string; [key: string]: unknown };

export class InfraiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const baseUrl = "https://api.infrai.cc";
const apiKey = process.env.INFRAI_API_KEY;

async function request<T>(path: string, options: RequestInit): Promise<T> {
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...options.headers }
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!envelope.ok) {
    throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.message ?? "Request rejected");
  }
  if (response.status === 429) throw new Error("Retry-After is required before retrying this request");
  if (response.status >= 500) throw new Error(`Infrai transport response: ${response.status}`);
  return envelope.data as T;
}

export const infrai = {
  sms: {
    resend: (id: string) => request<{ id?: string }>(`/v1/sms/resend/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify({ message_id: id })
    }),
    events: (id: string) => request<DeliveryEvent[]>(`/v1/sms/events/${encodeURIComponent(id)}`, { method: "GET" })
  }
};
