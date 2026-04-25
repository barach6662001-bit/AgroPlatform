import { useState, useEffect, useRef, useCallback, useId } from 'react';
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

  /*
   * Phase 2i — keyboard-first command-palette a11y model.
   *
   * The palette implements the WAI-ARIA combobox-with-listbox
   * pattern: focus stays on the search <input> (role="combobox"),
   * which owns the listbox via aria-controls and points at the
   * active option via aria-activedescendant. Each result row is an
   * option (role="option" + aria-selected). Arrow keys move the
   * pointer, Enter activates, Escape closes.
   *
   * Tradeoff: AntD <List> renders its own <ul class="ant-list-
   * items"> wrapper, which we cannot annotate directly. We
   * therefore wrap the <List> in a <div role="listbox">; the
   * <li role="option"> nodes are descendants (not direct children)
   * of the listbox. WAI-ARIA explicitly allows descendant
   * relationships for combobox+listbox when the input owns the
   * listbox via aria-controls + aria-activedescendant, which is the
   * canonical pattern (see APG combobox: List Autocomplete with
   * Manual Selection). Modern AT (NVDA/VoiceOver/JAWS in current
   * browsers) resolves this correctly.
   */
  const reactId = useId();
  const listboxId = `cmdpal-listbox-${reactId}`;
  const optionId = useCallback(
    (item: GlobalSearchResult, index: number) =>
      `cmdpal-option-${reactId}-${index}-${item.type}-${item.id}`,
    [reactId],
  );

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
      } else if (e.key === 'Escape') {
        // AntD Modal handles Escape at the document level via
        // onCancel, but routing it explicitly here is defense-in-
        // depth: AntD <Input> can swallow Escape (e.g. allowClear's
        // built-in clear-on-Escape behavior in some versions),
        // which would prevent the Modal's Escape from firing.
        e.preventDefault();
        onClose();
      }
    },
    [results, activeIndex, select, onClose],
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

  const activeOption: GlobalSearchResult | undefined = results[activeIndex];
  const activeDescendantId = activeOption ? optionId(activeOption, activeIndex) : undefined;
  const expanded = results.length > 0;

  // Scroll the active option into view as the user navigates with
  // Arrow keys, so the keyboard pointer can never run off-screen.
  // The scrollIntoView guard keeps the component testable in jsdom
  // (which does not implement Element.scrollIntoView).
  useEffect(() => {
    if (!activeDescendantId) return;
    const el = document.getElementById(activeDescendantId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeDescendantId]);

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
        prefix={<SearchOutlined aria-hidden="true" />}
        placeholder={t.search.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        size="large"
        allowClear
        style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}
        // Phase 2i — combobox-with-listbox a11y wiring
        role="combobox"
        aria-label={t.search.placeholder}
        aria-controls={listboxId}
        aria-expanded={expanded}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendantId}
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
          // Phase 2i — listbox wrapper (see file-top doc comment)
          <div role="listbox" id={listboxId} aria-label={t.search.placeholder}>
            <List
              dataSource={results}
              renderItem={(item, index) => {
                const isActive = index === activeIndex;
                const id = optionId(item, index);
                // Composed accessible name mirroring the visible
                // row content (type + title + optional subtitle).
                const ariaLabel =
                  `${typeLabel(item.type)}: ${item.title}` +
                  (item.subtitle ? ` — ${item.subtitle}` : '');
                return (
                  <List.Item
                    key={`${item.type}-${item.id}`}
                    id={id}
                    role="option"
                    aria-selected={isActive}
                    aria-label={ariaLabel}
                    onClick={() => select(item)}
                    // Sync mouse hover with keyboard active so the
                    // visible "active" highlight tracks the user's
                    // pointer too — this is the standard command-
                    // palette pattern (Linear, VS Code, GitHub
                    // command-K) and makes the visual active state
                    // match hover (as required by Phase 2i).
                    onMouseEnter={() => setActiveIndex(index)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 16px',
                      background: isActive ? 'var(--bg-elevated)' : undefined,
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          {/* Decorative — duplicated in aria-label */}
                          <Tag
                            color={TYPE_COLORS[item.type] ?? 'default'}
                            aria-hidden="true"
                          >
                            {typeLabel(item.type)}
                          </Tag>
                          {item.title}
                        </span>
                      }
                      description={item.subtitle}
                    />
                  </List.Item>
                );
              }}
            />
          </div>
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
