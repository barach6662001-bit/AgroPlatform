import { useEffect, useRef, useState } from 'react';
import { Button, Modal, Form, Input, Select, Space, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { getFieldZones, createFieldZone, updateFieldZone, deleteFieldZone } from '../../api/fields';
import type { FieldZoneDto } from '../../types/field';
import type { FieldDetailDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';
import s from './FieldZonesTab.module.css';
import DataTable from '../../components/ui/DataTable';

const ZONE_COLORS = [
  '#e67e22', '#2ecc71', '#3498db', '#9b59b6', '#e74c3c',
  '#1abc9c', '#f39c12', '#d35400', '#27ae60', '#2980b9',
];

interface ZoneMapProps {
  field: FieldDetailDto;
  zones: FieldZoneDto[];
  onZoneDrawn: (geoJson: string) => void;
  editingZone: FieldZoneDto | null;
}

function ZoneMapControl({ field, zones, onZoneDrawn, editingZone }: ZoneMapProps) {
  const map = useMap();
  const onZoneDrawnRef = useRef(onZoneDrawn);
  onZoneDrawnRef.current = onZoneDrawn;

  useEffect(() => {
    // Draw the field boundary
    const fieldLayer = new L.FeatureGroup();
    map.addLayer(fieldLayer);

    if (field.geoJson) {
      try {
        L.geoJSON(JSON.parse(field.geoJson), {
          style: { color: '#888', fillColor: '#888', fillOpacity: 0.1, weight: 2, dashArray: '5,5' },
        }).eachLayer((l) => fieldLayer.addLayer(l));
      } catch { /* ignore */ }
    }

    // Draw existing zones
    const zonesLayer = new L.FeatureGroup();
    map.addLayer(zonesLayer);
    zones.forEach((zone, i) => {
      if (!zone.geoJson) return;
      try {
        const color = ZONE_COLORS[i % ZONE_COLORS.length];
        const isEditing = editingZone?.id === zone.id;
        L.geoJSON(JSON.parse(zone.geoJson), {
          style: {
            color,
            fillColor: color,
            fillOpacity: isEditing ? 0.5 : 0.25,
            weight: isEditing ? 3 : 2,
          },
        }).bindTooltip(zone.name, { permanent: true, direction: 'center', className: 'zone-label' })
          .eachLayer((l) => zonesLayer.addLayer(l));
      } catch { /* ignore */ }
    });

    // Draw control for new zone
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new (L.Control as unknown as { Draw: new (opts: unknown) => L.Control }).Draw({
      draw: {
        polygon: {
          shapeOptions: { color: '#e67e22', fillColor: '#e67e22', fillOpacity: 0.3, weight: 2 },
          allowIntersection: false,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    // Fit bounds
    const allLayers = [...fieldLayer.getLayers(), ...zonesLayer.getLayers()];
    if (allLayers.length > 0) {
      try {
        const group = L.featureGroup(allLayers);
        const bounds = group.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
      } catch { /* ignore */ }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DrawEvent = (L as any).Draw.Event as Record<string, string>;

    const handleCreated = (e: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ev = e as any;
      ev.layer.setStyle({ color: '#e67e22', fillColor: '#e67e22', fillOpacity: 0.3, weight: 2 });
      drawnItems.addLayer(ev.layer);
      const geoJson = JSON.stringify(drawnItems.toGeoJSON());
      onZoneDrawnRef.current(geoJson);
      drawnItems.clearLayers();
    };

    map.on(DrawEvent.CREATED, handleCreated);

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.removeLayer(zonesLayer);
      map.removeLayer(fieldLayer);
      map.off(DrawEvent.CREATED, handleCreated);
    };
  }, [map, field.geoJson, zones, editingZone]); // re-init when field geometry, zones or editing state changes

  return null;
}

interface Props {
  fieldId: string;
  field: FieldDetailDto;
}

export default function FieldZonesTab({ fieldId, field }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const canWrite = hasPermission('fields', 'manage');
  const [zones, setZones] = useState<FieldZoneDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<FieldZoneDto | null>(null);
  const [drawnGeoJson, setDrawnGeoJson] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getFieldZones(fieldId)
      .then(setZones)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const handleZoneDrawn = (geoJson: string) => {
    setDrawnGeoJson(geoJson);
    form.resetFields();
    setEditingZone(null);
    setModalOpen(true);
  };

  const handleEdit = (zone: FieldZoneDto) => {
    setEditingZone(zone);
    setDrawnGeoJson(zone.geoJson ?? null);
    form.setFieldsValue({ name: zone.name, soilType: zone.soilType, notes: zone.notes });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        name: values.name,
        geoJson: drawnGeoJson ?? undefined,
        soilType: values.soilType,
        notes: values.notes,
      };
      if (editingZone) {
        await updateFieldZone(fieldId, editingZone.id, payload);
        message.success(t.fields.zoneUpdated);
      } else {
        await createFieldZone(fieldId, payload);
        message.success(t.fields.zoneAdded);
      }
      setModalOpen(false);
      setDrawnGeoJson(null);
      setEditingZone(null);
      form.resetFields();
      load();
    } catch {
      message.error(editingZone ? t.fields.zoneUpdateError : t.fields.zoneAddError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFieldZone(fieldId, id);
      message.success(t.fields.zoneDeleted);
      load();
    } catch {
      message.error(t.fields.zoneDeleteError);
    }
  };

  const soilTypeOptions = [
    { value: 'BlackEarth', label: t.fields.soilBlackEarth },
    { value: 'Loam', label: t.fields.soilLoam },
    { value: 'SandyLoam', label: t.fields.soilSandyLoam },
    { value: 'Sand', label: t.fields.soilSand },
    { value: 'Clay', label: t.fields.soilClay },
    { value: 'Peat', label: t.fields.soilPeat },
  ];

  const columns = [
    {
      title: '',
      key: 'color',
      width: 16,
      render: (_: unknown, __: unknown, index: number) => (
        <div style={{ width: 12, height: 12, borderRadius: 2, background: ZONE_COLORS[index % ZONE_COLORS.length] }} />
      ),
    },
    { title: t.fields.zoneName, dataIndex: 'name', key: 'name' },
    {
      title: t.fields.soilType,
      dataIndex: 'soilType',
      key: 'soilType',
      render: (v: string) => soilTypeOptions.find((o) => o.value === v)?.label ?? v ?? '—',
    },
    { title: t.common.notes, dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
    ...(canWrite ? [{
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: FieldZoneDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <DeleteConfirmButton
            title={t.fields.deleteField}
            onConfirm={() => handleDelete(record.id)}
          />
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div className={s.spaced}>
        <Typography.Text type="secondary" className={s.text13}>
          {t.fields.drawZone}
        </Typography.Text>
      </div>

      <div className={s.spaced1}>
        <MapContainer
          className={s.fullWidth}
          center={[48.5, 35.0]}
          zoom={10}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ZoneMapControl
            field={field}
            zones={zones}
            onZoneDrawn={handleZoneDrawn}
            editingZone={editingZone}
          />
        </MapContainer>
      </div>

      <DataTable
        dataSource={zones}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        locale={{
          emptyText: <EmptyState
            message={t.fields.noZones}
            actionLabel={canWrite ? t.fields.addZone : undefined}
            onAction={canWrite ? () => { form.resetFields(); setEditingZone(null); setDrawnGeoJson(null); setModalOpen(true); } : undefined}
          />,
        }}
      />

      <Modal
        title={editingZone ? t.fields.zoneName : t.fields.addZone}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditingZone(null); setDrawnGeoJson(null); form.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" className={s.spaced2}>
          <Form.Item
            name="name"
            label={t.fields.zoneName}
            rules={[{ required: true, message: t.fields.zoneNameRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="soilType" label={t.fields.soilType}>
            <Select options={soilTypeOptions} allowClear placeholder={t.fields.selectSoilType} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
