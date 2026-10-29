"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './globals.css';

export default function RuletaPage() {
  const configuracionPremios = useMemo(() => [
    '1 dulce', '1 dulce', '1 dulce', '1 dulce', '1 dulce', '1 dulce', // 6 secciones
    '2 dulces', '2 dulces', '2 dulces', '2 dulces',                   // 4 secciones
    '3 dulces', '3 dulces'                                            // 2 secciones
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

    const gradosPorSeccion = 360 / 12; // 12 secciones del mismo tamaño (30° cada una)
    const vueltasExtra = (Math.floor(Math.random() * 5) + 5) * 360;
    const indiceGanador = Math.floor(Math.random() * 12);

    // Alinear el centro de la sección ganadora (+15°) con el puntero superior (0°)
    // descontando el residuo de la rotación previa para no desfasar giros sucesivos
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

  const activarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  return (
    <main className="pantalla-completa">
      <button
        onClick={activarPantallaCompleta}
        className="btn-pantalla"
        title="Pantalla Completa"
      >
        ⛶ Pantalla Completa
      </button>

      <h1 className="titulo-halloween">
        Ruleta del Terror
      </h1>

      <div
        className="ruleta-contenedor"
        onClick={girar}
        title="Haz clic para girar"
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
        {girando ? (
          <div className="mensaje-girando">
            🕷️ Girando la ruleta del terror... 🕷️
          </div>
        ) : resultado ? (
          <div className="animacion-ectoplasma" onClick={girar} style={{ cursor: 'pointer' }}>
            ¡Ganaste {resultado}!
          </div>
        ) : (
          <button onClick={girar} className="mensaje-jugar">
            🎃 Haz clic o presiona ESPACIO para girar 🎃
          </button>
        )}
      </div>
    </main>
  );
}
