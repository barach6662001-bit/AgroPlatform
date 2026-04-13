// Demo field polygons in Poltava oblast area
// Each field corresponds to existing seed data by name

export interface FieldBoundary {
  fieldName: string;
  coordinates: [number, number][]; // [lng, lat] pairs forming polygon
  color: string; // fill color by crop
}

export const fieldBoundaries: FieldBoundary[] = [
  {
    fieldName: 'Балка-5',
    coordinates: [
      [34.530, 49.600], [34.540, 49.600], [34.542, 49.592],
      [34.535, 49.588], [34.528, 49.590], [34.530, 49.600],
    ],
    color: '#A855F7', // Ріпак — purple
  },
  {
    fieldName: 'Захід-1',
    coordinates: [
      [34.510, 49.595], [34.525, 49.596], [34.526, 49.588],
      [34.515, 49.586], [34.510, 49.590], [34.510, 49.595],
    ],
    color: '#FBBF24', // Пшениця — amber
  },
  {
    fieldName: 'Луг-6',
    coordinates: [
      [34.545, 49.580], [34.565, 49.582], [34.568, 49.572],
      [34.555, 49.568], [34.543, 49.572], [34.545, 49.580],
    ],
    color: '#14B8A6', // Соя — teal
  },
  {
    fieldName: 'Пар-7',
    coordinates: [
      [34.570, 49.590], [34.582, 49.591], [34.584, 49.585],
      [34.575, 49.583], [34.570, 49.586], [34.570, 49.590],
    ],
    color: '#94A3B8', // Пар — gray
  },
  {
    fieldName: 'Північ-3',
    coordinates: [
      [34.548, 49.605], [34.565, 49.607], [34.568, 49.598],
      [34.558, 49.595], [34.546, 49.598], [34.548, 49.605],
    ],
    color: '#22C55E', // Кукурудза — green
  },
  {
    fieldName: 'Степ-4',
    coordinates: [
      [34.585, 49.598], [34.602, 49.600], [34.605, 49.590],
      [34.595, 49.587], [34.583, 49.591], [34.585, 49.598],
    ],
    color: '#0EA5E9', // Ячмінь — sky blue
  },
  {
    fieldName: 'Схід-2',
    coordinates: [
      [34.608, 49.588], [34.622, 49.590], [34.624, 49.582],
      [34.615, 49.579], [34.606, 49.582], [34.608, 49.588],
    ],
    color: '#F97316', // Соняшник — orange
  },
];

export const MAP_CENTER: [number, number] = [49.590, 34.560]; // lat, lng
export const MAP_ZOOM = 13;
