const uahFormatter = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const uahFormatterDecimals = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUAH(value: number, decimals = false): string {
  const formatter = decimals ? uahFormatterDecimals : uahFormatter;
  return `${formatter.format(value)} UAH`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('uk-UA').format(value);
}

export function formatHa(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} га`;
}

export function formatTons(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} т`;
}
