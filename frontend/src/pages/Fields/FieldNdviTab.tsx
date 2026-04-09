import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Alert, Spin, Typography, Slider } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useTranslation } from '../../i18n';
import { getFieldNdvi, getFieldNdviDates, reportNdviProblem } from '../../api/satellite';
import type { NdviData } from '../../api/satellite';
import EmptyState from '../../components/EmptyState';
import s from './FieldNdviTab.module.css';

interface Props {
  fieldId: string;
}

// Fit map to bounds whenever bounds change
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

/** Analyse an NDVI overlay image for stressed (red-dominant) pixels.
 *  Returns the percentage of visible pixels that appear stressed, or null if analysis failed. */
function analyseNdviImage(imageUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 256;
          canvas.height = img.naturalHeight || 256;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let visiblePixels = 0;
          let stressedPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            // Skip transparent or near-transparent pixels (no-data)
            if (a < MIN_VISIBLE_ALPHA) continue;
            // Skip very dark pixels (no-data / black)
            if (r < MAX_NO_DATA_RGB && g < MAX_NO_DATA_RGB && b < MAX_NO_DATA_RGB) continue;
            visiblePixels++;
            // Stressed pixel: red channel clearly dominant over green
            if (r > MIN_STRESS_RED_VALUE && r > g * STRESS_RED_TO_GREEN_RATIO) {
              stressedPixels++;
            }
          }
          if (visiblePixels === 0) { resolve(null); return; }
          resolve(Math.round((stressedPixels / visiblePixels) * 100));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageUrl;
    } catch {
      resolve(null);
    }
  });
}

// Detection thresholds for canvas pixel analysis
const MIN_VISIBLE_ALPHA = 30;   // below this alpha value the pixel is considered transparent / no-data
const MAX_NO_DATA_RGB = 20;     // pixels with all channels below this value are black / no-data
const MIN_STRESS_RED_VALUE = 150; // minimum red channel value for a "stressed" pixel
const STRESS_RED_TO_GREEN_RATIO = 1.6; // red must be at least this many times higher than green
const PROBLEM_THRESHOLD = 10; // percent of stressed pixels to trigger alert

export default function FieldNdviTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const [ndvi, setNdvi] = useState<NdviData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  const [problemDetected, setProblemDetected] = useState(false);
  const [problemPercent, setProblemPercent] = useState(0);
  const [analysisDone, setAnalysisDone] = useState(false);
  const notificationSentRef = useRef(false);

  // Load available dates once on mount
  useEffect(() => {
    getFieldNdviDates(fieldId)
      .then((dates) => {
        setAvailableDates(dates);
        // Select the latest date by default (last in the array)
        setSelectedDateIndex(dates.length > 0 ? dates.length - 1 : 0);
      })
      .catch(() => {
        // Non-critical: fall back to no slider, NDVI still loads with default date
        setAvailableDates([]);
      });
  }, [fieldId]);

  const selectedDate = availableDates.length > 0 ? availableDates[selectedDateIndex] : undefined;

  const sliderMarks = useMemo(() => {
    return availableDates.reduce<Record<number, string>>((acc, date, idx) => {
      // Show mark only for first, last, and selected index to keep it readable
      if (idx === 0 || idx === availableDates.length - 1 || idx === selectedDateIndex) {
        acc[idx] = date;
      }
      return acc;
    }, {});
  }, [availableDates, selectedDateIndex]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProblemDetected(false);
    setProblemPercent(0);
    setAnalysisDone(false);
    notificationSentRef.current = false;

    getFieldNdvi(fieldId, selectedDate)
      .then((data) => setNdvi(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [fieldId, selectedDate]);

  // Run canvas analysis once the NDVI image URL is known
  useEffect(() => {
    if (!ndvi?.imageUrl || analysisDone) return;

    analyseNdviImage(ndvi.imageUrl).then((percent) => {
      setAnalysisDone(true);
      if (percent === null) return; // analysis failed gracefully
      if (percent >= PROBLEM_THRESHOLD) {
        setProblemDetected(true);
        setProblemPercent(percent);
        // Send backend notification exactly once per load
        if (!notificationSentRef.current) {
          notificationSentRef.current = true;
          reportNdviProblem(fieldId, {
            date: ndvi.date,
            stressedPercent: percent,
            message: t.fields.ndviProblemZoneBody.replace('{{percent}}', String(percent)),
          }).catch(() => { /* notification failure is non-critical */ });
        }
      }
    });
  }, [ndvi, analysisDone, fieldId, t]);

  if (loading) {
    return (
      <div className={s.flex_centered}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ndvi || !ndvi.bounds) {
    return (
      <EmptyState
        message={t.fields.ndviNoData}
        icon={<GlobalOutlined style={{ fontSize: 24, color: 'var(--text-tertiary)' }} />}
      />
    );
  }

  // When Sentinel Hub is not configured, show degraded state instead of
  // a functional-looking placeholder map.
  if (!ndvi.configured) {
    return (
      <div className={s.emptyWrapper}>
        <EmptyState
          message={t.fields.ndviNotConfiguredTitle}
        />
        <p className={s.configHint}>{t.fields.ndviNotConfiguredDescription}</p>
      </div>
    );
  }

  // Leaflet expects [[minLat, minLon], [maxLat, maxLon]]
  const leafletBounds: LatLngBoundsExpression = [
    [ndvi.bounds[1], ndvi.bounds[0]],
    [ndvi.bounds[3], ndvi.bounds[2]],
  ];

  return (
    <div>
      {problemDetected && (
        <Alert
          type="error"
          showIcon
          message={t.fields.ndviProblemZoneDetected}
          description={t.fields.ndviProblemZoneBody.replace('{{percent}}', String(problemPercent))}
          className={s.spaced1}
          closable
        />
      )}

      <div className={s.block4}>
        <MapContainer
          className={s.fullWidth}
          center={[48.5, 35.0]}
          zoom={10}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FitBounds bounds={leafletBounds} />
          <ImageOverlay
            url={ndvi.imageUrl}
            bounds={leafletBounds}
            opacity={0.75}
          />
        </MapContainer>

        {/* NDVI Legend overlay */}
        <Card
          size="small"
          className={s.bg}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Typography.Text strong className={s.text12}>
            {t.fields.tabNdvi}
          </Typography.Text>
          {[
            { color: '#4caf50', label: t.fields.ndviLegendHealthy },
            { color: '#ffeb3b', label: t.fields.ndviLegendModerate },
            { color: '#f44336', label: t.fields.ndviLegendStress },
          ].map(({ color, label }) => (
            <div key={label} className={s.flex_center}>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: color,
                  flexShrink: 0,
                }}
              />
              <Typography.Text className={s.text121}>{label}</Typography.Text>
            </div>
          ))}
        </Card>
      </div>

      <Typography.Text type="secondary" className={s.text122}>
        {ndvi.date}
      </Typography.Text>

      {availableDates.length > 1 && (
        <div className={s.spaced2}>
          <Typography.Text strong className={s.text13}>
            {t.fields.ndviDateSliderLabel}
          </Typography.Text>
          <Typography.Text type="secondary" className={s.text123}>
            {t.fields.ndviSelectedDate} {availableDates[selectedDateIndex]}
          </Typography.Text>
          <Slider
            min={0}
            max={availableDates.length - 1}
            value={selectedDateIndex}
            onChange={(val) => setSelectedDateIndex(val)}
            marks={sliderMarks}
            tooltip={{ formatter: (val) => val !== undefined ? availableDates[val] : '' }}
            className={s.spaced3}
          />
        </div>
      )}
    </div>
  );
}
