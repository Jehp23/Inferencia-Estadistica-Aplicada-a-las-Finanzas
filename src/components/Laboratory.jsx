import React, { useState, useEffect } from 'react';
import { jStat } from 'jstat';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Bar } from 'recharts';
import { ChevronDown, ChevronUp, AlertCircle, RefreshCw, Info, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

// --- STATISTICAL LOGIC (Same as before) ---
const calculateStats = (returns, confidenceLevel) => {
    const n = returns.length;
    const mean = returns.reduce((a, b) => a + b, 0) / n;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    const se = std / Math.sqrt(n);
    const tStat = mean / se;
    const df = n - 1;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df));
    const alpha = 1 - confidenceLevel;

    let evidence = "Sin evidencia";
    let evidenceLevel = "none";

    if (pValue < 0.01) { evidence = "Evidencia Fuerte"; evidenceLevel = "strong"; }
    else if (pValue < 0.05) { evidence = "Evidencia Moderada"; evidenceLevel = "moderate"; }
    else if (pValue < 0.10) { evidence = "Evidencia Débil"; evidenceLevel = "weak"; }

    const rejectH0 = pValue < alpha;
    const tCrit = jStat.studentt.inv(1 - alpha / 2, df);
    const margin = tCrit * se;

    return { n, mean, std, se, tStat, pValue, ciLow: mean - margin, ciHigh: mean + margin, rejectH0, evidence, evidenceLevel, alpha };
};

export default function Laboratory() {
    const [mode, setMode] = useState('real'); // 'simulation' | 'real'
    const [ticker, setTicker] = useState('AAPL');
    const [period, setPeriod] = useState('6M');
    const [confStr, setConfStr] = useState('0.95');
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [error, setError] = useState(null);

    // --- DATA PROCESSING ---
    const processData = (returns, confidence) => {
        const days = returns.length;
        const res = calculateStats(returns, confidence);
        setStats(res);

        const min = Math.min(...returns);
        const max = Math.max(...returns);
        const binCount = 30;
        const step = (max - min) / binCount;
        const bins = [];
        for (let i = 0; i < binCount; i++) {
            const binStart = min + i * step;
            const binEnd = binStart + step;
            const mid = (binStart + binEnd) / 2;
            const count = returns.filter(r => r >= binStart && r < binEnd).length;
            const density = count / (days * step);
            const normalY = jStat.normal.pdf(mid, res.mean, res.std);
            bins.push({ x: mid, freq: density, pdf: normalY });
        }
        setChartData(bins);
    };

    // --- DATA FETCHING (MASTER) ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setStats(null); // Reset stats to hide old results

        if (mode === 'simulation') {
            // SIMULATION LOGIC
            setTimeout(() => {
                const days = period === '6M' ? 126 : 252;
                const drift = (Math.random() - 0.48) * 0.002;
                const volatility = 0.015;
                const returns = [];
                for (let i = 0; i < days; i++) {
                    let u = 0, v = 0;
                    while (u === 0) u = Math.random();
                    while (v === 0) v = Math.random();
                    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                    returns.push(drift + volatility * z);
                }
                processData(returns, parseFloat(confStr));
                setLoading(false);
            }, 600);
        } else {
            // REAL DATA LOGIC
            try {
                const res = await fetch(`http://localhost:8001/api/data/${ticker}?period=${period}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Error al obtener datos");
                }
                const data = await res.json();
                processData(data.returns, parseFloat(confStr));
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => { fetchData(); }, [period, confStr, mode]); // Trigger on mode change, but NOT on ticker change

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchData();
        }
    };

    if (loading && !stats) return <div className="min-h-screen flex items-center justify-center bg-mesh"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-mesh p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">

                {/* HEADER / INPUTS */}
                <div className="bg-glass rounded-2xl p-4 flex flex-col xl:flex-row gap-6 items-center justify-between z-10 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Parámetros de Análisis</h2>
                            <p className="text-xs text-slate-500">Configura tu simulación</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 bg-slate-50/50 p-4 rounded-xl border border-white/20 items-end justify-center">

                        {/* MODE TOGGLE */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[11px] text-transparent select-none uppercase tracking-wider font-bold">Modo</span>
                            <div className="flex bg-slate-200/50 p-1 rounded-lg">
                                <button
                                    onClick={() => { setMode('simulation'); setTicker('SIMULADO'); setStats(null); }}
                                    className={cn("px-3 py-2 text-xs font-bold rounded-md transition-all", mode === 'simulation' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                >Simulación</button>
                                <button
                                    onClick={() => { setMode('real'); setTicker('AAPL'); setStats(null); }}
                                    className={cn("px-3 py-2 text-xs font-bold rounded-md transition-all", mode === 'real' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                >Datos Reales</button>
                            </div>
                        </div>

                        {mode === 'real' ? (
                            <div className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                                <label className="text-[11px] text-slate-400 tracking-wider uppercase text-center font-bold">Ticker</label>
                                <input
                                    value={ticker}
                                    onChange={e => setTicker(e.target.value.toUpperCase())}
                                    onKeyDown={handleKeyDown}
                                    className="w-24 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg py-2 px-3 text-center text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5">
                                <label className="text-[11px] text-transparent select-none tracking-wider uppercase text-center font-bold">Ticker</label>
                                <div className="w-24 h-[38px] bg-slate-100/50 rounded-lg border border-slate-200/50 flex items-center justify-center text-xs text-slate-400 italic">
                                    Simulado
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-1.5">
                            <label className="text-[11px] text-slate-400 tracking-wider uppercase text-center font-bold">Período</label>
                            <select value={period} onChange={e => setPeriod(e.target.value)} className="w-28 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg py-2 px-3 text-center text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all">
                                <option value="6M">6 Meses</option>
                                <option value="1Y">1 Año</option>
                            </select>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <label className="text-[11px] text-slate-400 tracking-wider uppercase text-center font-bold">Confianza</label>
                            <select value={confStr} onChange={e => setConfStr(e.target.value)} className="w-24 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg py-2 px-3 text-center text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all">
                                <option value="0.90">90%</option>
                                <option value="0.95">95%</option>
                                <option value="0.99">99%</option>
                            </select>
                        </div>
                        <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                        </button>
                    </div >
                </div >

                {/* ERROR MESSAGE */}
                {
                    error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in slide-in-from-top-2">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-bold">Error: {error}</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* CONCLUSION BANNER */}
                {
                    stats && (
                        <div className={cn(
                            "relative overflow-hidden rounded-3xl p-8 border text-center transition-all duration-500 transform hover:scale-[1.01] shadow-2xl",
                            stats.rejectH0
                                ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 shadow-emerald-500/10"
                                : "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/50 shadow-slate-500/10"
                        )}>
                            {/* Background Glow */}
                            <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] opacity-40 pointer-events-none", stats.rejectH0 ? "bg-emerald-400" : "bg-slate-300")} />

                            <div className="relative z-10 space-y-4">
                                <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm border border-white/50 backdrop-blur-sm",
                                    stats.rejectH0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                                    {stats.rejectH0 ? "H₁ Aceptada" : "H₀ No Rechazada"}
                                </div>

                                <h2 className={cn("text-3xl md:text-5xl font-extrabold tracking-tight", stats.rejectH0 ? "text-emerald-900" : "text-slate-700")}>
                                    {stats.rejectH0
                                        ? "Existe evidencia de rendimiento real"
                                        : "El rendimiento es atribuible al azar"}
                                </h2>

                                <div className="flex justify-center pt-2">
                                    <span className={cn(
                                        "px-5 py-2 rounded-xl text-base font-bold shadow-sm border border-white/50 backdrop-blur-md",
                                        stats.evidenceLevel === 'strong' && "bg-emerald-400/20 text-emerald-900 border-emerald-400/30",
                                        stats.evidenceLevel === 'moderate' && "bg-teal-400/20 text-teal-900 border-teal-400/30",
                                        stats.evidenceLevel === 'weak' && "bg-yellow-400/20 text-yellow-900 border-yellow-400/30",
                                        stats.evidenceLevel === 'none' && "bg-slate-200/50 text-slate-600",
                                    )}>
                                        {stats.evidence} • p-value: {stats.pValue.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* INTERPRETATION */}
                            <div className="bg-glass rounded-3xl p-6 lg:col-span-1 flex flex-col justify-center space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Info className="w-5 h-5 text-blue-500" /> Interpretación
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    Con un nivel de confianza del <span className="font-bold text-slate-900">{parseFloat(confStr) * 100}%</span>,
                                    el análisis indica que {stats.rejectH0 ? "es extremadamente improbable " : "es altamente probable "}
                                    observar estos retornos si el activo no tuviera tendencia.
                                </p>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                <div className="text-sm text-slate-500 italic">
                                    {stats.evidence === 'Evidencia Fuerte' && "Resultado estadísticamente significativo."}
                                    {stats.evidence === 'Sin evidencia' && "Los datos son indistinguibles del ruido blanco."}
                                </div>
                            </div>

                            {/* CHART */}
                            <div className="bg-glass rounded-3xl p-6 lg:col-span-2 shadow-lg border-t-4 border-blue-500/20">
                                <h4 className="text-xs font-bold text-center mb-6 text-slate-400 uppercase tracking-widest">Histograma de Retornos vs Curva Normal</h4>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="x" tickFormatter={(v) => (v * 100).toFixed(1) + '%'} style={{ fontSize: '12px', fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                                formatter={(val) => val.toFixed(2)}
                                                labelFormatter={() => ''}
                                            />
                                            <Bar dataKey="freq" fill="url(#colorFreq)" radius={[4, 4, 0, 0]} opacity={0.8} />
                                            <Line type="monotone" dataKey="pdf" stroke="#2563eb" strokeWidth={3} dot={false} strokeOpacity={0.8} />

                                            <defs>
                                                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.2} />
                                                </linearGradient>
                                            </defs>

                                            <ReferenceLine x={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'H₀', fill: '#ef4444', fontSize: 12, position: 'insideTopRight' }} />
                                            <ReferenceLine x={stats.mean} stroke="#059669" label={{ value: 'x̄', fill: '#059669', fontSize: 14, fontWeight: 'bold', position: 'insideTop' }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* DETAILS */}
                {
                    stats && (
                        <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-2xl overflow-hidden hover:bg-white/60 transition-colors">
                            <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-5 text-left">
                                <span className="font-bold text-slate-600 flex items-center gap-2"><Settings className="w-4 h-4" /> Detalles Matemáticos</span>
                                {showDetails ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            {showDetails && (
                                <div className="p-6 pt-0 border-t border-white/20 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

                                        {/* Row 1: Basic Stats */}
                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tamaño Muestral</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-slate-500">n</span>
                                                <span className="text-xl font-bold text-slate-800">{stats.n}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Media Muestral</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-slate-500">x̄ = Σx / n</span>
                                                <span className="text-xl font-bold text-slate-800">{(stats.mean * 100).toFixed(4)}%</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desvío Estándar</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-slate-500">s</span>
                                                <span className="text-xl font-bold text-slate-800">{(stats.std * 100).toFixed(4)}%</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Error Estándar</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-slate-500">SE = s / √n</span>
                                                <span className="text-xl font-bold text-slate-800">{(stats.se * 100).toFixed(4)}%</span>
                                            </div>
                                        </div>

                                        {/* Row 2: Inference */}
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Estadístico t</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-blue-500">t = x̄ / SE</span>
                                                <span className="text-xl font-bold text-blue-700">{stats.tStat.toFixed(4)}</span>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Valor-p</span>
                                            <div className="flex items-baseline justify-between">
                                                <span className="font-serif italic text-blue-500">P(|T| &gt; |t|)</span>
                                                <span className="text-xl font-bold text-blue-700">{stats.pValue < 0.0001 ? "< 0.0001" : stats.pValue.toFixed(4)}</span>
                                            </div>
                                        </div>

                                        {/* CI */}
                                        <div className="col-span-1 md:col-span-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex flex-col gap-1">
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Intervalo de Confianza ({(1 - stats.alpha) * 100}%)</span>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-serif italic text-emerald-600 hidden md:inline">IC = x̄ ± t_{'{crit}'} · SE</span>
                                                <span className="text-xl font-mono font-bold text-emerald-800 text-right w-full">
                                                    [ {(stats.ciLow * 100).toFixed(4)}% ; {(stats.ciHigh * 100).toFixed(4)}% ]
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
}
