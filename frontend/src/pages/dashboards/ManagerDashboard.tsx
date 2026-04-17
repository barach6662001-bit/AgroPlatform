export default function ManagerDashboard() {
  return (
    <div className="min-h-screen gradient-mesh-default relative">
      <div className="noise-overlay" />
      <div className="p-6 max-w-[1600px] mx-auto relative">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--fg-primary)' }}>
          Менеджерська панель
        </h1>
        <p style={{ color: 'var(--fg-secondary)' }}>Будується в task-07</p>
      </div>
    </div>
  );
}
