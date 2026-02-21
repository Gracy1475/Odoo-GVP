/**
 * Formatting utilities for currency, dates, percentages
 */

export const formatCurrency = (value: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateLong = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDistance = (km: number): string => {
  return `${km.toLocaleString()} km`;
};

export const formatCapacity = (kg: number): string => {
  const ton = kg / 1000;
  return `${ton.toFixed(1)} ton`;
};

export const daysUntilDate = (targetDate: string | Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatExpiryStatus = (date: string | Date): { days: number; status: "expired" | "critical" | "warning" | "ok" } => {
  const days = daysUntilDate(date);
  return {
    days,
    status: days < 0 ? "expired" : days <= 30 ? "critical" : days <= 90 ? "warning" : "ok",
  };
};
