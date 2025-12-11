import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/wallet-utils";

// Fix Leaflet default icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Mock Farcaster data - should match your global mock
const mockFarcasterProfile = {
  fid: "12345",
  username: "cryptotrader",
  displayName: "CryptoTrader",
  avatarUrl: "https://i.pravatar.cc/300?img=68",
};

// Custom marker icons with count badge
const createCustomIcon = (type: "buy" | "sell", count: number = 1) => {
  const color = type === "buy" ? "#22c55e" : "#3b82f6";
  const gradientColor = type === "buy" ? "#16a34a" : "#2563eb";
  
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${type}-${count}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${color}"/>
              <stop offset="100%" stop-color="${gradientColor}"/>
            </linearGradient>
            <filter id="shadow-${type}-${count}">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M18 2C9.716 2 3 8.716 3 17c0 8.284 15 27 15 27s15-18.716 15-27c0-8.284-6.716-15-15-15z" 
            fill="url(#grad-${type}-${count})" stroke="#fff" stroke-width="3" filter="url(#shadow-${type}-${count})"/>
          ircle cx="18" cy="17" r="8" fill="rgbaba(255,255,255,0.95)"/>
          <text x="18" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">
            ${type === "buy" ? "B" : "S"}
          </text>
        </svg>
        ${count > 1 ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${count}</div>
        ` : ''}
      </div>
    `,
    className: "custom-marker",
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });
};

// Temp mock geocoding - TODO: Replace with real geocoding API
const getCoordinates = (location: string): [number, number] => {
  const locationMap: { [key: string]: [number, number] } = {
    "mumbai": [19.0760, 72.8777],
    "delhi": [28.7041, 77.1025],
    "bangalore": [12.9716, 77.5946],
    "bengaluru": [12.9716, 77.5946],
    "kolkata": [22.5726, 88.3639],
    "chennai": [13.0827, 80.2707],
    "hyderabad": [17.3850, 78.4867],
    "pune": [18.5204, 73.8567],
  };

  const normalized = location.toLowerCase().trim();
  
  for (const [city, coords] of Object.entries(locationMap)) {
    if (normalized.includes(city)) return coords;
  }

  // Random fallback
  return [20 + Math.random() * 10, 72 + Math.random() * 15];
};

// Group offers by location
const groupOffersByLocation = (offers: any[]) => {
  const grouped = new Map<string, any[]>();
  
  offers.forEach((offer) => {
    const coords = getCoordinates(offer.location);
    const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push({ ...offer, coords });
  });
  
  return grouped;
};

// Generate popup content for single or multiple offers
const generatePopupContent = (offers: any[]) => {
  if (offers.length === 1) {
    return generateSingleOfferPopup(offers[0]);
  }
  return generateMultipleOffersPopup(offers);
};

const generateSingleOfferPopup = (offer: any) => {
  return `
    <div class="offer-popup-card">
      <style>
        .offer-popup-card {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 300px;
          max-width: 350px;
        }
        
        .offer-popup-header {
          padding: 16px;
          border-radius: 12px 12px 0 0;
          background: ${offer.type === "buy" ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"};
          color: white;
        }
        
        .offer-popup-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .offer-popup-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .offer-popup-amount {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        
        .offer-popup-range {
          font-size: 13px;
          opacity: 0.95;
          font-weight: 500;
        }
        
        .offer-popup-body {
          padding: 16px;
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #1f2937);
          max-height: 400px;
          overflow-y: auto;
        }
        
        @media (prefers-color-scheme: dark) {
          .offer-popup-body {
            background: #262626;
            color: #f5f5f5;
          }
        }
        
        .offer-popup-location {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-secondary, rgba(0, 0, 0, 0.05));
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 500;
        }
        
        @media (prefers-color-scheme: dark) {
          .offer-popup-location {
            background: rgba(255, 255, 255, 0.08);
          }
        }
        
        .offer-popup-section {
          margin-bottom: 14px;
        }
        
        .offer-popup-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          opacity: 0.7;
        }
        
        .payment-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .payment-chip {
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background: var(--color-secondary, rgba(0, 0, 0, 0.05));
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
        }
        
        @media (prefers-color-scheme: dark) {
          .payment-chip {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.15);
          }
        }
        
        .offer-popup-divider {
          height: 1px;
          background: var(--color-border, rgba(0, 0, 0, 0.1));
          margin: 14px 0;
        }
        
        @media (prefers-color-scheme: dark) {
          .offer-popup-divider {
            background: rgba(255, 255, 255, 0.1);
          }
        }
        
        .offer-popup-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        
        .user-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: 2px solid var(--color-surface, #ffffff);
        }
        
        @media (prefers-color-scheme: dark) {
          .user-avatar {
            border-color: #262626;
          }
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .verified-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-surface, #ffffff);
        }
        
        @media (prefers-color-scheme: dark) {
          .verified-badge {
            border-color: #262626;
          }
        }
        
        .user-details {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        
        .user-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .farcaster-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.2);
          flex-shrink: 0;
        }
        
        .user-role {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .view-btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: ${offer.type === "buy" ? "#22c55e" : "#3b82f6"};
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .view-btn:active {
          transform: translateY(0);
        }

        .exchange-rate-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.15);
          margin-top: 6px;
        }
      </style>
      
      <div class="offer-popup-header">
        <div class="offer-popup-badges">
          <span class="offer-popup-badge">
            <span class="pulse-dot"></span>
            ${offer.type === "buy" ? "Buying" : "Selling"}
          </span>
          <span class="offer-popup-badge">BASE</span>
          ${offer.isActive ? '<span class="offer-popup-badge">Active</span>' : ''}
        </div>
        <div class="offer-popup-amount">$${formatCurrency(offer.amount)}</div>
        <div class="offer-popup-range">USDC • $${offer.minLimit} - $${offer.maxLimit}</div>
        ${offer.exchangeRate ? `
          <div class="exchange-rate-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Rate: ${offer.exchangeRate}
          </div>
        ` : ''}
      </div>

      <div class="offer-popup-body">
        <div class="offer-popup-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            ircle cx="12" cy="1010" r="3"/>
          </svg>
          <span>${offer.location}</span>
        </div>

        ${offer.paymentMethods?.length > 0 ? `
          <div class="offer-popup-section">
            <div class="offer-popup-label">Payment Methods</div>
            <div class="payment-chips">
              ${offer.paymentMethods.map((m: string) => 
                `<span class="payment-chip">${m}</span>`
              ).join('')}
            </div>
          </div>
        ` : ''}

        ${offer.description ? `
          <div class="offer-popup-section">
            <div class="offer-popup-label">Description</div>
            <div style="font-size: 13px; line-height: 1.5; opacity: 0.8;">
              ${offer.description.substring(0, 120)}${offer.description.length > 120 ? '...' : ''}
            </div>
          </div>
        ` : ''}

        <div class="offer-popup-divider"></div>

        <div class="offer-popup-footer">
          <div class="user-info">
            <div class="user-avatar-wrapper">
              <div class="user-avatar">
                ${mockFarcasterProfile.avatarUrl ? 
                  `<img src="${mockFarcasterProfile.avatarUrl}" alt="${mockFarcasterProfile.displayName}" />` :
                  mockFarcasterProfile.displayName[0].toUpperCase()
                }
              </div>
              ${offer.user?.isVerified ? `
                <div class="verified-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              ` : ''}
            </div>
            <div class="user-details">
              <div class="user-name">
                <span style="overflow: hidden; text-overflow: ellipsis;">${mockFarcasterProfile.displayName}</span>
                <span class="farcaster-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  @${mockFarcasterProfile.username}
                </span>
              </div>
              <div class="user-role">${offer.user?.isVerified ? 'Verified Trader' : 'Trader'}</div>
            </div>
          </div>
          <button class="view-btn" onclick="window.viewOffer('${offer.id}')">
            View
          </button>
        </div>
      </div>
    </div>
  `;
};

const generateMultipleOffersPopup = (offers: any[]) => {
  const buyOffers = offers.filter(o => o.type === "buy");
  const sellOffers = offers.filter(o => o.type === "sell");
  
  return `
    <div class="offer-popup-card">
      <style>
        .offer-popup-card {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 320px;
          max-width: 380px;
        }
        
        .multi-offers-header {
          padding: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }
        
        .multi-offers-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .multi-offers-stats {
          display: flex;
          gap: 12px;
          font-size: 13px;
        }
        
        .multi-offers-body {
          padding: 16px;
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #1f2937);
          max-height: 450px;
          overflow-y: auto;
        }
        
        @media (prefers-color-scheme: dark) {
          .multi-offers-body {
            background: #262626;
            color: #f5f5f5;
          }
        }
        
        .offer-mini-card {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
          background: var(--color-surface, #ffffff);
          transition: all 0.2s;
          cursor: pointer;
        }
        
        @media (prefers-color-scheme: dark) {
          .offer-mini-card {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        .offer-mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary, #3b82f6);
        }
        
        .offer-mini-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .offer-mini-badge {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .offer-mini-badge-buy {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .offer-mini-badge-sell {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .offer-mini-amount {
          font-size: 18px;
          font-weight: 700;
        }
        
        .offer-mini-details {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
        }
        
        .location-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-secondary, rgba(0, 0, 0, 0.05));
          border-radius: 8px;
          margin-bottom: 14px;
          font-size: 13px;
          font-weight: 500;
        }
        
        @media (prefers-color-scheme: dark) {
          .location-header {
            background: rgba(255, 255, 255, 0.08);
          }
        }
      </style>
      
      <div class="multi-offers-header">
        <div class="multi-offers-title">${offers.length} Offers Available</div>
        <div class="multi-offers-stats">
          ${buyOffers.length > 0 ? `<span>🟢 ${buyOffers.length} Buying</span>` : ''}
          ${sellOffers.length > 0 ? `<span>🔵 ${sellOffers.length} Selling</span>` : ''}
        </div>
      </div>

      <div class="multi-offers-body">
        <div class="location-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            ircle cx="12" cy="10" r="="3"/>
          </svg>
          <span>${offers[0].location}</span>
        </div>
        
        ${offers.map(offer => `
          <div class="offer-mini-card" onclick="window.viewOffer('${offer.id}')">
            <div class="offer-mini-header">
              <span class="offer-mini-badge ${offer.type === 'buy' ? 'offer-mini-badge-buy' : 'offer-mini-badge-sell'}">
                ${offer.type === 'buy' ? 'Buying' : 'Selling'}
              </span>
              ${offer.exchangeRate ? `<span style="font-size: 11px; opacity: 0.7;">Rate: ${offer.exchangeRate}</span>` : ''}
            </div>
            <div class="offer-mini-amount">$${formatCurrency(offer.amount)} USDC</div>
            <div class="offer-mini-details">
              Limits: $${offer.minLimit} - $${offer.maxLimit}
              ${offer.paymentMethods?.length > 0 ? ` • ${offer.paymentMethods.slice(0, 2).join(', ')}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

interface OfferMapProps {
  offers?: any[];
  height?: string;
  onOfferClick?: (offerId: string) => void;
}

export function OfferMap({ offers = [], height = "500px", onOfferClick }: OfferMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers with clustering
  useEffect(() => {
    if (!mapInstanceRef.current || offers.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);
    const groupedOffers = groupOffersByLocation(offers);
    
    groupedOffers.forEach((offersAtLocation) => {
      const coords = offersAtLocation[0].coords;
      const primaryType = offersAtLocation[0].type;
      const count = offersAtLocation.length;
      
      const marker = L.marker(coords, { 
        icon: createCustomIcon(primaryType, count) 
      });
      
      const popupContent = generatePopupContent(offersAtLocation);
      
      marker.bindPopup(popupContent, {
        maxWidth: count > 1 ? 400 : 370,
        className: "offer-popup",
        autoPan: true,
        autoPanPadding: [50, 50],
      });

      // Open popup on hover
      marker.on('mouseover', function() {
        this.openPopup();
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
      bounds.extend(coords);
    });

    if (offers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [offers]);

  // Global callback for view button
  useEffect(() => {
    (window as any).viewOffer = (offerId: string) => {
      if (onOfferClick) onOfferClick(offerId);
    };
    return () => delete (window as any).viewOffer;
  }, [onOfferClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border"
    />
  );
}
