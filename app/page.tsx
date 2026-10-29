"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './globals.css';

// ==============================================================
// SINTETIZADOR DE AUDIO HALLOWEEN (Web Audio API - Sin dependencias externas)
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
      osc.frequency.setValueAtTime(340 * pitchRatio, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignorar restricciones de audio
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
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.22);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Ignorar restricciones de audio
    }
  }

  playWin(isJackpot = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = isJackpot
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // Fanfarria triunfal mayor
        : [392.00, 466.16, 587.33, 698.46, 783.99];          // Arpegio místico espeluznante
      const duration = isJackpot ? 0.12 : 0.14;
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isJackpot ? 'sine' : 'triangle';
        const start = now + i * duration;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + (isJackpot ? 0.45 : 0.35));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.48);
      });
    } catch {
      // Ignorar restricciones de audio
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
    '3 candies',                                                       // 1 seccion
    '3 coins'                                                         // 1 seccion jackpot
  ], []);

  const [rotacion, setRotacion] = useState<number>(0);
  const [girando, setGirando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [premios, setPremios] = useState<string[]>(configuracionPremios);
  const [sonidoActivado, setSonidoActivado] = useState<boolean>(true);
  const [punteroSettle, setPunteroSettle] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<SpookySoundController>(new SpookySoundController());
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flapperRef = useRef<HTMLDivElement | null>(null);

  // Inicializar ruleta y barajar aleatoriamente al cargar
  useEffect(() => {
    setPremios([...configuracionPremios].sort(() => Math.random() - 0.5));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      tickTimersRef.current.forEach(clearTimeout);
    };
  }, [configuracionPremios]);

  // Actualizar estado de sonido en el controlador
  useEffect(() => {
    audioRef.current.enabled = sonidoActivado;
  }, [sonidoActivado]);

  // Disparar confeti y partículas ultra-fluidas (GPU friendly, Retina support)
  const dispararParticulas = useCallback((esJackpot: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const emojis = esJackpot
      ? ['🪙', '💰', '👑', '✨', '🎃', '⭐', '💎']
      : ['🍬', '🍭', '🍫', '🎃', '🦇', '👻', '✨'];

    const colores = esJackpot
      ? ['#fbbf24', '#f59e0b', '#fef08a', '#ea580c', '#ffffff']
      : ['#ea580c', '#fb923c', '#a3e635', '#bef264', '#dc2626', '#c084fc'];

    const originX = width / 2;
    const originY = height * 0.44;
    const cantidad = esJackpot ? 85 : 60;

    interface Particula {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotacion: number;
      vRot: number;
      emoji?: string;
      color?: string;
      tamano: number;
      alpha: number;
      gravedad: number;
    }

    const particulas: Particula[] = [];

    for (let i = 0; i < cantidad; i++) {
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 4 + Math.random() * 14;
      const esEmoji = Math.random() < 0.65;
      particulas.push({
        x: originX,
        y: originY,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad - 5 - Math.random() * 6,
        rotacion: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        emoji: esEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        color: !esEmoji ? colores[Math.floor(Math.random() * colores.length)] : undefined,
        tamano: esEmoji ? (16 + Math.random() * 16) : (6 + Math.random() * 7),
        alpha: 1,
        gravedad: 0.26 + Math.random() * 0.14,
      });
    }

    let frameId: number;
    const animar = () => {
      ctx.clearRect(0, 0, width, height);
      let vivas = 0;

      for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravedad;
        p.vx *= 0.985;
        p.rotacion += p.vRot;
        p.alpha -= 0.008;

        if (p.alpha > 0 && p.y < height + 40) {
          vivas++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotacion * Math.PI) / 180);

          if (p.emoji) {
            ctx.font = `${p.tamano}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, 0, 0);
          } else if (p.color) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.tamano / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (vivas > 0) {
        frameId = requestAnimationFrame(animar);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frameId = requestAnimationFrame(animar);
  }, []);

  // Función principal de giro con cálculo angular y sincronización exacta de ticks
  const girar = useCallback(() => {
    if (girando || premios.length === 0) return;

    setGirando(true);
    setPunteroSettle(false);
    setResultado(null);

    // Sonido inicial y vibración
    audioRef.current.playWhoosh();
    if ('vibrate' in navigator) {
      navigator.vibrate?.([30, 20, 30]);
    }

    const gradosPorSeccion = 360 / 12; // 12 secciones de 30°
    const vueltasExtra = (Math.floor(Math.random() * 4) + 6) * 360; // 6 a 9 vueltas
    const indiceGanador = Math.floor(Math.random() * 12);

    // Alinear centro de la sección ganadora con el puntero en 0°
    const anguloObjetivo = 360 - (indiceGanador * gradosPorSeccion + gradosPorSeccion / 2);
    const rotacionBase = Math.ceil(rotacion / 360) * 360;
    const nuevaRotacion = rotacionBase + vueltasExtra + anguloObjetivo;
    const deltaRotacion = nuevaRotacion - rotacion;
    setRotacion(nuevaRotacion);

    // Limpiar temporizadores previos de sonido y ticks
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];

    // Duración total de desaceleración física
    const duracionTotal = 4500;
    const totalPernos = Math.floor(deltaRotacion / 30);

    // Programar los ticks mecánicos exactos donde cada perno pasa el puntero
    // Usamos la curva analítica idéntica a cubic-bezier(0.16, 0.9, 0.22, 1)
    let ultimoTiempoTick = -50;
    for (let k = 1; k <= totalPernos; k++) {
      const proporcionPernos = k / totalPernos;
      // Curva de desaceleración: u(p)
      const u = 1 - Math.pow(1 - proporcionPernos, 1 / 3.2);
      const t = Math.round(u * duracionTotal);

      // Throttling inicial para alta velocidad sin saturar el audio
      if (t - ultimoTiempoTick < 32 && t < 1500) {
        continue;
      }
      ultimoTiempoTick = t;

      const progreso = t / duracionTotal;
      const tid = setTimeout(() => {
        // El tono baja a medida que desacelera la ruleta
        const pitch = 1.15 - progreso * 0.45;
        audioRef.current.playTick(pitch);

        if ('vibrate' in navigator && Math.random() > 0.6) {
          navigator.vibrate?.(6);
        }

        // Deflexión mecánica real del puntero al chocar contra cada perno (sin re-renders de React)
        if (flapperRef.current) {
          const deflexion = progreso > 0.75 ? -20 : -14;
          const resetDelay = progreso > 0.75 ? 70 : 28;
          flapperRef.current.style.transform = `translateX(-50%) rotate(${deflexion}deg)`;
          setTimeout(() => {
            if (flapperRef.current) {
              flapperRef.current.style.transform = 'translateX(-50%) rotate(0deg)';
            }
          }, resetDelay);
        }
      }, t);

      tickTimersRef.current.push(tid);
    }

    // Al finalizar el giro
    timeoutRef.current = setTimeout(() => {
      setGirando(false);
      setPunteroSettle(true);
      const premioObtenido = premios[indiceGanador];
      setResultado(premioObtenido);

      const esJackpot = premioObtenido.includes('coin');
      audioRef.current.playWin(esJackpot);
      dispararParticulas(esJackpot);

      if ('vibrate' in navigator) {
        navigator.vibrate?.(esJackpot ? [80, 50, 120, 50, 200] : [70, 40, 70]);
      }

      // Restablecer estado de rebote tras asentarse
      setTimeout(() => setPunteroSettle(false), 500);
    }, duracionTotal);
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
      // Manejo de permisos fullscreen
    }
  };

  // Pernos metálicos decorativos en el aro de la ruleta (12 tachuelas)
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
      {/* Canvas ultra-fluido para partículas y confeti */}
      <canvas ref={canvasRef} className="canvas-particulas" />

      {/* Capas atmosféricas de fondo (Aura, Murciélagos, Niebla) */}
      <div className="capa-atmosfera">
        <div className="aura-mistica" />
        <div className="niebla-inferior" />

        {/* Murciélagos con trayectoria animada fluida */}
        <svg className="murcielago murcielago-1" viewBox="0 0 64 32">
          <path d="M32 10 C26 2, 14 0, 0 8 C6 18, 18 20, 26 16 C28 22, 30 26, 32 26 C34 26, 36 22, 38 16 C46 20, 58 18, 64 8 C50 0, 38 2, 32 10 Z" />
        </svg>
        <svg className="murcielago murcielago-2" viewBox="0 0 64 32">
          <path d="M32 10 C26 2, 14 0, 0 8 C6 18, 18 20, 26 16 C28 22, 30 26, 32 26 C34 26, 36 22, 38 16 C46 20, 58 18, 64 8 C50 0, 38 2, 32 10 Z" />
        </svg>
        <svg className="murcielago murcielago-3" viewBox="0 0 64 32">
          <path d="M32 10 C26 2, 14 0, 0 8 C6 18, 18 20, 26 16 C28 22, 30 26, 32 26 C34 26, 36 22, 38 16 C46 20, 58 18, 64 8 C50 0, 38 2, 32 10 Z" />
        </svg>

        {/* Telarañas en esquinas superiores */}
        <svg className="telarana telarana-izq" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 C70,10 40,40 30,100 L0,100 Z M0,0 L60,0 C45,15 25,35 20,60 L0,60 Z" />
        </svg>
        <svg className="telarana telarana-der" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 C70,10 40,40 30,100 L0,100 Z M0,0 L60,0 C45,15 25,35 20,60 L0,60 Z" />
        </svg>
      </div>

      {/* Barra superior de controles responsive */}
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

        <h1 className="titulo-halloween">
          Wheel of Terror
        </h1>

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

      {/* Contenedor central de la ruleta y elementos interactivos */}
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
        aria-label="Spin the Wheel of Terror"
      >
        {/* Aro perimetral con pernos decorativos */}
        <div className="aro-pernos">
          {pernos.map((angulo) => (
            <div
              key={angulo}
              className="perno"
              style={{
                transform: `rotate(${angulo}deg) translateY(-49cqw)`
              }}
            />
          ))}
        </div>

        {/* Disco giratorio con sectores y contenido dinámico */}
        <div
          className="ruleta-giro"
          style={{ transform: `rotate(${rotacion}deg)` }}
        >
          {premios.map((premio, index) => {
            const rotacionTexto = index * 30 + 15;
            const esMoneda = premio.includes('coin');
            const icono = esMoneda ? '🪙' : '🍬';

            return (
              <div
                key={index}
                className={`seccion-texto ${esMoneda ? 'seccion-jackpot' : ''}`}
                style={{ transform: `rotate(${rotacionTexto}deg)` }}
              >
                {/* Línea divisoria */}
                <div
                  className="divisor-seccion"
                  style={{ transform: `rotate(-15deg)` }}
                />

                <div className="seccion-contenido">
                  <span className="seccion-icono">{icono}</span>
                  <span className="seccion-label">{premio}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Puntero triangular con física de golpe/rebote conectada a flapperRef */}
        <div
          ref={flapperRef}
          className={`puntero-wrapper ${punteroSettle ? 'puntero-frenado' : ''}`}
        >
          <div className="puntero" />
        </div>

        {/* Centro de la ruleta con ojo monstruoso interactivo y botón SPIN */}
        <div
          className={`centro-ruleta ${girando ? 'girando-activo' : ''}`}
          title="Spin"
        >
          <div className="ojo-monstruo">
            <div className="pupila" />
          </div>

          {!girando && (
            <div className="texto-spin-centro">
              SPIN!
            </div>
          )}
        </div>
      </div>

      {/* Área inferior con banner de premio interactivo y animado */}
      <footer className="area-inferior">
        {resultado ? (
          <div
            className={`banner-victoria ${esJackpot ? 'es-jackpot' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              girar();
            }}
            role="button"
            tabIndex={0}
            title="Spin again"
          >
            <span className="etiqueta-resultado">
              {esJackpot ? "👑 SPOOKY JACKPOT! 👑" : "🎃 HALLOWEEN REWARD! 🎃"}
            </span>

            <div className="premio-principal">
              <span className="icono-victoria-animado">
                {esJackpot ? "🪙" : "🍬"}
              </span>
              <span>YOU WON {resultado.toUpperCase()}!</span>
              <span className="icono-victoria-animado">
                {esJackpot ? "🪙" : "🎃"}
              </span>
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