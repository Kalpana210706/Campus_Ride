import React from 'react';

// Campus hotspots ke static coordinates (SVG Grid: 400x300)
const locationCoords = {
    "Main Gate": { x: 50, y: 250, color: '#ef4444' },
    "Boys Hostel Block A": { x: 50, y: 80, color: '#f59e0b' },
    "Girls Hostel Block B": { x: 160, y: 50, color: '#ec4899' },
    "Academic Block 1": { x: 200, y: 160, color: '#3b82f6' },
    "Central Library": { x: 350, y: 100, color: '#10b981' },
    "Campus Cafeteria": { x: 320, y: 230, color: '#8b5cf6' },
    "Sports Complex": { x: 180, y: 260, color: '#6366f1' }
};

// Map routes connectivity mapping (Kaunsa point kisse connected hai)
const campusConnections = [
    ["Main Gate", "Academic Block 1"],
    ["Main Gate", "Boys Hostel Block A"],
    ["Boys Hostel Block A", "Girls Hostel Block B"],
    ["Girls Hostel Block B", "Academic Block 1"],
    ["Academic Block 1", "Central Library"],
    ["Academic Block 1", "Campus Cafeteria"],
    ["Campus Cafeteria", "Sports Complex"],
    ["Main Gate", "Sports Complex"],
    ["Central Library", "Campus Cafeteria"]
];

export default function CampusMap({ pickup, drop, rideStatus }) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#4b5563', display: 'flex', gap: '15px' }}>
                {pickup && <span>🟢 Pickup: <span style={{ color: '#10b981' }}>{pickup}</span></span>}
                {drop && <span>🔴 Drop: <span style={{ color: '#ef4444' }}>{drop}</span></span>}
            </div>

            <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px solid #e2e8f0', padding: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    {/* 1. Drawing Campus Roads/Connections */}
                    {campusConnections.map((conn, idx) => {
                        const start = locationCoords[conn[0]];
                        const end = locationCoords[conn[1]];
                        
                        // Highlight line if it's part of passenger's selected trip
                        const isSelectedPath = (pickup === conn[0] && drop === conn[1]) || (pickup === conn[1] && drop === conn[0]);

                        return (
                            <line 
                                key={idx}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke={isSelectedPath ? '#2563eb' : '#cbd5e1'}
                                strokeWidth={isSelectedPath ? '4' : '2'}
                                strokeDasharray={isSelectedPath ? '5,5' : 'none'}
                                style={{ transition: 'all 0.5s ease' }}
                            />
                        );
                    })}

                    {/* 2. Real-time Animated Driver Marker (Simulation Mode) */}
                    {rideStatus === 'accepted' && pickup && locationCoords[pickup] && (
                        <g>
                            {/* Outer Pulsing Wave */}
                            <circle 
                                cx={locationCoords[pickup].x} 
                                cy={locationCoords[pickup].y - 25} 
                                r="12" 
                                fill="#10b981" 
                                opacity="0.4"
                            >
                                <animate attributeName="r" values="8;18;8" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            {/* Driver Car/Rickshaw Icon */}
                            <text 
                                x={locationCoords[pickup].x - 10} 
                                y={locationCoords[pickup].y - 18} 
                                style={{ fontSize: '20px', zIndex: 10, cursor: 'pointer' }}
                            >
                                🛺
                            </text>
                        </g>
                    )}

                    {/* 3. Drawing Hotspot Nodes */}
                    {Object.keys(locationCoords).map((name) => {
                        const node = locationCoords[name];
                        const isPickup = name === pickup;
                        const isDrop = name === drop;

                        let nodeRadius = 6;
                        let nodeColor = node.color;

                        if (isPickup) { nodeRadius = 10; nodeColor = '#10b981'; }
                        if (isDrop) { nodeRadius = 10; nodeColor = '#ef4444'; }

                        return (
                            <g key={name}>
                                {/* Node Circle */}
                                <circle 
                                    cx={node.x} 
                                    cy={node.y} 
                                    r={nodeRadius} 
                                    fill={nodeColor}
                                    stroke="white"
                                    strokeWidth="2"
                                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                />
                                {/* Label Text */}
                                <text 
                                    x={node.x} 
                                    y={node.y - 12} 
                                    textAnchor="middle" 
                                    style={{ 
                                        fontSize: (isPickup || isDrop) ? '11px' : '9px', 
                                        fontFamily: 'sans-serif', 
                                        fontWeight: (isPickup || isDrop) ? 'bold' : '500',
                                        fill: (isPickup || isDrop) ? '#1e293b' : '#64748b'
                                    }}
                                >
                                    {isPickup ? `🟢 ${name}` : isDrop ? `🔴 ${name}` : name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}