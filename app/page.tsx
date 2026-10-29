"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './globals.css';
import FondoHalloween3D from './components/FondoHalloween3D';

// ==============================================================
// SINTETIZADOR DE AUDIO HALLOWEEN (Ligero, reactivo y sin lag)
// ==============================================================
class SpookySoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTick(pitchRatio = 1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(300 * pitchRatio, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  }

  playWhoosh() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.22);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignorar
    }
  }

  playWin(isJackpot = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = isJackpot
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // Triunfo Jackpot
        : [392.00, 466.16, 587.33, 783.99];         // Victoria Halloween
      const duration = 0.11;
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isJackpot ? 'sine' : 'triangle';
        const start = now + i * duration;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch {
      // Ignorar
    }
  }
}

// ==============================================================
// COMPONENTE PRINCIPAL DE LA RULETA HALLOWEEN
// ==============================================================
export default function RuletaPage() {
  const configuracionPremios = useMemo(() => [
    '1 candy', '1 candy', '1 candy', '1 candy', '1 candy', '1 candy', // 6 secciones
    '2 candies', '2 candies', '2 candies', '2 candies',               // 4 secciones
    '3 candies',                                                       // 1 sección
    '3 coins'                                                         // 1 sección jackpot
  ], []);

  const [rotacion, setRotacion] = useState<number>(0);
  const [girando, setGirando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [premios, setPremios] = useState<string[]>(configuracionPremios);
  const [sonidoActivado, setSonidoActivado] = useState<boolean>(true);
  const [punteroFrenando, setPunteroFrenando] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<SpookySoundController>(new SpookySoundController());
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inicializar ruleta y barajar aleatoriamente al cargar
  useEffect(() => {
    setPremios([...configuracionPremios].sort(() => Math.random() - 0.5));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      tickTimersRef.current.forEach(clearTimeout);
    };
  }, [configuracionPremios]);

  // Actualizar estado de sonido
  useEffect(() => {
    audioRef.current.enabled = sonidoActivado;
  }, [sonidoActivado]);

  // Partículas y confeti de victoria (Optimizado, sin caídas de FPS)
  const dispararParticulas = useCallback((esJackpot: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const emojis = esJackpot
      ? ['🪙', '💰', '👑', '✨', '🎃', '⭐']
      : ['🍬', '🍭', '🎃', '🦇', '👻', '✨'];

    const colores = esJackpot
      ? ['#fbbf24', '#f59e0b', '#fef08a', '#ea580c', '#ffffff']
      : ['#ea580c', '#fb923c', '#a3e635', '#bef264', '#dc2626'];

    const originX = width / 2;
    const originY = height * 0.44;
    const cantidad = esJackpot ? 45 : 35;

    const particulas = Array.from({ length: cantidad }, () => {
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 4 + Math.random() * 10;
      const esEmoji = Math.random() < 0.6;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad - 5,
        emoji: esEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        color: !esEmoji ? colores[Math.floor(Math.random() * colores.length)] : undefined,
        alpha: 1,
        tamano: esEmoji ? 22 : 6,
      };
    });

    let frameId: number;
    let frames = 0;
    const animar = () => {
      frames++;
      ctx.clearRect(0, 0, width, height);

      let vivas = 0;
      for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.alpha -= 0.011;

        if (p.alpha > 0) {
          vivas++;
          ctx.globalAlpha = Math.max(0, p.alpha);
          if (p.emoji) {
            ctx.font = `${p.tamano}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(p.emoji, p.x, p.y);
          } else if (p.color) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.tamano / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (vivas > 0 && frames < 120) {
        frameId = requestAnimationFrame(animar);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frameId = requestAnimationFrame(animar);
  }, []);

  // Función principal de giro (Física simplificada y fluida, cero saturación)
  const girar = useCallback(() => {
    if (girando || premios.length === 0) return;

    setGirando(true);
    setPunteroFrenando(false);
    setResultado(null);

    // Sonido inicial
    audioRef.current.playWhoosh();
    if ('vibrate' in navigator) {
      navigator.vibrate?.([30, 20]);
    }

    const gradosPorSeccion = 360 / 12; // 30°
    const vueltasExtra = (Math.floor(Math.random() * 3) + 5) * 360; // 5 a 7 vueltas completas
    const indiceGanador = Math.floor(Math.random() * 12);

    // Alinear centro de la sección con el puntero superior en 0°
    const anguloObjetivo = 360 - (indiceGanador * gradosPorSeccion + 15);
    const rotacionBase = Math.ceil(rotacion / 360) * 360;
    const nuevaRotacion = rotacionBase + vueltasExtra + anguloObjetivo;
    setRotacion(nuevaRotacion);

    // Limpiar temporizadores previos
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];

    // Ticks de sonido limpios y bien espaciados durante la fase final de desaceleración
    const duracionGiro = 4200; // 4.2 segundos
    const tiemposTicks = [1600, 2150, 2600, 2980, 3300, 3560, 3780, 3960, 4100];
    tiemposTicks.forEach((t, i) => {
      const tid = setTimeout(() => {
        const pitch = 1.1 - (i / tiemposTicks.length) * 0.35;
        audioRef.current.playTick(pitch);
      }, t);
      tickTimersRef.current.push(tid);
    });

    // Finalización del giro
    timeoutRef.current = setTimeout(() => {
      setGirando(false);
      setPunteroFrenando(true);
      const premioObtenido = premios[indiceGanador];
      setResultado(premioObtenido);

      const esJackpot = premioObtenido.includes('coin');
      audioRef.current.playWin(esJackpot);
      dispararParticulas(esJackpot);

      if ('vibrate' in navigator) {
        navigator.vibrate?.(esJackpot ? [70, 40, 100] : [50, 30]);
      }

      setTimeout(() => setPunteroFrenando(false), 450);
    }, duracionGiro);
  }, [girando, rotacion, premios, dispararParticulas]);

  // Atajos de teclado (Espacio/Enter = girar, M = sonido, F = pantalla completa)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        girar();
      } else if (e.code === 'KeyM') {
        setSonidoActivado((prev) => !prev);
      } else if (e.code === 'KeyF') {
        activarPantallaCompleta();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [girar]);

  const activarPantallaCompleta = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignorar si el navegador bloquea fullscreen
    }
  };

  const pernos = useMemo(() => [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], []);
  const esJackpot = resultado ? resultado.includes('coin') : false;

  return (
    <main
      className="pantalla-completa"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.btn-control')) return;
        girar();
      }}
    >
      {/* Fondo 3D interactivo con Three.js */}
      <FondoHalloween3D activo={true} girando={girando} esJackpot={esJackpot} />

      {/* Canvas para confeti de Halloween */}
      <canvas ref={canvasRef} className="canvas-particulas" />

      {/* Capa atmosférica de fondo con estilo original de Halloween */}
      <div className="capa-atmosfera">
        <div className="aura-mistica" />
        <div className="niebla-inferior" />

        {/* Telarañas en esquinas */}
        <svg className="telarana telarana-izq" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 C70,10 40,40 30,100 L0,100 Z M0,0 L60,0 C45,15 25,35 20,60 L0,60 Z" />
        </svg>
        <svg className="telarana telarana-der" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 C70,10 40,40 30,100 L0,100 Z M0,0 L60,0 C45,15 25,35 20,60 L0,60 Z" />
        </svg>
      </div>

      {/* Barra superior de controles responsive (Título 100% centrado con Grid) */}
      <header className="barra-superior">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSonidoActivado(!sonidoActivado);
          }}
          className="btn-control"
          title={sonidoActivado ? "Mute sound (M)" : "Enable sound (M)"}
          type="button"
          aria-label={sonidoActivado ? "Mute audio" : "Enable audio"}
        >
          <span className="icono-btn">{sonidoActivado ? "🔊" : "🔇"}</span>
          <span className="texto-btn">{sonidoActivado ? "Sound On" : "Muted"}</span>
        </button>

        <h1 className="titulo-halloween">Wheel of Terror</h1>

        <button
          onClick={(e) => {
            e.stopPropagation();
            activarPantallaCompleta();
          }}
          className="btn-control"
          title="Toggle Full Screen (F)"
          type="button"
          aria-label="Toggle Full Screen"
        >
          <span className="icono-btn">⛶</span>
          <span className="texto-btn">Full Screen</span>
        </button>
      </header>

      {/* Contenedor central de la ruleta (Grande, adaptable a TVs de 32" a 85" y móviles) */}
      <div
        className="ruleta-contenedor"
        onClick={(e) => {
          e.stopPropagation();
          girar();
        }}
        role="button"
        aria-label="Spin the Wheel of Terror"
      >
        {/* Aro con pernos metálicos decorativos */}
        <div className="aro-pernos">
          {pernos.map((angulo) => (
            <div
              key={angulo}
              className="perno"
              style={{
                transform: `rotate(${angulo}deg) translateY(-48.8%)`
              }}
            />
          ))}
        </div>

        {/* Disco giratorio con sectores y contenido */}
        <div
          className="ruleta-giro"
          style={{ transform: `rotate(${rotacion}deg)` }}
        >
          {premios.map((premio, index) => {
            const rotacionTexto = index * 30 + 15;
            const esMoneda = premio.includes('coin');
            const icono = esMoneda ? '🪙' : '🍬';
            const partes = premio.split(' ');
            const cantidad = partes[0];
            const nombre = partes.slice(1).join(' ');

            return (
              <div
                key={index}
                className={`seccion-texto ${esMoneda ? 'seccion-jackpot' : ''}`}
                style={{ transform: `rotate(${rotacionTexto}deg)` }}
              >
                {/* Línea divisoria dorada */}
                <div className="divisor-seccion" />

                <div className="seccion-contenido">
                  <span className="seccion-icono">{icono}</span>
                  <span className="seccion-cantidad">{cantidad}</span>
                  <span className="seccion-nombre">{nombre}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Puntero triangular sangriento con física fluida en GPU */}
        <div
          className={`puntero-wrapper ${
            girando ? 'puntero-girando' : punteroFrenando ? 'puntero-frenado' : ''
          }`}
        >
          <div className="puntero" />
        </div>

        {/* Centro de la ruleta con ojo de monstruo y botón SPIN */}
        <div className="centro-ruleta" title="Spin">
          <div className="ojo-monstruo">
            <div className={`pupila ${girando ? 'pupila-girando' : ''}`} />
          </div>

          {!girando && <div className="texto-spin-centro">SPIN!</div>}
        </div>
      </div>

      {/* Área inferior con banner de premio y guía */}
      <footer className="area-inferior">
        {resultado ? (
          <div
            className={`banner-victoria ${esJackpot ? 'es-jackpot' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              girar();
            }}
            role="button"
            title="Spin again"
          >
            <span className="etiqueta-resultado">
              {esJackpot ? "👑 SPOOKY JACKPOT! 👑" : "🎃 HALLOWEEN REWARD! 🎃"}
            </span>

            <div className="premio-principal">
              <span className="icono-victoria-animado">{esJackpot ? "🪙" : "🍬"}</span>
              <span>YOU WON {resultado.toUpperCase()}!</span>
              <span className="icono-victoria-animado">{esJackpot ? "🪙" : "🎃"}</span>
            </div>

            <div className="indicador-jugar-nuevo">
              <span>↻</span> SPIN AGAIN
            </div>
          </div>
        ) : (
          <div className="texto-guia-inicio">
            👻 TAP TO SPIN 👻
          </div>
        )}
      </footer>
    </main>
  );
}