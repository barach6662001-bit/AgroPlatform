export function printReport(title: string, contentHtml: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:20px;color:#333}h1{font-size:18px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
th{background:#f5f5f5;font-weight:600}
@media print{button{display:none}}</style></head>
<body><button onclick="window.print()">Друкувати</button>
<h1>${title}</h1><p style="color:#666;font-size:12px">Дата: ${new Date().toLocaleDateString('uk-UA')}</p>
${contentHtml}</body></html>`);
  win.document.close();
}
