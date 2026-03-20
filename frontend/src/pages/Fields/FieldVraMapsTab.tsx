import { useEffect, useState } from 'react';
import {
  Button, Table, Modal, Form, Input, InputNumber, Space, message,
  Popconfirm, Tag, Collapse, Tooltip, Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getVraMaps, createVraMap, deleteVraMap, exportVraMapCsv } from '../../api/fields';
import type { VraMapDto, VraZoneDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

const ZONE_COLORS = [
  '#d32f2f', '#e64a19', '#f57c00', '#fbc02d',
  '#afb42b', '#388e3c', '#0288d1', '#5e35b1',
];

interface Props {
  fieldId: string;
}

interface ZoneFormValues {
  zoneName: string;
  ndviValue?: number;
  soilOrganicMatter?: number;
  soilNitrogen?: number;
  soilPhosphorus?: number;
  soilPotassium?: number;
  areaHectares: number;
  rateKgPerHa: number;
  color: string;
}

interface MapFormValues {
  name: string;
  fertilizerName: string;
  year: number;
  notes?: string;
  zones: ZoneFormValues[];
}

export default function FieldVraMapsTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [maps, setMaps] = useState<VraMapDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<MapFormValues>();

  const load = () => {
    setLoading(true);
    getVraMaps(fieldId)
      .then(setMaps)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      if (!values.zones || values.zones.length === 0) {
        message.warning(t.fields.vraZonesRequired);
        return;
      }
      setSaving(true);
      await createVraMap(fieldId, {
        fieldId,
        name: values.name,
        fertilizerName: values.fertilizerName,
        year: values.year,
        notes: values.notes,
        zones: values.zones.map((z, i) => ({
          id: '',
          zoneIndex: i + 1,
          zoneName: z.zoneName,
          ndviValue: z.ndviValue,
          soilOrganicMatter: z.soilOrganicMatter,
          soilNitrogen: z.soilNitrogen,
          soilPhosphorus: z.soilPhosphorus,
          soilPotassium: z.soilPotassium,
          areaHectares: z.areaHectares,
          rateKgPerHa: z.rateKgPerHa,
          color: z.color || ZONE_COLORS[i % ZONE_COLORS.length],
        })),
      });
      message.success(t.fields.vraCreateSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.fields.vraCreateError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVraMap(fieldId, id);
      message.success(t.fields.vraDeleteSuccess);
      load();
    } catch {
      message.error(t.fields.vraDeleteError);
    }
  };

  const handleExportCsv = async (mapId: string, mapName: string) => {
    try {
      const blob = await exportVraMapCsv(fieldId, mapId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vra-${mapName.replace(/\s+/g, '-')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error(t.fields.vraDeleteError);
    }
  };

  const zoneColumns = [
    {
      title: t.fields.vraZoneIndex,
      dataIndex: 'zoneIndex',
      key: 'zoneIndex',
      width: 40,
    },
    {
      title: t.fields.vraZoneName,
      dataIndex: 'zoneName',
      key: 'zoneName',
      render: (name: string, z: VraZoneDto) => (
        <Space>
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: 3,
              background: z.color,
              border: '1px solid rgba(0,0,0,0.15)',
            }}
          />
          {name}
        </Space>
      ),
    },
    {
      title: t.fields.vraNdviValue,
      dataIndex: 'ndviValue',
      key: 'ndviValue',
      render: (v?: number) => v != null ? v.toFixed(3) : '—',
    },
    { title: t.fields.vraSoilOrganicMatter, dataIndex: 'soilOrganicMatter', key: 'soilOrganicMatter', render: (v?: number) => v != null ? v.toFixed(2) : '—' },
    { title: t.fields.vraSoilNitrogen, dataIndex: 'soilNitrogen', key: 'soilNitrogen', render: (v?: number) => v != null ? v.toFixed(1) : '—' },
    { title: t.fields.vraSoilPhosphorus, dataIndex: 'soilPhosphorus', key: 'soilPhosphorus', render: (v?: number) => v != null ? v.toFixed(1) : '—' },
    { title: t.fields.vraSoilPotassium, dataIndex: 'soilPotassium', key: 'soilPotassium', render: (v?: number) => v != null ? v.toFixed(1) : '—' },
    { title: t.fields.vraAreaHectares, dataIndex: 'areaHectares', key: 'areaHectares', render: (v: number) => v.toFixed(2) },
    {
      title: t.fields.vraRateKgPerHa,
      dataIndex: 'rateKgPerHa',
      key: 'rateKgPerHa',
      render: (v: number) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>{v.toFixed(1)} {t.fields.vraUnitKgPerHa}</Tag>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={5} style={{ marginBottom: 4 }}>{t.fields.vraTitle}</Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>{t.fields.vraSubtitle}</Typography.Text>
      </div>

      {canWrite && (
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.vraAddMap}
          </Button>
        </Space>
      )}

      {maps.length === 0 && !loading ? (
        <EmptyState
          message={t.fields.vraNoMaps}
          actionLabel={canWrite ? t.fields.vraAddMap : undefined}
          onAction={canWrite ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <Collapse
          items={maps.map((map) => {
            const totalArea = map.zones.reduce((s, z) => s + z.areaHectares, 0);
            const weightedRate = totalArea > 0
              ? map.zones.reduce((s, z) => s + z.rateKgPerHa * z.areaHectares, 0) / totalArea
              : 0;

            return {
              key: map.id,
              label: (
                <Space>
                  <strong>{map.name}</strong>
                  <Tag>{map.year}</Tag>
                  <Tag color="green">{map.fertilizerName}</Tag>
                  <span style={{ fontSize: 12, color: 'var(--agro-text-secondary)' }}>
                    {map.zones.length} {t.fields.vraUnitZones} · {totalArea.toFixed(1)} {t.fields.vraUnitHa} · ~{weightedRate.toFixed(0)} {t.fields.vraUnitKgPerHa}
                  </span>
                </Space>
              ),
              extra: (
                <Space onClick={(e) => e.stopPropagation()}>
                  <Tooltip title={t.fields.vraExportCsv}>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleExportCsv(map.id, map.name)}
                    >
                      {t.fields.vraExportCsv}
                    </Button>
                  </Tooltip>
                  {canWrite && (
                    <Popconfirm title={t.fields.vraDeleteMap} onConfirm={() => handleDelete(map.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  )}
                </Space>
              ),
              children: (
                <div>
                  {map.notes && (
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                      {map.notes}
                    </Typography.Paragraph>
                  )}
                  <div style={{ marginBottom: 8, display: 'flex', gap: 24 }}>
                    <span>
                      <strong>{t.fields.vraTotalArea}:</strong> {totalArea.toFixed(2)} га
                    </span>
                    <span>
                      <strong>{t.fields.vraWeightedRate}:</strong>{' '}
                      <Tag color="blue">{weightedRate.toFixed(1)} {t.fields.vraUnitKgPerHa}</Tag>
                    </span>
                  </div>
                  {/* Colored zone visualizer */}
                  <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 12, border: '1px solid rgba(0,0,0,0.1)' }}>
                    {totalArea > 0 && map.zones.map((z) => (
                      <Tooltip key={z.id} title={`${z.zoneName}: ${z.rateKgPerHa.toFixed(1)} ${t.fields.vraUnitKgPerHa} (${z.areaHectares.toFixed(1)} ${t.fields.vraUnitHa})`}>
                        <div
                          style={{
                            flex: z.areaHectares / totalArea,
                            background: z.color,
                            transition: 'flex 0.3s',
                          }}
                        />
                      </Tooltip>
                    ))}
                  </div>
                  <Table
                    dataSource={map.zones}
                    columns={zoneColumns}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ x: 800 }}
                  />
                </div>
              ),
            };
          })}
        />
      )}

      <Modal
        title={t.fields.vraAddMap}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          initialValues={{ year: currentYear, zones: [{ zoneName: 'Zone 1', color: ZONE_COLORS[0], areaHectares: 1, rateKgPerHa: 100 }] }}
        >
          <Space style={{ width: '100%', display: 'flex', gap: 12 }} align="start">
            <Form.Item name="name" label={t.fields.vraMapName} rules={[{ required: true, message: t.common.required }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="fertilizerName" label={t.fields.vraFertilizerName} rules={[{ required: true, message: t.common.required }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="year" label={t.fields.vraYear} rules={[{ required: true }]} style={{ width: 90 }}>
              <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="notes" label={t.fields.vraNotes}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Typography.Text strong>{t.fields.vraZones}</Typography.Text>
          <Form.List name="zones">
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      background: 'var(--agro-bg-secondary, #f5f5f5)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      marginTop: 8,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-end',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'zoneName']}
                      label={`${t.fields.vraZoneName} ${index + 1}`}
                      rules={[{ required: true, message: t.common.required }]}
                      style={{ marginBottom: 0, minWidth: 100 }}
                    >
                      <Input style={{ width: 110 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'ndviValue']} label={t.fields.vraNdviValue} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} max={1} step={0.01} precision={3} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'soilOrganicMatter']} label={t.fields.vraSoilOrganicMatter} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} precision={2} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'soilNitrogen']} label={t.fields.vraSoilNitrogen} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} precision={1} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'soilPhosphorus']} label={t.fields.vraSoilPhosphorus} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} precision={1} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'soilPotassium']} label={t.fields.vraSoilPotassium} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} precision={1} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'areaHectares']}
                      label={t.fields.vraAreaHectares}
                      rules={[{ required: true, message: t.common.required }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={0.01} precision={2} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'rateKgPerHa']}
                      label={t.fields.vraRateKgPerHa}
                      rules={[{ required: true, message: t.common.required }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={0} precision={1} style={{ width: 90 }} addonAfter={t.fields.vraUnitKgPerHa} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'color']} label={t.fields.vraColor} style={{ marginBottom: 0 }}>
                      <Input type="color" style={{ width: 50, padding: 2 }} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                        style={{ marginBottom: 0 }}
                        title={t.fields.vraRemoveZone}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({
                    zoneName: `Zone ${fields.length + 1}`,
                    color: ZONE_COLORS[fields.length % ZONE_COLORS.length],
                    areaHectares: 1,
                    rateKgPerHa: 100,
                  })}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  {t.fields.vraAddZone}
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
