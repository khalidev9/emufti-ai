import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Compass, Clock, MapPin, ChevronDown, Check, Crosshair, Sparkles, AlertCircle } from 'lucide-react';
import {
  ISLAMIC_CITIES,
  IslamicCity,
  calculatePrayerTimes,
  calculateQiblaDirection,
  PrayerTimeData,
} from '../../lib/islamicCalendarService';
import { getUserCity, setUserCity } from '../../lib/storage';

interface GeoLocationState {
  latitude: number;
  longitude: number;
  label: string;
}

const GEO_STORAGE_KEY = 'emufti_user_geolocation';

export const PrayerTimesWidget: React.FC = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>(() => getUserCity());
  const [geoState, setGeoState] = useState<GeoLocationState | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(GEO_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return null;
  });

  const [useLiveGeo, setUseLiveGeo] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('emufti_use_live_geo') === 'true';
      }
    } catch {}
    return false;
  });

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Determine active city/coordinates
  const activeLocation: IslamicCity = useMemo(() => {
    if (useLiveGeo && geoState) {
      return {
        id: 'live_geo',
        name: geoState.label || 'Goobtaada Hadda',
        country: `${geoState.latitude.toFixed(2)}°, ${geoState.longitude.toFixed(2)}°`,
        latitude: geoState.latitude,
        longitude: geoState.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
    }
    return ISLAMIC_CITIES.find((c) => c.id === selectedCityId) || ISLAMIC_CITIES[0];
  }, [useLiveGeo, geoState, selectedCityId]);

  const [prayerData, setPrayerData] = useState<PrayerTimeData>(() => calculatePrayerTimes(activeLocation));
  const [qiblaDegrees, setQiblaDegrees] = useState<number>(() =>
    calculateQiblaDirection(activeLocation.latitude, activeLocation.longitude)
  );

  // Geolocation detector function
  const detectLiveLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Find closest recognized Islamic city as a friendly label
        let closestCity = ISLAMIC_CITIES[0];
        let minDistance = Infinity;

        for (const c of ISLAMIC_CITIES) {
          const dLat = c.latitude - lat;
          const dLng = c.longitude - lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = c;
          }
        }

        const label = minDistance < 1.0 ? closestCity.name : `Goobtaada (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;

        const newGeo: GeoLocationState = {
          latitude: lat,
          longitude: lng,
          label,
        };

        setGeoState(newGeo);
        setUseLiveGeo(true);
        setGeoLoading(false);

        try {
          localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(newGeo));
          localStorage.setItem('emufti_use_live_geo', 'true');
        } catch {}
      },
      (error) => {
        setGeoLoading(false);
        let msg = 'Unable to access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Using chosen city.';
        }
        setGeoError(msg);
        setUseLiveGeo(false);
        try {
          localStorage.setItem('emufti_use_live_geo', 'false');
        } catch {}
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Attempt automatic live location detection on mount if not yet denied
  useEffect(() => {
    if (navigator.geolocation && (useLiveGeo || !geoState)) {
      // Auto-detect silently
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const label = `Goobtaada (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
          const newGeo = { latitude: lat, longitude: lng, label };
          setGeoState(newGeo);
          setUseLiveGeo(true);
          try {
            localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(newGeo));
            localStorage.setItem('emufti_use_live_geo', 'true');
          } catch {}
        },
        () => {
          // Keep current city fallback
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    }
  }, []);

  // Update calculations when active location changes
  useEffect(() => {
    setPrayerData(calculatePrayerTimes(activeLocation));
    setQiblaDegrees(calculateQiblaDirection(activeLocation.latitude, activeLocation.longitude));
    if (!useLiveGeo) {
      setUserCity(activeLocation.id);
    }
  }, [activeLocation, useLiveGeo]);

  // Update countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(activeLocation));
    }, 60000);
    return () => clearInterval(timer);
  }, [activeLocation]);

  const prayers = [
    { name: 'Fajr', label: 'Bilaaw / Fajr', time: prayerData.fajr, icon: '🌅' },
    { name: 'Sunrise', label: 'Qorrax Soo-bax', time: prayerData.sunrise, icon: '☀️' },
    { name: 'Dhuhr', label: 'Duhur', time: prayerData.dhuhr, icon: '☀️' },
    { name: 'Asr', label: 'Casar', time: prayerData.asr, icon: '🌤️' },
    { name: 'Maghrib', label: 'Maqrib', time: prayerData.maghrib, icon: '🌇' },
    { name: 'Isha', label: 'Cishe', time: prayerData.isha, icon: '🌙' },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-blue-200 transition-all w-full max-w-full box-border">
      {/* Header with City / Geolocation Selector and Next Prayer Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Salaadaha & Qiblada (Prayer Times)</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer py-0.5 px-2 rounded-lg hover:bg-blue-50/60 transition-colors border border-transparent hover:border-blue-200"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {activeLocation.name}
                  {activeLocation.country ? `, ${activeLocation.country}` : ''}
                </span>
                <ChevronDown className="w-3 h-3 text-blue-600" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-68 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 max-h-64 overflow-y-auto no-scrollbar space-y-0.5">
                  {/* Option: Use Live Geolocation */}
                  <button
                    type="button"
                    onClick={() => {
                      detectLiveLocation();
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer border-b border-slate-100 mb-1 ${
                      useLiveGeo ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800 hover:bg-blue-50/50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                      <span>Adeegso Goobtayda (Live GPS)</span>
                    </span>
                    {useLiveGeo && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Magaalooyinka (Select City)
                  </div>

                  {ISLAMIC_CITIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCityId(c.id);
                        setUserCity(c.id);
                        setUseLiveGeo(false);
                        try {
                          localStorage.setItem('emufti_use_live_geo', 'false');
                        } catch {}
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        !useLiveGeo && c.id === activeLocation.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>
                        {c.name}, {c.country}
                      </span>
                      {!useLiveGeo && c.id === activeLocation.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Live Status Indicator & Quick Locate Button */}
            <button
              type="button"
              onClick={detectLiveLocation}
              disabled={geoLoading}
              title="Detect my current location with GPS"
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                useLiveGeo
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Crosshair className={`w-3 h-3 ${geoLoading ? 'animate-spin text-blue-600' : 'text-blue-500'}`} />
              <span>{geoLoading ? 'Helaya goobta...' : useLiveGeo ? 'GPS Toos ah' : 'Aqoonso Goobta'}</span>
            </button>
          </div>

          {geoError && (
            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{geoError}</span>
            </p>
          )}
        </div>

        {/* Next Prayer Countdown Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200/70 text-xs font-semibold text-blue-800 shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            Next: <strong className="font-extrabold text-blue-700">{prayerData.nextPrayer.name}</strong> in{' '}
            {prayerData.nextPrayer.formattedCountdown} ({prayerData.nextPrayer.time})
          </span>
        </div>
      </div>

      {/* 5 Prayers Visual Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {prayers.map((p) => {
          const isNext = prayerData.nextPrayer.name === p.name;
          return (
            <div
              key={p.name}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                isNext
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-[1.02]'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <span className="text-sm block">{p.icon}</span>
              <span className={`text-[11px] block mt-1 font-semibold truncate ${isNext ? 'text-blue-100' : 'text-slate-500'}`}>
                {p.name}
              </span>
              <span className={`text-xs block font-mono font-bold mt-0.5 truncate ${isNext ? 'text-white' : 'text-slate-900'}`}>
                {p.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Qibla Direction Compass Bar */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 transition-transform duration-500"
            style={{ transform: `rotate(${qiblaDegrees}deg)` }}
            title={`Qibla: ${qiblaDegrees}° towards Makkah`}
          >
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 block truncate">
              Jiheynta Qiblada (Qibla Bearing): {qiblaDegrees}° N
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              Toos u aaddan Kacbada (Makkah Al-Mukarramah) laga bilaabo {activeLocation.name}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-blue-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-xl shrink-0 shadow-xs">
          {qiblaDegrees}°
        </span>
      </div>
    </div>
  );
};
