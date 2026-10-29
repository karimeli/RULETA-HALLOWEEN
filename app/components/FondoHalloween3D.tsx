"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FondoHalloween3DProps {
  activo?: boolean;
  girando?: boolean;
  esJackpot?: boolean;
}

export default function FondoHalloween3D({
  activo = true,
  girando = false,
  esJackpot = false,
}: FondoHalloween3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ girando, esJackpot, activo });

  useEffect(() => {
    stateRef.current = { girando, esJackpot, activo };
  }, [girando, esJackpot, activo]);

  useEffect(() => {
    if (!activo) return;

    const container = containerRef.current;
    if (!container) return;

    // 1. Escena y Niebla
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07010d, 0.028);

    // 2. Cámara
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    camera.position.set(0, 0, 15);

    // 3. Renderer optimizado
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.domElement.style.outline = "none";
    renderer.domElement.style.border = "none";
    container.appendChild(renderer.domElement);

    // 4. Luces místicas (Antorchas dinámicas que iluminan los murciélagos)
    const ambientLight = new THREE.AmbientLight(0x2d0b4d, 1.2);
    scene.add(ambientLight);

    const luzNaranja = new THREE.PointLight(0xff6600, 3.5, 30);
    luzNaranja.position.set(-8, 4, 6);
    scene.add(luzNaranja);

    const luzVerde = new THREE.PointLight(0xa3e635, 3.0, 28);
    luzVerde.position.set(8, -4, 5);
    scene.add(luzVerde);

    const directionalRim = new THREE.DirectionalLight(0xfb923c, 0.9);
    directionalRim.position.set(0, 8, 4);
    scene.add(directionalRim);

    // 5. Partículas espectrales flotantes (Fuegos fatuos)
    const particleCount = 140;
    const geomParticulas = new THREE.BufferGeometry();
    const posParticulas = new Float32Array(particleCount * 3);
    const colParticulas = new Float32Array(particleCount * 3);
    const velParticulas = new Float32Array(particleCount * 3);

    const colorNaranja = new THREE.Color(0xfb923c);
    const colorVerde = new THREE.Color(0xa3e635);
    const colorOro = new THREE.Color(0xfef08a);

    for (let i = 0; i < particleCount; i++) {
      posParticulas[i * 3] = (Math.random() - 0.5) * 34;
      posParticulas[i * 3 + 1] = (Math.random() - 0.5) * 22;
      posParticulas[i * 3 + 2] = (Math.random() - 0.5) * 14;

      velParticulas[i * 3] = (Math.random() - 0.5) * 0.012;
      velParticulas[i * 3 + 1] = 0.007 + Math.random() * 0.014;
      velParticulas[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      const pick = Math.random();
      const col = pick < 0.45 ? colorNaranja : pick < 0.85 ? colorVerde : colorOro;
      colParticulas[i * 3] = col.r;
      colParticulas[i * 3 + 1] = col.g;
      colParticulas[i * 3 + 2] = col.b;
    }

    geomParticulas.setAttribute("position", new THREE.BufferAttribute(posParticulas, 3));
    geomParticulas.setAttribute("color", new THREE.BufferAttribute(colParticulas, 3));

    const canvasPunto = document.createElement("canvas");
    canvasPunto.width = 32;
    canvasPunto.height = 32;
    const ctxPunto = canvasPunto.getContext("2d");
    if (ctxPunto) {
      const grad = ctxPunto.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.35, "rgba(255, 255, 255, 0.7)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctxPunto.fillStyle = grad;
      ctxPunto.fillRect(0, 0, 32, 32);
    }
    const texturePunto = new THREE.CanvasTexture(canvasPunto);

    const matParticulas = new THREE.PointsMaterial({
      size: 0.38,
      map: texturePunto,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sistemaParticulas = new THREE.Points(geomParticulas, matParticulas);
    scene.add(sistemaParticulas);

    // 6. GENERADOR DE MURCIÉLAGOS 3D (Cuerpo, orejas, alas articuladas dentadas y ojos brillantes)
    const batMaterials: THREE.Material[] = [];
    const batGeometries: THREE.BufferGeometry[] = [];

    const bodyGeom = new THREE.ConeGeometry(0.38, 1.2, 5);
    bodyGeom.rotateX(Math.PI / 2);
    batGeometries.push(bodyGeom);

    const batMat = new THREE.MeshStandardMaterial({
      color: 0x220c38,
      roughness: 0.5,
      metalness: 0.3,
    });
    batMaterials.push(batMat);

    const earGeom = new THREE.ConeGeometry(0.12, 0.4, 4);
    batGeometries.push(earGeom);

    // Ojos rojos brillantes incandescentes
    const eyeGeom = new THREE.SphereGeometry(0.09, 6, 6);
    batGeometries.push(eyeGeom);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1a00 });
    batMaterials.push(eyeMat);

    // Forma aerodinámica y dentada de ala de murciélago
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-1.3, 0.7);
    wingShape.lineTo(-2.0, 0.3);
    wingShape.lineTo(-1.6, -0.3);
    wingShape.lineTo(-1.2, -0.15);
    wingShape.lineTo(-0.8, -0.5);
    wingShape.lineTo(0, -0.2);
    wingShape.closePath();

    const wingGeom = new THREE.ShapeGeometry(wingShape);
    batGeometries.push(wingGeom);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x361058,
      roughness: 0.4,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    batMaterials.push(wingMat);

    interface MurcielagoData {
      root: THREE.Group;
      leftWing: THREE.Group;
      rightWing: THREE.Group;
      velocidad: number;
      fase: number;
      radioX: number;
      radioY: number;
      centroX: number;
      centroY: number;
      alturaZ: number;
      flapSpeed: number;
    }

    const listaMurcielagos: MurcielagoData[] = [];
    const grupoMurcielagos = new THREE.Group();
    const totalMurcielagos = 8;

    for (let i = 0; i < totalMurcielagos; i++) {
      const batGroup = new THREE.Group();

      // Cuerpo
      const body = new THREE.Mesh(bodyGeom, batMat);
      batGroup.add(body);

      // Orejas puntiagudas
      const leftEar = new THREE.Mesh(earGeom, batMat);
      leftEar.position.set(-0.2, 0.28, 0.45);
      leftEar.rotation.z = -0.35;
      const rightEar = new THREE.Mesh(earGeom, batMat);
      rightEar.position.set(0.2, 0.28, 0.45);
      rightEar.rotation.z = 0.35;
      batGroup.add(leftEar, rightEar);

      // Ojos brillantes rojos
      const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
      leftEye.position.set(-0.15, 0.16, 0.52);
      const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
      rightEye.position.set(0.15, 0.16, 0.52);
      batGroup.add(leftEye, rightEye);

      // Ala izquierda articulada
      const leftWingPivot = new THREE.Group();
      leftWingPivot.position.set(-0.2, 0, 0);
      const leftWingMesh = new THREE.Mesh(wingGeom, wingMat);
      leftWingPivot.add(leftWingMesh);
      batGroup.add(leftWingPivot);

      // Ala derecha articulada (espejada)
      const rightWingPivot = new THREE.Group();
      rightWingPivot.position.set(0.2, 0, 0);
      const rightWingMesh = new THREE.Mesh(wingGeom, wingMat);
      rightWingMesh.scale.x = -1;
      rightWingPivot.add(rightWingMesh);
      batGroup.add(rightWingPivot);

      // Tamaños variables (algunos grandes y cercanos para máxima visibilidad)
      const esGrande = i < 3;
      const escala = esGrande ? (0.95 + Math.random() * 0.4) : (0.55 + Math.random() * 0.3);
      batGroup.scale.setScalar(escala);

      // Configuración de vuelo individual
      const centroX = (i % 2 === 0 ? -5 : 5) + (Math.random() - 0.5) * 3;
      const centroY = (Math.random() - 0.5) * 6;
      const radioX = 4 + Math.random() * 4;
      const radioY = 2.5 + Math.random() * 2.5;
      const alturaZ = esGrande ? (4 + Math.random() * 3) : (0 + Math.random() * 3); // Cerca de la cámara
      const velocidad = 0.8 + Math.random() * 0.7;
      const flapSpeed = 12 + Math.random() * 6;

      grupoMurcielagos.add(batGroup);
      listaMurcielagos.push({
        root: batGroup,
        leftWing: leftWingPivot,
        rightWing: rightWingPivot,
        velocidad,
        fase: (i * Math.PI * 2) / totalMurcielagos,
        radioX,
        radioY,
        centroX,
        centroY,
        alturaZ,
        flapSpeed,
      });
    }
    scene.add(grupoMurcielagos);

    // 7. Parallax con el mouse
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 1.8;
      targetY = -((e.clientY / window.innerHeight) - 0.5) * 1.8;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 8. Bucle de animación
    let animationFrameId: number;
    let tiempoAnterior = performance.now();
    let esPestanaVisible = true;

    const onVisibilityChange = () => {
      esPestanaVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const animar = (tiempoActual: number) => {
      animationFrameId = requestAnimationFrame(animar);
      if (!esPestanaVisible) return;

      const delta = Math.min((tiempoActual - tiempoAnterior) * 0.001, 0.1);
      tiempoAnterior = tiempoActual;
      const t = tiempoActual * 0.001;

      const { girando: estaGirando, esJackpot: ganoJackpot } = stateRef.current;

      // Movimiento suave de la cámara
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Luces parpadeantes
      luzNaranja.intensity = 3.2 + Math.sin(t * 7) * 0.8;
      luzVerde.intensity = 2.8 + Math.cos(t * 5.5) * 0.7;

      // Partículas
      const positions = geomParticulas.attributes.position.array as Float32Array;
      const factorVel = estaGirando ? 2.5 : 1.0;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += velParticulas[i3 + 1] * factorVel;
        positions[i3] += Math.sin(t * 1.2 + i) * 0.008 * factorVel;
        if (positions[i3 + 1] > 11) {
          positions[i3 + 1] = -11;
          positions[i3] = (Math.random() - 0.5) * 34;
        }
      }
      geomParticulas.attributes.position.needsUpdate = true;

      // ANIMACIÓN DETALLADA DE VUELO DE MURCIÉLAGOS 3D
      const velMultiplier = estaGirando ? 1.9 : 1.0;
      listaMurcielagos.forEach((bat, idx) => {
        const ang = t * bat.velocidad * velMultiplier + bat.fase;

        // Vuelo en trayectoria de óvalo / infinito 3D
        const x = bat.centroX + Math.cos(ang) * bat.radioX;
        const y = bat.centroY + Math.sin(ang * 2) * (bat.radioY * 0.6);
        const z = bat.alturaZ + Math.sin(ang) * 2;

        bat.root.position.set(x, y, z);

        // Orientación hacia donde vuelan (Tangente + Inclinación de giro)
        const dx = -Math.sin(ang) * bat.radioX;
        const dy = Math.cos(ang * 2) * 2 * (bat.radioY * 0.6);
        const rotY = Math.atan2(-dx, 1);
        bat.root.rotation.y = rotY;
        bat.root.rotation.z = -dx * 0.08; // Se inclinan al doblar
        bat.root.rotation.x = dy * 0.04;

        // Aleteo fluido de alas articuladas
        const flapRate = bat.flapSpeed * (estaGirando ? 1.6 : 1.0);
        const flap = Math.sin(t * flapRate + idx) * 0.65;
        bat.leftWing.rotation.z = flap;
        bat.rightWing.rotation.z = -flap;
      });

      // Efecto Jackpot
      if (ganoJackpot) {
        luzNaranja.color.setHex(0xfbbf24);
        luzNaranja.intensity = 5.0 + Math.sin(t * 14) * 2.0;
      } else {
        luzNaranja.color.setHex(0xff6600);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animar);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      geomParticulas.dispose();
      matParticulas.dispose();
      texturePunto.dispose();

      batGeometries.forEach((g) => g.dispose());
      batMaterials.forEach((m) => m.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activo]);

  if (!activo) return null;

  return (
    <div
      ref={containerRef}
      className="escena-three-fondo"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5, // Situado sobre el fondo y niebla, pero detrás de la ruleta (z-index: 20)
        pointerEvents: "none",
        overflow: "hidden",
        border: "none",
        outline: "none",
      }}
      aria-hidden="true"
    />
  );
}
