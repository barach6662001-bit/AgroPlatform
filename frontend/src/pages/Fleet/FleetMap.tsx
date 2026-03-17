import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Badge, Tag, Empty } from 'antd';
import PageHeader from '../../components/PageHeader';
import { useFleetHub } from '../../hooks/useFleetHub';
import { useTranslation } from '../../i18n';
import type { ConnectionState } from '../../hooks/useFleetHub';

// The default Leaflet icon is patched globally via src/utils/leafletFix.ts

function formatRelativeTime(timestampUtc: string): string {
  const diff = Date.now() - new Date(timestampUtc).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
}

const connectionTagProps: Record<ConnectionState, { color: string; statusType: 'success' | 'warning' | 'error' }> = {
  connected: { color: '#3fb950', statusType: 'success' },
  reconnecting: { color: '#d29922', statusType: 'warning' },
  disconnected: { color: '#f85149', statusType: 'error' },
};

export default function FleetMap() {
  const { t } = useTranslation();
  const { positions, connectionState } = useFleetHub();

  const { color, statusType } = connectionTagProps[connectionState];
  const connectionLabel = t.fleet[connectionState];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <PageHeader title={t.fleet.title} subtitle={t.fleet.subtitle} />
        <Tag color={color} style={{ fontSize: 13, marginTop: 4 }}>
          <Badge status={statusType} />
          {' '}{connectionLabel}
        </Tag>
      </div>

      {positions.size === 0 && (
        <div style={{ marginBottom: 16 }}>
          <Empty description={t.fleet.noVehicles} />
        </div>
      )}

      <MapContainer
        center={[49.0, 32.0]}
        zoom={6}
        style={{ height: 'calc(100vh - 260px)', width: '100%', borderRadius: 8 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {Array.from(positions.values()).map((pos) => (
          <Marker
            key={pos.vehicleId}
            position={[pos.lat, pos.lng]}
          >
            <Popup>
              <strong>{pos.vehicleId}</strong>
              <br />
              {t.fleet.speed}: {pos.speed} km/h
              <br />
              {t.fleet.fuel}: {pos.fuel}%
              <br />
              {t.fleet.lastUpdate}: {formatRelativeTime(pos.timestampUtc)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
