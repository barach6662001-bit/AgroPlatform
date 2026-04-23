import { useCallback, useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import {
  useDashboardQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import { KpiSkeleton, ChartSkeleton, TableSkeleton as TableSkeletonNew } from '../components/Skeletons';
import DashboardV2, { type DashboardPeriod } from './DashboardV2/DashboardV2';
import { periodToRange } from '../utils/periodToRange';
import { useTenantDataBoundaries, useTenantSeasons } from '../hooks/useTenantDataBoundaries';

const VALID_PERIODS: DashboardPeriod[] = ['day', 'week', 'month', 'season'];

const isIsoDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

const parseYmd = (v: string | null): Dayjs | null => {
  if (!isIsoDate(v)) return null;
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

const toYmd = (d: Dayjs) => d.format('YYYY-MM-DD');

/**
 * Real /dashboard route — thin container around the pure presentational
 * {@link DashboardV2}.  Handles role-based redirects, onboarding guard,
 * data fetching and loading / error states; everything visual lives in
 * {@link DashboardV2}.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  // Period is persisted in the URL so refresh/share/back-button all work.
  // Invalid / missing values fall back to "season" (all-time).
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPeriod = searchParams.get('period');
  const period: DashboardPeriod = (VALID_PERIODS as string[]).includes(rawPeriod ?? '')
    ? (rawPeriod as DashboardPeriod)
    : 'season';
  const setPeriod = useCallback((p: DashboardPeriod) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('from');
      next.delete('to');
      if (p === 'season') next.delete('period');
      else next.set('period', p);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const fromDate = parseYmd(urlFrom);
  const toDate = parseYmd(urlTo);
  const hasExplicitRange = fromDate !== null && toDate !== null;

  const setRange = useCallback((from: Dayjs | null, to: Dayjs | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (from && to) {
        next.set('from', toYmd(from));
        next.set('to', toYmd(to));
      } else {
        next.delete('from');
        next.delete('to');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const { data: boundaries } = useTenantDataBoundaries();
  const { data: seasons } = useTenantSeasons();

  const resolvedWindow = useMemo(() => {
    if (period === 'season') {
      if (hasExplicitRange && fromDate && toDate) {
        return { from: fromDate.startOf('day'), to: toDate.endOf('day') };
      }
      return null;
    }

    if (hasExplicitRange && fromDate && toDate) {
      return { from: fromDate.startOf('day'), to: toDate.endOf('day') };
    }

    const now = dayjs();
    if (period === 'day') {
      return { from: now.startOf('day'), to: now.endOf('day') };
    }
    if (period === 'week') {
      return { from: now.subtract(6, 'day').startOf('day'), to: now.endOf('day') };
    }

    return { from: now.startOf('month').startOf('day'), to: now.endOf('day') };
  }, [period, hasExplicitRange, fromDate, toDate]);

  const range = useMemo(() => {
    if (period === 'season') {
      if (!resolvedWindow) return undefined;
      return { from: resolvedWindow.from.toISOString(), to: resolvedWindow.to.toISOString() };
    }

    if (resolvedWindow) {
      return { from: resolvedWindow.from.toISOString(), to: resolvedWindow.to.toISOString() };
    }

    return periodToRange(period);
  }, [period, resolvedWindow]);

  const sortedSeasons = useMemo(() => (seasons ?? []).slice().sort((a, b) => a - b), [seasons]);

  const resolvedRangeLabel = useMemo(() => {
    if (period === 'season') {
      if (hasExplicitRange && fromDate) return String(fromDate.year());
      return t.dashboard.allTime ?? 'Весь час';
    }

    if (!resolvedWindow) {
      return t.dashboard.allTime ?? 'Весь час';
    }

    const fromText = resolvedWindow.from.format('DD.MM.YYYY');
    const toText = resolvedWindow.to.format('DD.MM.YYYY');
    if (fromText === toText) return fromText;
    return `${fromText} - ${toText}`;
  }, [period, hasExplicitRange, fromDate, resolvedWindow, t.dashboard.allTime]);

  const minBound = boundaries?.minOperationDate ? dayjs(boundaries.minOperationDate).startOf('day') : null;
  const todayBound = dayjs().endOf('day');
  const rawMaxBound = boundaries?.maxOperationDate ? dayjs(boundaries.maxOperationDate).endOf('day') : null;
  const maxBound = rawMaxBound ? (rawMaxBound.isBefore(todayBound) ? rawMaxBound : todayBound) : null;

  const shiftWindow = useCallback((step: -1 | 1) => {
    if (!resolvedWindow) return null;
    if (period === 'day') {
      return {
        from: resolvedWindow.from.add(step, 'day'),
        to: resolvedWindow.to.add(step, 'day'),
      };
    }

    if (period === 'week') {
      return {
        from: resolvedWindow.from.add(step * 7, 'day'),
        to: resolvedWindow.to.add(step * 7, 'day'),
      };
    }

    return {
      from: resolvedWindow.from.add(step, 'month'),
      to: resolvedWindow.to.add(step, 'month'),
    };
  }, [period, resolvedWindow]);

  const currentSeasonYear = useMemo(() => {
    if (period !== 'season') return null;
    if (hasExplicitRange && fromDate) return fromDate.year();
    if (sortedSeasons.length > 0) return sortedSeasons[sortedSeasons.length - 1];
    return dayjs().year();
  }, [period, hasExplicitRange, fromDate, sortedSeasons]);

  const disableStepPrev = useMemo(() => {
    if (!minBound) return true;

    if (period === 'season') {
      if (!currentSeasonYear) return true;
      const idx = sortedSeasons.indexOf(currentSeasonYear);
      return idx <= 0;
    }

    const prev = shiftWindow(-1);
    if (!prev) return true;
    return prev.from.isBefore(minBound);
  }, [minBound, period, currentSeasonYear, sortedSeasons, shiftWindow]);

  const disableStepNext = useMemo(() => {
    if (!maxBound) return true;

    if (period === 'season') {
      if (!currentSeasonYear) return true;
      const idx = sortedSeasons.indexOf(currentSeasonYear);
      return idx < 0 || idx >= sortedSeasons.length - 1;
    }

    const next = shiftWindow(1);
    if (!next) return true;
    return next.to.isAfter(maxBound);
  }, [maxBound, period, currentSeasonYear, sortedSeasons, shiftWindow]);

  const stepPeriod = useCallback((step: -1 | 1) => {
    if (period === 'season') {
      if (!currentSeasonYear || sortedSeasons.length === 0) return;
      const currentIndex = sortedSeasons.indexOf(currentSeasonYear);
      const nextIndex = currentIndex + step;
      if (nextIndex < 0 || nextIndex >= sortedSeasons.length) return;
      const targetYear = sortedSeasons[nextIndex];
      setRange(dayjs(`${targetYear}-01-01`), dayjs(`${targetYear}-12-31`));
      return;
    }

    const next = shiftWindow(step);
    if (!next) return;
    setRange(next.from, next.to);
  }, [period, currentSeasonYear, sortedSeasons, setRange, shiftWindow]);

  const handleStepPrev = useCallback(() => {
    if (disableStepPrev) return;
    stepPeriod(-1);
  }, [disableStepPrev, stepPeriod]);

  const handleStepNext = useCallback(() => {
    if (disableStepNext) return;
    stepPeriod(1);
  }, [disableStepNext, stepPeriod]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        handleStepPrev();
      } else if (event.key === 'ArrowRight') {
        handleStepNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStepPrev, handleStepNext]);

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery(range);
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (role === 'SuperAdmin') {
    return <Navigate to="/superadmin" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  const loading = dashLoading || fieldsLoading || opsLoading;
  if (loading) {
    return (
      <>
        <KpiSkeleton count={4} />
        <ChartSkeleton />
        <TableSkeletonNew />
      </>
    );
  }
  if (!data) return null;

  const fields: FieldDto[] = fieldsData?.items ?? [];
  const operations: AgroOperationDto[] = operationsData?.items ?? [];

  return (
    <DashboardV2
      data={data}
      fields={fields}
      operations={operations}
      period={period}
      onPeriodChange={setPeriod}
      resolvedRangeLabel={resolvedRangeLabel}
      onStepPrev={handleStepPrev}
      onStepNext={handleStepNext}
      disableStepPrev={disableStepPrev}
      disableStepNext={disableStepNext}
    />
  );
}
