interface SeatData {
  seat: number;
  present: number;       // 0 or 1
  confidence: number;    // 0–1
}

interface SensorData {
  timestamp: string;
  seats: SeatData[];
}

interface EventLogItem {
  seat: number;
  type: "detected" | "cleared";
  confidence: number;
  time: string;
}


import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, Radio, Clock, Baby } from 'lucide-react';

// ============================================================================
// DATA MODEL & MOCK GENERATOR
// ============================================================================

const generateMockSensorData = () => {
  // Simulate realistic child-left-behind scenarios
  const scenarios = [
    // No children detected - all clear
    [0, 0, 0, 0, 0],
    // Child in rear seat (common alert scenario)
    [0, 0, 1, 0, 0],
    // Two children in rear seats
    [0, 0, 1, 0, 1],
    // Child in rear center
    [0, 0, 0, 1, 0],
    // Multiple children detected
    [0, 0, 1, 1, 1],
    // Rare: child in front passenger seat
    [0, 1, 0, 0, 0]
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  return {
    timestamp: new Date().toISOString(),
    seats: scenario.map((present, idx) => ({
      seat: idx + 1,
      present: present,
      confidence: present === 1 ? 0.70 + Math.random() * 0.29 : 0.02 + Math.random() * 0.13
    }))
  };
};

// ============================================================================
// BABY ICON COMPONENT
// ============================================================================

const BabyIcon = ({ size = 48 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Head */}
      <circle cx="12" cy="8" r="3" />
      {/* Body */}
      <path d="M12 11 L12 17" />
      {/* Arms */}
      <path d="M8 13 L12 11 L16 13" />
      {/* Legs */}
      <path d="M10 17 L8 21" />
      <path d="M14 17 L16 21" />
    </svg>
  );
};

// ============================================================================
// SEAT COMPONENT
// ============================================================================

const SeatIndicator: React.FC<{
  seat: number;
  present: number;
  confidence: number;
  label: string;
}> = ({ seat, present, confidence, label }) => {
  const isDetected = present === 1;
  const confPercent = Math.round(confidence * 100);
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Seat visualization */}
      <div className={`
        relative w-28 h-32 rounded-2xl transition-all duration-700 
        flex flex-col items-center justify-center border-4
        ${isDetected 
          ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-400 shadow-2xl shadow-red-600/60 animate-pulse' 
          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600'
        }
      `}>
        {/* Baby icon when detected */}
        {isDetected ? (
          <div className="flex flex-col items-center justify-center">
            <BabyIcon size={56} />
            <div className="mt-2 text-white font-bold text-xs">DETECTED</div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-slate-500">
            {seat}
          </div>
        )}
        
        {/* Alert indicator */}
        {isDetected && (
          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
        )}
      </div>
      
      {/* Label and confidence */}
      <div className="mt-3 text-center">
        <div className={`
          text-xs font-bold uppercase transition-colors duration-500
          ${isDetected ? 'text-red-400' : 'text-slate-500'}
        `}>
          {label}
        </div>
        <div className={`
          text-[10px] mt-1 font-mono transition-colors duration-500
          ${isDetected ? 'text-red-300' : 'text-slate-600'}
        `}>
          {confPercent}% CONF
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CABIN VIEW COMPONENT
// ============================================================================

const CabinView: React.FC<{ seats: SeatData[] }> = ({ seats }) => {
  const seatLabels = {
    1: 'DRIVER',
    2: 'PASSENGER',
    3: 'REAR LEFT',
    4: 'REAR CENTER',
    5: 'REAR RIGHT'
  };
  
  const detectedCount = seats.filter(s => s.present === 1).length;
  
  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 pt-24 border-4 border-slate-700">
      {/* Vehicle outline */}
      <div className="absolute inset-6 border-4 border-slate-600 rounded-[2rem] opacity-20"></div>
      
      {/* Windshield indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="text-slate-500 text-xs font-bold mb-1">▲</div>
        <div className="text-slate-500 text-xs font-bold">FRONT</div>
      </div>
      
      {/* Alert banner */}
      {detectedCount > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg animate-pulse">
          <AlertTriangle size={16} />
          CHILD PRESENCE ALERT
        </div>
      )}
      
      <div className="relative space-y-16 mt-8">
        {/* Front row */}
        <div className="flex justify-center gap-20">
          <SeatIndicator
            seat={seats[0].seat}
            present={seats[0].present}
            confidence={seats[0].confidence}
            label={seatLabels[1]}
          />
          <SeatIndicator
            seat={seats[1].seat}
            present={seats[1].present}
            confidence={seats[1].confidence}
            label={seatLabels[2]}
          />
        </div>
        
        {/* Center divider line */}
        <div className="relative">
          <div className="border-t-2 border-dashed border-slate-700 opacity-50"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-3 text-slate-600 text-[10px] font-mono">
            REAR SEATS
          </div>
        </div>
        
        {/* Rear row */}
        <div className="flex justify-center gap-10">
          <SeatIndicator
            seat={seats[2].seat}
            present={seats[2].present}
            confidence={seats[2].confidence}
            label={seatLabels[3]}
          />
          <SeatIndicator
            seat={seats[3].seat}
            present={seats[3].present}
            confidence={seats[3].confidence}
            label={seatLabels[4]}
          />
          <SeatIndicator
            seat={seats[4].seat}
            present={seats[4].present}
            confidence={seats[4].confidence}
            label={seatLabels[5]}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ALERT PANEL
// ============================================================================

const AlertPanel: React.FC<{
  seats: SeatData[];
  timestamp: string;
}> = ({ seats, timestamp }) => {

  const detectedSeats = seats.filter(s => s.present === 1);
  const detectedCount = detectedSeats.length;
  
  return (
    <div className="bg-slate-900 rounded-xl p-6 border-2 border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="text-red-500" size={20} />
        <h3 className="text-slate-200 text-sm font-bold uppercase">
          Detection Status
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Alert status */}
        <div className={`rounded-xl p-5 border-2 ${
          detectedCount > 0 
            ? 'bg-red-950 border-red-600' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          <div className="text-xs text-slate-400 mb-2 uppercase">System Status</div>
          <div className={`text-3xl font-bold ${
            detectedCount > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {detectedCount > 0 ? 'ALERT' : 'ALL CLEAR'}
          </div>
          <div className={`text-sm mt-2 ${
            detectedCount > 0 ? 'text-red-300' : 'text-slate-500'
          }`}>
            {detectedCount > 0 
              ? `${detectedCount} child${detectedCount > 1 ? 'ren' : ''} detected`
              : 'No occupants detected'
            }
          </div>
        </div>
        
        {/* Detected seats list */}
        {detectedCount > 0 && (
          <div className="bg-red-950 border-2 border-red-600 rounded-xl p-5">
            <div className="text-xs text-red-300 mb-3 uppercase font-bold">Affected Seats</div>
            <div className="space-y-2">
              {detectedSeats.map(seat => (
                <div 
                  key={seat.seat}
                  className="flex items-center justify-between bg-red-900/50 rounded-lg p-3 border border-red-700"
                >
                  <div className="flex items-center gap-3">
                    <Baby className="text-white" size={20} />
                    <div>
                      <div className="text-white font-bold text-sm">
                        Seat {seat.seat}
                      </div>
                      <div className="text-red-300 text-xs">
                        {Math.round(seat.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-600 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">ACTIVE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-800">
          <Clock size={12} />
          <span className="font-mono">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EVENT LOG
// ============================================================================

const EventLog: React.FC<{ events: EventLogItem[] }> = ({ events }) => {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border-2 border-slate-700">
      <h3 className="text-slate-200 text-sm font-bold uppercase mb-4">
        Detection Log
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-slate-600 text-sm text-center py-8">
            No events recorded
          </div>
        ) : (
          events.slice(-15).reverse().map((event, idx) => (
            <div 
              key={idx}
              className={`rounded-lg p-3 text-xs border ${
                event.type === 'detected' 
                  ? 'bg-red-950 border-red-800' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold uppercase ${
                  event.type === 'detected' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {event.type === 'detected' ? '⚠ DETECTED' : '✓ CLEARED'}
                </span>
                <span className="text-slate-600 font-mono text-[10px]">
                  {event.time}
                </span>
              </div>
              <div className={`${
                event.type === 'detected' ? 'text-red-300' : 'text-slate-500'
              }`}>
                Seat {event.seat} • {event.confidence}% confidence
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function ChildPresenceDetectionDashboard() {
  const [data, setData] = useState<SensorData>(generateMockSensorData());
  const [events, setEvents] = useState<EventLogItem[]>([]);
  const [prevSeats, setPrevSeats] = useState<SeatData[]>([]);
  const [isConnected] = useState(true);


  // Real-time data stream simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockSensorData();
      
      // Track changes for event log
      if (prevSeats.length > 0) {
        newData.seats.forEach((seat, idx) => {
          const prev = prevSeats[idx];
          if (prev && seat.present !== prev.present) {
            const newEvent: EventLogItem = {
            seat: seat.seat,
            type: seat.present === 1 ? "detected" : "cleared",
            confidence: Math.round(seat.confidence * 100),
            time: new Date().toLocaleTimeString(),
          };

            setEvents((prev: EventLogItem[]) => [...prev, newEvent]);
          }
        });
      }
      
      setPrevSeats([...newData.seats]);
      setData(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, [prevSeats]);

  const detectedCount = data.seats.filter(s => s.present === 1).length;
  const isAlert = detectedCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className={`border-b-4 shadow-2xl transition-all duration-500 ${
        isAlert 
          ? 'bg-gradient-to-r from-red-950 to-red-900 border-red-600' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${
                isAlert ? 'bg-red-700' : 'bg-blue-600'
              }`}>
                <Car size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold uppercase">
                  Child Presence Detection System
                </h1>
                <div className="text-sm text-slate-400">
                  In-Vehicle Occupant Monitoring • mmWave Radar
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                isConnected 
                  ? 'bg-green-900/50 text-green-400 border-2 border-green-600' 
                  : 'bg-red-900/50 text-red-400 border-2 border-red-600'
              }`}>
                <Radio size={18} className="animate-pulse" />
                <span className="text-sm uppercase">
                  {isConnected ? 'Sensor Active' : 'Disconnected'}
                </span>
              </div>
              
              <div className={`text-right px-5 py-2 rounded-xl ${
                isAlert ? 'bg-red-900 border-2 border-red-600' : 'bg-slate-800'
              }`}>
                <div className={`text-3xl font-bold ${
                  isAlert ? 'text-red-400 animate-pulse' : 'text-slate-500'
                }`}>
                  {detectedCount}
                </div>
                <div className="text-xs text-slate-400 uppercase">Detected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main cabin view - takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-2xl p-8 border-2 border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-200 uppercase">
                  Vehicle Cabin Monitor
                </h2>
                <div className="text-sm text-slate-500 font-mono uppercase">
                  5-Seat Configuration
                </div>
              </div>
              <CabinView seats={data.seats} />
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <AlertPanel seats={data.seats} timestamp={data.timestamp} />
            <EventLog events={events} />
          </div>
        </div>

        {/* Technical sensor readout */}
        <div className="mt-6 bg-slate-900 rounded-xl p-6 border-2 border-slate-800">
          <h3 className="text-slate-300 text-sm font-bold uppercase mb-4">
            Raw Sensor Readout
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {data.seats.map(seat => (
              <div 
                key={seat.seat}
                className={`p-4 rounded-lg border-2 transition-all ${
                  seat.present === 1 
                    ? 'bg-red-950 border-red-600' 
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    seat.present === 1 ? 'text-red-400' : 'text-slate-600'
                  }`}>
                    #{seat.seat}
                  </div>
                  <div className={`text-[10px] uppercase font-bold mb-2 ${
                    seat.present === 1 ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {seat.present === 1 ? 'PRESENT' : 'VACANT'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {Math.round(seat.confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System information */}
        <div className="mt-6 bg-slate-900 rounded-xl p-6 border-2 border-slate-800">
          <h3 className="text-slate-300 text-sm font-bold uppercase mb-4">
            System Configuration
          </h3>
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="text-slate-500 mb-1 uppercase text-xs">Sensor Type</div>
              <div className="text-slate-300 font-bold">mmWave Radar</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1 uppercase text-xs">Update Rate</div>
              <div className="text-slate-300 font-bold">0.5 Hz</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1 uppercase text-xs">Alert Mode</div>
              <div className={`font-bold ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
                {isAlert ? 'ACTIVE' : 'STANDBY'}
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1 uppercase text-xs">Detection Method</div>
              <div className="text-slate-300 font-bold">Presence + Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t-2 border-slate-800 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <div className="text-xs text-slate-600 font-mono">
            CHILD PRESENCE DETECTION SYSTEM • AUTOMOTIVE SAFETY MONITORING • LAST UPDATE: {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}