// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv(filename: string, rows: any[], columns: { key: string; title: string }[]) {
  const header = columns.map(c => c.title).join(',');
  const csvRows = rows.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  const BOM = '\uFEFF'; // UTF-8 BOM for Ukrainian characters in Excel
  const csv = BOM + [header, ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
