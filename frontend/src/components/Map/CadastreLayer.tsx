import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

const TILE_URL = '/api/cadastre/tile/{z}/{x}/{y}';

const LAYER_STYLES: L.VectorGrid.ProtobufOptions['vectorTileLayerStyles'] = {
  kadastr: {
    fillColor: '#FFD700',
    fillOpacity: 0.25,
    color: '#FF8C00',
    weight: 1,
    fill: true,
  },
};

interface Props {
  enabled: boolean;
}

export default function CadastreLayer({ enabled }: Props) {
  const map = useMap();
  const layerRef = useRef<L.VectorGrid.Protobuf | null>(null);

  useEffect(() => {
    if (enabled) {
      const layer = L.vectorGrid.protobuf(TILE_URL, {
        vectorTileLayerStyles: LAYER_STYLES,
        maxZoom: 22,
        maxNativeZoom: 18,
      });
      layer.addTo(map);
      layerRef.current = layer;
    } else if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, enabled]);

  return null;
}
