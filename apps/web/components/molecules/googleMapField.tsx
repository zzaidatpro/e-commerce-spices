'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapFieldProps {
  defaultValue?: string;
  defaultLat?: string;
  defaultLong?: string;
}

export default function GoogleMapFieldWithPreview({ 
  defaultValue = '', 
  defaultLat = '', 
  defaultLong = '' 
}: GoogleMapFieldProps) {
  const [mapUrl, setMapUrl] = useState(defaultValue);
  const [lat, setLat] = useState(defaultLat ?? '');
  const [long, setLong] = useState(defaultLong ?? '');
  const [embedUrl, setEmbedUrl] = useState(defaultValue ? getSimpleEmbedUrl(defaultValue) : '');
  const [loading, setLoading] = useState(false);

  function getSimpleEmbedUrl(inputUrl: string) {
    if (!inputUrl) return '';
    if (inputUrl.includes('q=')) {
      const coords = inputUrl.split('q=')[1];
      return `https://maps.google.com/maps?q=${coords}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(inputUrl)}&z=15&output=embed`;
  }

  // Extraire automatiquement lat et long si l'URL contient des coordonnées (ex: ?q=36.75,3.04)
  const extractCoordsFromUrl = (url: string) => {
    if (url.includes('q=')) {
      const match = url.match(/q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (match && match[1] && match[2]) {
        setLat(match[1]);
        setLong(match[2]);
      }
    }
  };

  useEffect(() => {
    if (defaultValue) {
      setMapUrl(defaultValue);
      setEmbedUrl(getSimpleEmbedUrl(defaultValue));
      extractCoordsFromUrl(defaultValue);
    }
  }, [defaultValue]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMapUrl(val);
    setEmbedUrl(getSimpleEmbedUrl(val));
    extractCoordsFromUrl(val);
  };

  const handleGetExactLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toString();
        const longitude = position.coords.longitude.toString();
        
        setLat(latitude);
        setLong(longitude);
        
        const exactUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setMapUrl(exactUrl);
        setEmbedUrl(getSimpleEmbedUrl(exactUrl));
        setLoading(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error);
        alert("Impossible de récupérer votre position.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Champs cachés transmis dans le FormData sous forme de string */}
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="long" value={long} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="urlGoogleMap" className="text-xs font-semibold text-foreground">
            Google Maps (URL / Position GPS)
          </label>
          <button
            type="button"
            onClick={handleGetExactLocation}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] text-shop-orange hover:underline font-medium disabled:opacity-50 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            {loading ? 'Localisation...' : 'Obtenir ma position exacte'}
          </button>
        </div>

        <input
          id="urlGoogleMap"
          name="urlGoogleMap"
          type="url"
          value={mapUrl}
          onChange={handleUrlChange}
          placeholder="https://maps.google.com/..."
          className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
        />
      </div>

      {embedUrl && (
        <div className="w-full h-40 rounded-xl overflow-hidden border border-border shadow-2xs">
          <iframe
            title="Aperçu Google Maps"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}