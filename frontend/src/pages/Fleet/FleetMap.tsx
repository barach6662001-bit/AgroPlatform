import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Badge, Tag, Empty } from 'antd';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
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

/** Color per machinery type for map marker dots. */
const TYPE_COLORS: Record<string, string> = {
  Tractor:    '#52c41a',
  Combine:    '#fa8c16',
  Sprayer:    '#1677ff',
  Seeder:     '#fadb14',
  Cultivator: '#722ed1',
  Truck:      '#f5222d',
  Other:      '#8c8c8c',
};

function getMarkerIcon(machineType: string): L.DivIcon {
  const color = TYPE_COLORS[machineType] ?? TYPE_COLORS['Other'];
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.6)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export default function FleetMap() {
  const { t } = useTranslation();
  const { positions, connectionState } = useFleetHub();

  const { color, statusType } = connectionTagProps[connectionState];
  const connectionLabel = t.fleet[connectionState];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <PageHeader
          title={t.fleet.title}
          subtitle={t.fleet.subtitle}
          breadcrumbs={<Breadcrumbs items={[{ label: t.nav.operationsGroup, path: '/operations' }, { label: t.nav.fleet }]} />}
        />
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
            icon={getMarkerIcon(pos.machineType)}
          >
            <Popup>
              <strong>{pos.machineName || pos.vehicleId}</strong>
              <br />
              {t.fleet.machineType}: {t.machineryTypes[pos.machineType as keyof typeof t.machineryTypes] ?? pos.machineType}
              <br />
              {t.fleet.speed}: {pos.speed} km/h
              <br />
              {t.fleet.lastUpdate}: {formatRelativeTime(pos.timestampUtc)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
