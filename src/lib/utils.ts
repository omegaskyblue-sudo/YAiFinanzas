export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}${rand}`;
}

export function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}
