export const colors = {
  ink: "#14213D",
  inkSoft: "#3D4A68",
  canvas: "#FAF9F8",
  surface: "#FFFFFF",
  border: "#E1E4EA",
  borderStrong: "#C7CBD6",
  brass: "#A9762E",
  brassDark: "#8A5F22",
  brassTint: "#F4EAD9",
  verified: "#1F7A5C",
  verifiedTint: "#E6F2ED",
  alert: "#B3261E",
  alertTint: "#FBE9E8",
  muted: "#6B7280",
  white: "#FFFFFF",
};

export const spacing = (n: number) => n * 4;

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function resolveImageUrl(imageUrl: string, apiUrl: string) {
  return imageUrl.startsWith("http") ? imageUrl : `${apiUrl}${imageUrl}`;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid — awaiting shipment",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered — funds held",
  RELEASED: "Complete — funds released",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
};
