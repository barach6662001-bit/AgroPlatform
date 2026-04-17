export default function FinanceDashboard() {
  return (
    <div className="min-h-screen gradient-mesh-finance relative">
      <div className="noise-overlay" />
      <div className="p-6 max-w-[1600px] mx-auto relative">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--fg-primary)' }}>
          Фінансовий огляд
        </h1>
        <p style={{ color: 'var(--fg-secondary)' }}>Будується в task-09</p>
      </div>
    </div>
  );
}
