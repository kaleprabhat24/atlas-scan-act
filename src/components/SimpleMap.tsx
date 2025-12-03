import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Claim {
  id: string;
  name: string;
  village: string;
  district: string;
  area_ha: number;
  lat: number;
  lon: number;
  status: 'pending' | 'approved' | 'rejected';
  ndvi_flag: boolean;
}

interface SimpleMapProps {
  claims: Claim[];
  showRiskOverlay: boolean;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SimpleMap = ({ claims, showRiskOverlay }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView([21.7679, 78.8718], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current!.removeLayer(layer);
      }
    });

    // Add markers for claims
    claims.forEach((claim) => {
      if (!mapInstanceRef.current) return;

      const marker = L.marker([claim.lat, claim.lon]).addTo(mapInstanceRef.current);
      
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold">${claim.name}</h3>
          <p class="text-sm text-gray-600">${claim.village}, ${claim.district}</p>
          <p class="text-sm">Area: ${claim.area_ha} ha</p>
          <p class="text-sm">Status: <span class="font-medium">${claim.status}</span></p>
          ${claim.ndvi_flag ? '<p class="text-xs text-red-600">⚠️ NDVI Risk Flag</p>' : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });
  }, [claims, showRiskOverlay]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default SimpleMap;