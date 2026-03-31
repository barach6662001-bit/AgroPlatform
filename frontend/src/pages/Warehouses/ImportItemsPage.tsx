import { useState } from 'react';
import { Upload, Button, Table, message, Alert, Space, Tag, Card } from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import apiClient from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

interface ImportRow {
  name: string;
  code: string;
  category: string;
  baseUnit: string;
  description?: string;
  minimumQuantity?: number;
  purchasePrice?: number;
  rowNumber: number;
  errors: string[];
}

interface ParseResult {
  rows: ImportRow[];
  validCount: number;
  errorCount: number;
}

interface ConfirmResult {
  created: number;
  skipped: number;
}

export default function ImportItemsPage() {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [parseResult, setParsResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null);

  const handleUpload = async () => {
    if (fileList.length === 0) return;
    const file = fileList[0];
    if (!file.originFileObj) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file.originFileObj);
      const res = await apiClient.post<ParseResult>('/api/warehouses/items/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsResult(res.data);
      setConfirmResult(null);
    } catch {
      message.error(t.importItems.parseError);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parseResult) return;
    const validRows = parseResult.rows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) {
      message.warning(t.importItems.noValidRows);
      return;
    }

    setConfirming(true);
    try {
      const res = await apiClient.post<ConfirmResult>('/api/warehouses/items/import/confirm', {
        rows: validRows,
      });
      setConfirmResult(res.data);
      message.success(`${t.importItems.created}: ${res.data.created}, ${t.importItems.skipped}: ${res.data.skipped}`);
    } catch {
      message.error(t.importItems.confirmError);
    } finally {
      setConfirming(false);
    }
  };

  const columns = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 60 },
    { title: t.importItems.name, dataIndex: 'name', key: 'name' },
    { title: t.importItems.code, dataIndex: 'code', key: 'code' },
    { title: t.importItems.category, dataIndex: 'category', key: 'category' },
    { title: t.importItems.baseUnit, dataIndex: 'baseUnit', key: 'baseUnit', width: 100 },
    {
      title: t.importItems.status,
      key: 'status',
      render: (_: unknown, record: ImportRow) =>
        record.errors.length === 0 ? (
          <Tag color="success">{t.importItems.valid}</Tag>
        ) : (
          <Tag color="error">{record.errors.join('; ')}</Tag>
        ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader title={t.importItems.title} subtitle={t.importItems.subtitle} />

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Upload
            fileList={fileList}
            beforeUpload={(file) => {
              setFileList([file as unknown as UploadFile]);
              return false;
            }}
            onRemove={() => {
              setFileList([]);
              setParsResult(null);
              setConfirmResult(null);
            }}
            accept=".csv,.xlsx"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>{t.importItems.selectFile}</Button>
          </Upload>
          <Button type="primary" onClick={handleUpload} loading={loading} disabled={fileList.length === 0}>
            {t.importItems.parse}
          </Button>
        </Space>
      </Card>

      {parseResult && (
        <>
          <Alert
            type={parseResult.errorCount > 0 ? 'warning' : 'success'}
            message={`${t.importItems.valid}: ${parseResult.validCount}, ${t.importItems.errors}: ${parseResult.errorCount}`}
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={parseResult.rows}
            columns={columns}
            rowKey="rowNumber"
            size="small"
            pagination={{ pageSize: 50 }}
            style={{ marginBottom: 16 }}
          />
          {!confirmResult && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              loading={confirming}
              disabled={parseResult.validCount === 0}
            >
              {t.importItems.confirm} ({parseResult.validCount})
            </Button>
          )}
          {confirmResult && (
            <Alert
              type="success"
              message={`${t.importItems.importComplete}: ${t.importItems.created} ${confirmResult.created}, ${t.importItems.skipped} ${confirmResult.skipped}`}
            />
          )}
        </>
      )}
    </div>
  );
}
