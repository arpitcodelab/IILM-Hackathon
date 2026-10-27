import React, { useEffect, useRef } from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface EmergencyMapProps {
  origin?: { lat?: number; lng?: number; name?: string; address?: string };
  destination?: { lat?: number; lng?: number; name?: string };
  etaMinutes?: number;
  distanceKm?: number;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  origin = { lat: 28.628, lng: 77.365, name: 'Sector 62, Noida' },
  destination = { lat: 28.544, lng: 77.288, name: 'Apollo Hospital Emergency Dept.' },
  etaMinutes = 7,
  distanceKm = 2.3,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMap() {
      if (!mapContainerRef.current) return;

      try {
        const L = await import('leaflet');
        if (!isMounted || !mapContainerRef.current) return;

        // Clean up existing map instance if any
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([28.58, 77.33], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Origin custom marker
        const originIcon = L.divIcon({
          className: 'custom-map-marker-origin',
          html: `<div style="background-color:#EF4444; width:32px; height:32px; border-radius:50%; border:3px solid #FFF; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(239,68,68,0.7); color:#FFF; font-size:16px;">🚑</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Destination custom marker
        const destIcon = L.divIcon({
          className: 'custom-map-marker-dest',
          html: `<div style="background-color:#2563EB; width:34px; height:34px; border-radius:50%; border:3px solid #FFF; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(37,99,235,0.7); color:#FFF; font-size:16px;">🏥</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const originLat = origin?.lat || 28.628;
        const originLng = origin?.lng || 77.365;
        const destLat = destination?.lat || 28.544;
        const destLng = destination?.lng || 77.288;

        const m1 = L.marker([originLat, originLng], { icon: originIcon }).addTo(map);
        const m2 = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);

        // Connect with route line
        const latlngs: [number, number][] = [
          [originLat, originLng],
          [28.61, 77.34],
          [28.59, 77.31],
          [destLat, destLng],
        ];

        L.polyline(latlngs, {
          color: '#EF4444',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8',
        }).addTo(map);

        leafletMapRef.current = map;
      } catch (e) {
        console.warn('Map initialization failed:', e);
      }
    }

    loadMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '360px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0F172A' }} />

      {/* Floating Status Pill */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 500,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid #1E293B',
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        color: '#10B981',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
        Live Location
      </div>

      {/* Floating ETA Card on Map */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontSize: '0.8125rem',
        fontWeight: 700,
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)',
        textAlign: 'center',
      }}>
        <div>Patient Location</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>
          {distanceKm} km • ~{etaMinutes} mins
        </div>
      </div>

      {/* Hospital Destination Label */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        padding: '0.4rem 0.85rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <MapPin size={14} color="#2563EB" />
        {destination.name}
      </div>
    </div>
  );
};
