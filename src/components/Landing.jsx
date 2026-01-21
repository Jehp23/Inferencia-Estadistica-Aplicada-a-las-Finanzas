import React from 'react';
import { ArrowRight, TrendingUp, BarChart3, GraduationCap } from 'lucide-react';

export default function Landing({ onEnter }) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-mesh text-slate-800">

            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-6xl mx-auto px-6 h-screen flex flex-col items-center justify-center relative z-10">

                <div className="w-full max-w-4xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm transition-transform hover:scale-105">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold tracking-wide text-primary uppercase">Herramienta Académica</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
                        Inferencia Estadística <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Aplicada a las Finanzas
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Descubre si el rendimiento de un activo es puro azar o evidencia de una tendencia real.
                        <span className="block mt-2 font-medium text-slate-700">Intervalos de Confianza & Test de Hipótesis.</span>
                    </p>

                    {/* Action Area */}
                    <div className="flex flex-col items-center gap-6 pt-8">
                        <button
                            onClick={onEnter}
                            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 opacity-100 transition-opacity group-hover:opacity-90"></span>
                            <span className="relative flex items-center gap-3">
                                Ingresar al Laboratorio
                                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>

                        <p className="text-sm text-yellow-600/80 font-medium bg-yellow-50/50 px-4 py-2 rounded-lg border border-yellow-200/50">
                            Simulador académico.
                        </p>
                    </div>

                </div>

                {/* Floating Features */}
                <div className="hidden md:flex absolute bottom-12 w-full justify-between max-w-5xl px-8 text-sm font-medium text-slate-400">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Simulación de Montecarlo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Distribución T-Student</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
