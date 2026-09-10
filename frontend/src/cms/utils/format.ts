export function toDateTimeLocalValue(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString();
}

export function formatDisplayDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShareImageDate(value: string): [string, string] {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return [`${dd}.${mm}.`, String(date.getFullYear())];
}
