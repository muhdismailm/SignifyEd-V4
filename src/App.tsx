import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import TranslatorPage from './components/TranslatorPage';

type Page = 'home' | 'translator';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Accessibility state
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [isReduceMotion, setIsReduceMotion] = useState(false);

  // Apply accessibility classes to document body
  useEffect(() => {
    if (isHighContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');

    if (isLargeText) document.body.classList.add('large-text');
    else document.body.classList.remove('large-text');

    if (isDyslexiaFont) document.body.classList.add('dyslexia-font');
    else document.body.classList.remove('dyslexia-font');

    if (isReduceMotion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');
  }, [isHighContrast, isLargeText, isDyslexiaFont, isReduceMotion]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  if (page === 'translator') {
    return (
      <TranslatorPage
        onBack={() => setPage('home')}
        backendUrl={backendUrl}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
        isDyslexiaFont={isDyslexiaFont}
        onToggleDyslexiaFont={() => setIsDyslexiaFont(!isDyslexiaFont)}
        isReduceMotion={isReduceMotion}
        onToggleReduceMotion={() => setIsReduceMotion(!isReduceMotion)}
      />
    );
  }

  return (
    <LandingPage
      onLaunchDemo={() => setPage('translator')}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
    />
  );
}

export default App;