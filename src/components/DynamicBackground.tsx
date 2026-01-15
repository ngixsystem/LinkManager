import { ReactNode, useEffect, useState } from 'react';
import { AppSettings } from '@/hooks/useSettings';

interface DynamicBackgroundProps {
  settings: AppSettings;
  children: ReactNode;
}

export function DynamicBackground({ settings, children }: DynamicBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    if (settings.backgroundType === 'gradient') {
      return {
        background: settings.backgroundGradient,
      };
    }

    return {
      backgroundColor: settings.backgroundColor,
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Dynamic gradient overlay that follows mouse */}
      {settings.backgroundType !== 'image' && (
        <div
          className="fixed inset-0 pointer-events-none opacity-30 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--primary) / 0.15) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Floating orbs for dynamic effect */}
      {settings.backgroundType !== 'image' && (
        <>
          <div
            className="fixed w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl transition-transform duration-[3000ms] ease-out"
            style={{
              background: 'hsl(var(--primary) / 0.3)',
              top: `${mousePosition.y - 20}%`,
              left: `${mousePosition.x - 20}%`,
              transform: `translate(-50%, -50%)`,
            }}
          />
          <div
            className="fixed w-72 h-72 rounded-full pointer-events-none opacity-15 blur-3xl transition-transform duration-[4000ms] ease-out"
            style={{
              background: 'hsl(270 70% 60% / 0.3)',
              top: `${100 - mousePosition.y}%`,
              right: `${100 - mousePosition.x}%`,
              transform: `translate(50%, 50%)`,
            }}
          />
        </>
      )}

      {/* Image overlay for better readability */}
      {settings.backgroundType === 'image' && settings.backgroundImage && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
