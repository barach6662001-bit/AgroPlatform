import { useEffect, useState } from 'react';
import { Card, Spin, Typography } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import apiClient from '../api/axios';
import s from './WeatherWidget.module.css';

const { Text } = Typography;

interface WeatherData {
  name?: string;
  main?: { temp: number; humidity: number; feels_like: number };
  wind?: { speed: number };
  weather?: { description: string; icon: string }[];
  error?: string;
}

const DEFAULT_LAT = 49.0;
const DEFAULT_LON = 31.5;

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = (lat: number, lon: number) => {
      apiClient
        .get<WeatherData>('/api/weather/current', { params: { lat, lon } })
        .then((r) => setData(r.data))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
  }, []);

  if (loading) return <Spin size="small" />;
  if (!data || data.error || !data.main) return null;

  const icon = data.weather?.[0]?.icon;
  const desc = data.weather?.[0]?.description ?? '';

  return (
    <Card
      size="small"
      className={s.bg}
      styles={{ body: { padding: '10px 14px' } }}
    >
      <div className={s.flex_center}>
        {icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${icon}.png`}
            alt={desc}
            className={s.block2}
          />
        ) : (
          <CloudOutlined className={s.text32} />
        )}
        <div>
          <div className={s.text22}>
            {Math.round(data.main.temp)}°C
          </div>
          <Text className={s.text12}>{desc}</Text>
        </div>
        <div className={s.text121}>
          <div>💧 {data.main.humidity}%</div>
          <div>💨 {data.wind?.speed} м/с</div>
          <div>🌡 {Math.round(data.main.feels_like)}°C</div>
          {data.name && <div>📍 {data.name}</div>}
        </div>
      </div>
    </Card>
  );
}
