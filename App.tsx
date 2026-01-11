import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  MapPin, 
  Activity, 
  Globe, 
  Power, 
  Download, 
  Lock, 
  Smartphone,
  ChevronDown,
  Wifi,
  Loader2,
  Terminal,
  Cpu,
  CheckCircle2,
  X
} from 'lucide-react';
import { US_SERVERS, MOCK_IP_POOL } from './constants';
import { ServerLocation, ConnectionStatus, TrafficData, SecurityReport } from './types';
import { ConnectionShield } from './components/ConnectionShield';
import { TrafficChart } from './components/TrafficChart';
import { getSecurityInsights } from './services/geminiService';

const App = () => {
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(US_SERVERS[0]);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [connectionTime, setConnectionTime] = useState<number>(0);
  const [currentIP, setCurrentIP] = useState<string>('---.---.---.---');
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Build/Download States
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBuildTerminal, setShowBuildTerminal] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);

  const timerRef = useRef<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Traffic Data
  useEffect(() => {
    const initialData = Array(20).fill(0).map((_, i) => ({
      time: i.toString(),
      download: 0,
      upload: 0
    }));
    setTrafficData(initialData);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED) {
      timerRef.current = window.setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setConnectionTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Traffic Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const newData = [...prev.slice(1)];
        if (status === ConnectionStatus.CONNECTED) {
          newData.push({
            time: new Date().getSeconds().toString(),
            download: Math.floor(Math.random() * 50) + 100, // 100-150 Mbps
            upload: Math.floor(Math.random() * 30) + 20, // 20-50 Mbps
          });
        } else {
          newData.push({
            time: new Date().getSeconds().toString(),
            download: 0,
            upload: 0
          });
        }
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [buildLogs]);

  const handleConnect = useCallback(async () => {
    if (status === ConnectionStatus.CONNECTED) {
      setStatus(ConnectionStatus.DISCONNECTING);
      setTimeout(() => {
        setStatus(ConnectionStatus.DISCONNECTED);
        setCurrentIP('---.---.---.---');
        setSecurityReport(null);
      }, 1500);
    } else {
      setStatus(ConnectionStatus.CONNECTING);
      setSecurityReport({
        status: 'analyzing',
        summary: 'Initiating secure handshake...',
        encryption: 'negotiating',
        masking: 'pending'
      });

      // Simulate connection delay
      setTimeout(async () => {
        setStatus(ConnectionStatus.CONNECTED);
        const randomIP = MOCK_IP_POOL[Math.floor(Math.random() * MOCK_IP_POOL.length)];
        setCurrentIP(randomIP);
        
        // Fetch Gemini Insights
        const report = await getSecurityInsights(selectedServer.city, selectedServer.state);
        setSecurityReport(report);
      }, 2500);
    }
  }, [status, selectedServer]);

  const runBuildSequence = useCallback(() => {
    setShowBuildTerminal(true);
    setIsDownloading(true);
    setBuildLogs([]);
    setBuildProgress(0);

    const steps = [
      { delay: 500, log: "> Initializing build environment...", progress: 5 },
      { delay: 1000, log: "> ./gradlew assembleRelease", progress: 10 },
      { delay: 1800, log: "[INFO] Compiling React Native sources...", progress: 25 },
      { delay: 2600, log: "[INFO] Linking native modules...", progress: 40 },
      { delay: 3400, log: "[INFO] Optimizing assets (hermes enabled)...", progress: 60 },
      { delay: 4200, log: "[INFO] Generating AndroidManifest.xml...", progress: 75 },
      { delay: 5000, log: "[INFO] Signing APK with release key...", progress: 90 },
      { delay: 5800, log: "> BUILD SUCCESSFUL in 5.2s", progress: 100 },
      { delay: 6500, log: "Starting download...", progress: 100 },
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (currentStep >= steps.length) {
        // Trigger actual download
        setTimeout(() => {
          const dummyContent = "SIMULATED_APK_CONTENT_BYTES_V1.0.0_US_FREE_VPN";
          const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'vpn.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setIsDownloading(false);
          setTimeout(() => setShowBuildTerminal(false), 2000);
        }, 1000);
        return;
      }

      const step = steps[currentStep];
      setTimeout(() => {
        setBuildLogs(prev => [...prev, step.log]);
        setBuildProgress(step.progress);
        currentStep++;
        executeStep();
      }, step.delay - (currentStep > 0 ? steps[currentStep-1].delay : 0));
    };

    executeStep();
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED: return '#00ff9d'; // Neon Green
      case ConnectionStatus.CONNECTING: return '#00f3ff'; // Neon Blue
      case ConnectionStatus.DISCONNECTED: return '#64748b'; // Slate
      case ConnectionStatus.DISCONNECTING: return '#ef4444'; // Red
      default: return '#64748b';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans overflow-hidden relative">
      
      {/* Build Terminal Modal */}
      {showBuildTerminal && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-mono text-sm">
            <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Build Output: android/app/release</span>
              </div>
              <button onClick={() => setShowBuildTerminal(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-black/50 space-y-2">
              {buildLogs.map((log, i) => (
                <div key={i} className={`${log.includes('SUCCESS') ? 'text-green-400' : log.includes('error') ? 'text-red-400' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            <div className="p-4 bg-slate-800/50 border-t border-slate-700">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Progress</span>
                <span>{buildProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${buildProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation / Sidebar */}
      <aside className="w-full md:w-20 bg-slate-900 border-r border-slate-800 flex md:flex-col items-center justify-between p-4 z-20">
        <div className="p-2 bg-brand-900 rounded-lg">
          <Shield className="w-6 h-6 text-brand-500" />
        </div>
        <nav className="flex md:flex-col gap-6">
          <button className="p-2 hover:bg-slate-800 rounded-lg text-brand-500 transition"><Power className="w-6 h-6" /></button>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition"><Globe className="w-6 h-6" /></button>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition"><Activity className="w-6 h-6" /></button>
        </nav>
        <div className="hidden md:block">
           {/* Spacer */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">US Freedom VPN</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-brand-500 font-mono uppercase tracking-wider">Free US Connection Active</span>
            </div>
          </div>
          <button 
            disabled={isDownloading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed group"
            onClick={runBuildSequence}
          >
            {isDownloading ? (
              <Cpu className="w-4 h-4 animate-pulse text-brand-400" />
            ) : (
              <Smartphone className="w-4 h-4 group-hover:text-brand-400 transition-colors" />
            )}
            <span>{isDownloading ? 'Building APK...' : 'Compile & Download APK'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Card */}
            <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-20"></div>
              
              <div className="mb-6 relative">
                 <ConnectionShield status={status} color={getStatusColor()} />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Centered logic handled in SVG, this is just a placeholder container */}
                 </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {status === ConnectionStatus.CONNECTED ? 'SECURED' : status === ConnectionStatus.DISCONNECTED ? 'UNPROTECTED' : status}
                </h2>
                <div className="font-mono text-3xl text-slate-400 tabular-nums">
                  {formatTime(connectionTime)}
                </div>
                <div className="text-sm text-slate-500 font-mono mt-2 flex items-center justify-center gap-2">
                   <Wifi className="w-4 h-4" />
                   {currentIP}
                </div>
              </div>

              <button
                onClick={handleConnect}
                className={`mt-8 w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg ${
                  status === ConnectionStatus.CONNECTED
                    ? 'bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300 shadow-red-900/10'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/20 hover:shadow-brand-500/20'
                }`}
              >
                {status === ConnectionStatus.CONNECTED ? 'DISCONNECT' : 'QUICK CONNECT'}
              </button>
            </div>

            {/* Server Selector */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 relative z-10">
              <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3 block">Server Location</label>
              
              <div className="relative">
                <button 
                  onClick={() => !status.includes('CONNECT') && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={status !== ConnectionStatus.DISCONNECTED}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    status !== ConnectionStatus.DISCONNECTED ? 'bg-slate-900 border-slate-800 opacity-70 cursor-not-allowed' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedServer.flag}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">{selectedServer.city}</div>
                      <div className="text-xs text-slate-400">{selectedServer.state}, {selectedServer.country}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50">
                    {US_SERVERS.map(server => (
                      <button
                        key={server.id}
                        onClick={() => {
                          setSelectedServer(server);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{server.flag}</span>
                          <span className="text-sm text-slate-200">{server.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${server.load > 80 ? 'bg-red-500' : server.load > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                           <span className="text-xs text-slate-400">{server.ping}ms</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Visualization & Insights */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Traffic Graph */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1 min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-500" />
                  Real-time Traffic
                </h3>
                <div className="flex gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 bg-[#00ff9d] rounded-sm"></span>
                    DL: {trafficData[trafficData.length-1]?.download} Mbps
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 bg-[#00f3ff] rounded-sm"></span>
                    UL: {trafficData[trafficData.length-1]?.upload} Mbps
                  </div>
                </div>
              </div>
              <TrafficChart data={trafficData} />
            </div>

            {/* AI Security Insights */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl"></div>

               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-brand-500" />
                  Security Intelligence
               </h3>

               {!securityReport ? (
                 <div className="text-center py-8 text-slate-500">
                   {status === ConnectionStatus.DISCONNECTED 
                     ? "Connect to a US server to generate a security analysis." 
                     : "Waiting for connection handshake..."}
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${securityReport.status === 'secure' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                             <Shield className="w-5 h-5" />
                           </div>
                           <div>
                             <div className="text-xs text-slate-500 uppercase font-bold">Tunnel Status</div>
                             <div className="text-white font-medium capitalize">{securityReport.status}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                             <MapPin className="w-5 h-5" />
                           </div>
                           <div>
                             <div className="text-xs text-slate-500 uppercase font-bold">Route</div>
                             <div className="text-white font-medium">Direct {'->'} {selectedServer.city}</div>
                           </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                        <div className="text-xs text-brand-500 font-mono mb-2">Analysis Summary</div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          "{securityReport.summary}"
                        </p>
                        <div className="mt-4 flex gap-2">
                           <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                             {securityReport.encryption}
                           </span>
                           <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                             Masking: {securityReport.masking}
                           </span>
                        </div>
                    </div>
                 </div>
               )}
            </div>

          </div>
        </div>
      </main>

      {/* APK Promo Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center md:hidden">
         <button 
           onClick={runBuildSequence}
           disabled={isDownloading}
           className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
         >
           {isDownloading ? (
             <Cpu className="w-5 h-5 animate-pulse" />
           ) : (
             <Download className="w-5 h-5" />
           )}
           {isDownloading ? 'Compiling...' : 'Build & Install APK'}
         </button>
      </footer>
    </div>
  );
};

export default App;