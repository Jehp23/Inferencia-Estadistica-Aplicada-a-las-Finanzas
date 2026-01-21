import React, { useState } from 'react';
import Landing from './components/Landing';
import Laboratory from './components/Laboratory';

function App() {
    const [view, setView] = useState('landing'); // 'landing' | 'lab'

    return (
        <div className="app-root font-sans text-slate-800 bg-white min-h-screen">
            {view === 'landing' ? (
                <Landing onEnter={() => setView('lab')} />
            ) : (
                <Laboratory />
            )}
        </div>
    );
}

export default App;
