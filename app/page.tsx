"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './globals.css';

export default function RuletaPage() {
  const configuracionPremios = useMemo(() => [
    '1 dulce', '1 dulce', '1 dulce', '1 dulce', '1 dulce', '1 dulce', // 6 secciones
    '2 dulces', '2 dulces', '2 dulces', '2 dulces',                   // 4 secciones
    '3 dulces',                                                       // 1 sección
    '3 monedas'                                                       // 1 sección
  ], []);

  const [rotacion, setRotacion] = useState<number>(0);
  const [girando, setGirando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [premios, setPremios] = useState<string[]>(configuracionPremios);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPremios([...configuracionPremios].sort(() => Math.random() - 0.5));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [configuracionPremios]);

  const girar = useCallback(() => {
    if (girando || premios.length === 0) return;

    setGirando(true);
    setResultado(null);

    const gradosPorSeccion = 360 / 12; // 12 secciones de 30° cada una
    const vueltasExtra = (Math.floor(Math.random() * 5) + 5) * 360;
    const indiceGanador = Math.floor(Math.random() * 12);

    // Alinear el centro de la sección ganadora (+15°) con el puntero superior (0°)
    const anguloObjetivo = 360 - (indiceGanador * gradosPorSeccion + gradosPorSeccion / 2);
    const rotacionBase = rotacion - (rotacion % 360);
    const nuevaRotacion = rotacionBase + vueltasExtra + anguloObjetivo;
    setRotacion(nuevaRotacion);

    timeoutRef.current = setTimeout(() => {
      setGirando(false);
      const premioObtenido = premios[indiceGanador];
      setResultado(premioObtenido);
    }, 4000);
  }, [girando, rotacion, premios]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        girar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [girar]);

  const activarPantallaCompleta = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        // Al transmitir a TV o en móvil, intentar rotar a horizontal automáticamente si está disponible
        if ('screen' in window && 'orientation' in screen && 'lock' in (screen.orientation as unknown as Record<string, unknown>)) {
          try {
            await (screen.orientation as unknown as { lock: (type: string) => Promise<void> }).lock('landscape');
          } catch {
            // No todos los navegadores permiten bloqueo de orientación por política de seguridad
          }
        }
      } else {
        await document.exitFullscreen();
        if ('screen' in window && 'orientation' in screen && 'unlock' in (screen.orientation as unknown as Record<string, unknown>)) {
          try {
            (screen.orientation as unknown as { unlock: () => void }).unlock();
          } catch {
            // Ignorar si no está bloqueado
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main
      className="pantalla-completa"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.btn-pantalla')) return;
        girar();
      }}
    >
      <button
        onClick={activarPantallaCompleta}
        className="btn-pantalla"
        title="Pantalla Completa"
        type="button"
      >
        <span>⛶</span> Pantalla Completa
      </button>

      <h1 className="titulo-halloween">
        Ruleta del Terror
      </h1>

      <div
        className="ruleta-contenedor"
        onClick={(e) => {
          e.stopPropagation();
          girar();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            girar();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Girar ruleta"
      >
        <div
          className="ruleta-giro"
          style={{ transform: `rotate(${rotacion}deg)` }}
        >
          {premios.map((premio, index) => {
            const rotacionTexto = index * 30 + 15;
            return (
              <div
                key={index}
                className="seccion-texto"
                style={{ transform: `rotate(${rotacionTexto}deg)` }}
              >
                <span>{premio}</span>
              </div>
            );
          })}
        </div>

        <div className="puntero" />
        <div className="centro-ruleta">
          <div className="ojo-rojo" />
        </div>
      </div>

      <div className="area-inferior">
        {resultado && (
          <div className="animacion-ectoplasma" onClick={girar} style={{ cursor: 'pointer' }}>
            ¡Ganaste {resultado}!
          </div>
        )}
      </div>
    </main>
  );
}
