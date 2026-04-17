import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Modal, List, Tag, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { globalSearch, type GlobalSearchResult } from '../api/search';

const TYPE_COLORS: Record<string, string> = {
  field: 'green',
  warehouse: 'blue',
  machine: 'orange',
  employee: 'purple',
  grainStorage: 'gold',
  fuelTank: 'red',
  sale: 'cyan',
};

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<{ focus: () => void } | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = useCallback((term: string) => {
    abortRef.current?.abort();
    if (term.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    globalSearch(term, ctrl.signal)
      .then((data) => {
        setResults(data);
        setActiveIndex(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const select = useCallback(
    (item: GlobalSearchResult) => {
      onClose();
      navigate(item.url);
    },
    [onClose, navigate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        select(results[activeIndex]);
      }
    },
    [results, activeIndex, select],
  );

  const TYPE_LABELS: Record<string, string> = {
    field: t.search.typeField,
    warehouse: t.search.typeWarehouse,
    machine: t.search.typeMachine,
    employee: t.search.typeEmployee,
    grainStorage: t.search.typeGrainStorage,
    fuelTank: t.search.typeFuelTank,
    sale: t.search.typeSale,
  };

  const typeLabel = (type: string) => TYPE_LABELS[type] ?? type;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={560}
      styles={{ body: { padding: '8px 0 0' } }}
      destroyOnClose
    >
      <Input
        ref={inputRef as never}
        prefix={<SearchOutlined />}
        placeholder={t.search.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        size="large"
        allowClear
        style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}
      />

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <Empty description={t.search.noResults} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}

        {!loading && results.length > 0 && (
          <List
            dataSource={results}
            renderItem={(item, index) => (
              <List.Item
                key={`${item.type}-${item.id}`}
                onClick={() => select(item)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  background: index === activeIndex ? 'var(--bg-elevated)' : undefined,
                }}
              >
                <List.Item.Meta
                  title={
                    <span>
                      <Tag color={TYPE_COLORS[item.type] ?? 'default'}>
                        {typeLabel(item.type)}
                      </Tag>
                      {item.title}
                    </span>
                  }
                  description={item.subtitle}
                />
              </List.Item>
            )}
          />
        )}

        {!loading && query.length < 2 && (
          <div style={{ textAlign: 'center', padding: 24, opacity: 0.5 }}>
            {t.search.hint}
          </div>
        )}
      </div>
    </Modal>
  );
}
