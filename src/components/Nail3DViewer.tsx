import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { NailShape, NailTexture } from "./NailCanvas";

interface Nail3DViewerProps {
  nailShape: NailShape;
  nailTexture: NailTexture;
  nailColor: string;
  skinTone?: string;
}

const Nail3DViewer: React.FC<Nail3DViewerProps> = ({
  nailShape,
  nailTexture,
  nailColor,
  skinTone = "#e8c4a2",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nailMeshRef = useRef<THREE.Mesh | null>(null);
  const fingerMeshRef = useRef<THREE.Group | null>(null);

  // Convertir la couleur hex en couleur THREE.js
  const getThreeColor = (hexColor: string) => {
    return new THREE.Color(hexColor);
  };

  // Créer la géométrie de l'ongle en fonction de la forme
  const createNailGeometry = (shape: NailShape) => {
    let geometry: THREE.BufferGeometry;

    switch (shape) {
      case "round": {
        // Créer une forme arrondie plus réaliste
        const points = [];
        const width = 0.5;
        const length = 1.0;

        // Créer une courbe pour la forme arrondie
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const x = width * Math.sin(t * Math.PI);
          const z = length * (1 - t);
          points.push(new THREE.Vector2(x, z));
        }

        const roundShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(roundShape, extrudeSettings);
        break;
      }
      case "square": {
        // Créer une forme carrée plus réaliste avec des coins arrondis
        const points = [];
        const width = 0.5;
        const length = 1.0;

        // Base large
        points.push(new THREE.Vector2(-width, 0));
        points.push(new THREE.Vector2(width, 0));

        // Côtés parallèles
        points.push(new THREE.Vector2(width, length * 0.9));

        // Bout carré avec coins légèrement arrondis
        points.push(new THREE.Vector2(width, length));
        points.push(new THREE.Vector2(-width, length));
        points.push(new THREE.Vector2(-width, length * 0.9));

        const squareShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(squareShape, extrudeSettings);
        break;
      }
      case "almond": {
        // Créer une forme d'amande plus réaliste
        const points = [];
        const width = 0.5;
        const length = 1.5;

        // Créer une courbe pour la forme d'amande
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const x = width * Math.sin(t * Math.PI);
          const z = length * (1 - t);
          points.push(new THREE.Vector2(x, z));
        }

        const almondShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(almondShape, extrudeSettings);
        break;
      }
      case "stiletto": {
        // Créer une forme stiletto plus réaliste
        const points = [];
        const width = 0.5;
        const length = 2.0;

        // Base plus large qui s'affine vers la pointe
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const x = width * (1 - t * 0.9);
          const z = length * (1 - t);
          points.push(new THREE.Vector2(x, z));
        }

        // Ajouter le côté opposé pour fermer la forme
        for (let i = 10; i >= 0; i--) {
          const t = i / 10;
          const x = -width * (1 - t * 0.9);
          const z = length * (1 - t);
          points.push(new THREE.Vector2(x, z));
        }

        const stilettoShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(stilettoShape, extrudeSettings);
        break;
      }
      case "coffin": {
        // Créer une forme ballerine (coffin) plus réaliste
        const points = [];
        const width = 0.5;
        const length = 2.0;

        // Base large
        points.push(new THREE.Vector2(-width, 0));
        points.push(new THREE.Vector2(width, 0));

        // Côtés parallèles
        points.push(new THREE.Vector2(width, length * 0.7));

        // Bout plat caractéristique
        points.push(new THREE.Vector2(width * 0.6, length));
        points.push(new THREE.Vector2(-width * 0.6, length));

        // Fermer la forme
        points.push(new THREE.Vector2(-width, length * 0.7));

        const coffinShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(coffinShape, extrudeSettings);
        break;
      }
      default: {
        // Forme par défaut (round)
        const points = [];
        const width = 0.5;
        const length = 1.0;

        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const x = width * Math.sin(t * Math.PI);
          const z = length * (1 - t);
          points.push(new THREE.Vector2(x, z));
        }

        const defaultShape = new THREE.Shape(points);
        const extrudeSettings = {
          steps: 1,
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        };

        geometry = new THREE.ExtrudeGeometry(defaultShape, extrudeSettings);
        break;
      }
    }

    return geometry;
  };

  // Créer le matériau de l'ongle en fonction de la texture
  const createNailMaterial = (texture: NailTexture, color: string) => {
    const threeColor = getThreeColor(color);
    let material: THREE.Material;

    switch (texture) {
      case "glossy":
        material = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          metalness: 0.1,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 1.0,
          envMapIntensity: 1.2,
          transparent: true,
          opacity: 0.9, // Légère transparence pour plus de réalisme
        });
        break;
      case "matte":
        material = new THREE.MeshStandardMaterial({
          color: threeColor,
          metalness: 0.0,
          roughness: 0.9,
          flatShading: false,
        });
        break;
      case "metallic": {
        const metallicMaterial = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          metalness: 0.9,
          roughness: 0.2,
          reflectivity: 1.0,
          envMapIntensity: 1.5,
        });

        // Ajouter un effet de reflet métallique
        new THREE.TextureLoader().load(
          "https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg",
          (texture) => {
            if (rendererRef.current) {
              const pmremGenerator = new THREE.PMREMGenerator(
                rendererRef.current
              );
              pmremGenerator.compileEquirectangularShader();
              const envMap =
                pmremGenerator.fromEquirectangular(texture).texture;
              metallicMaterial.envMap = envMap;
              texture.dispose();
              pmremGenerator.dispose();
            }
          }
        );

        material = metallicMaterial;
        break;
      }
      case "glitter": {
        // Simuler l'effet pailleté avec une texture de points brillants
        const glitterMaterial = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          metalness: 0.5,
          roughness: 0.2,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
        });

        // Créer une texture de paillettes
        const size = 512;
        const data = new Uint8Array(size * size * 4);

        for (let i = 0; i < size * size * 4; i += 4) {
          // Fond transparent
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;

          // Ajouter des points brillants aléatoires
          if (Math.random() > 0.99) {
            const brightness = 155 + Math.random() * 100;
            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
            data[i + 3] = 255;
          }
        }

        const glitterTexture = new THREE.DataTexture(
          data,
          size,
          size,
          THREE.RGBAFormat
        );
        glitterTexture.needsUpdate = true;

        glitterMaterial.alphaMap = glitterTexture;
        glitterMaterial.transparent = true;

        // Ajouter un effet scintillant
        const envMap = new THREE.CubeTextureLoader()
          .setPath("https://threejs.org/examples/textures/cube/pisa/")
          .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

        glitterMaterial.envMap = envMap;
        glitterMaterial.envMapIntensity = 1.5;

        material = glitterMaterial;
        break;
      }
      default:
        material = new THREE.MeshStandardMaterial({
          color: threeColor,
        });
        break;
    }

    return material;
  };

  // Initialiser la scène 3D
  useEffect(() => {
    if (!containerRef.current) return;

    // Créer le renderer avec des ombres
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Ajouter les contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Ajouter l'éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Lumière principale avec ombres
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Lumière d'accentuation pour l'ongle
    const nailLight = new THREE.SpotLight(0xffffff, 1.5);
    nailLight.position.set(0, 3, 3);
    nailLight.angle = Math.PI / 6;
    nailLight.penumbra = 0.2;
    scene.add(nailLight);

    // Lumière de remplissage douce
    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    // Créer le modèle de doigt
    const fingerGroup = new THREE.Group();

    // Créer les phalanges
    const phalangeGeometry = new THREE.CylinderGeometry(0.5, 0.45, 2.5, 16);
    phalangeGeometry.rotateX(Math.PI / 2);

    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: getThreeColor(skinTone || "#e0ac69"),
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });

    // Première phalange
    const phalange1 = new THREE.Mesh(phalangeGeometry, skinMaterial);
    phalange1.position.set(0, 0, -1.25);
    phalange1.castShadow = true;
    phalange1.receiveShadow = true;
    fingerGroup.add(phalange1);

    // Deuxième phalange (légèrement plus petite)
    const phalange2Geometry = new THREE.CylinderGeometry(0.45, 0.4, 2, 16);
    phalange2Geometry.rotateX(Math.PI / 2);
    const phalange2 = new THREE.Mesh(phalange2Geometry, skinMaterial);
    phalange2.position.set(0, 0, -3.5);
    phalange2.castShadow = true;
    phalange2.receiveShadow = true;
    fingerGroup.add(phalange2);

    // Bout du doigt (arrondi)
    const fingertipGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const fingertip = new THREE.Mesh(fingertipGeometry, skinMaterial);
    fingertip.position.set(0, 0, -4.6);
    fingertip.scale.set(1, 1, 0.8);
    fingertip.castShadow = true;
    fingertip.receiveShadow = true;
    fingerGroup.add(fingertip);

    // Ajouter le groupe de doigt à la scène
    scene.add(fingerGroup);
    fingerMeshRef.current = fingerGroup;

    // Créer l'ongle
    const nailGeometry = createNailGeometry(nailShape);
    const nailMaterial = createNailMaterial(nailTexture, nailColor);
    const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

    // Positionner l'ongle sur le doigt
    nailMesh.position.set(0, 0.3, -2.8);

    // Orienter l'ongle correctement selon la forme
    if (
      nailShape === "almond" ||
      nailShape === "stiletto" ||
      nailShape === "coffin"
    ) {
      nailMesh.rotation.x = Math.PI / 2;
    } else {
      nailMesh.rotation.x = 0;
    }

    scene.add(nailMesh);
    nailMeshRef.current = nailMesh;

    // Ajouter un plan pour les ombres
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({
      opacity: 0.2,
      color: 0x000000,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Ajouter un léger mouvement de respiration au doigt
      if (fingerMeshRef.current) {
        fingerMeshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Mettre à jour l'ongle lorsque les propriétés changent
  useEffect(() => {
    if (!sceneRef.current || !nailMeshRef.current) return;

    // Supprimer l'ancien mesh
    sceneRef.current.remove(nailMeshRef.current);

    // Créer un nouveau mesh avec les nouvelles propriétés
    const nailGeometry = createNailGeometry(nailShape);
    const nailMaterial = createNailMaterial(nailTexture, nailColor);
    const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

    // Positionner l'ongle sur le doigt
    nailMesh.position.set(0, 0.3, -2.8);

    // Orienter l'ongle correctement selon la forme
    if (
      nailShape === "almond" ||
      nailShape === "stiletto" ||
      nailShape === "coffin"
    ) {
      nailMesh.rotation.x = Math.PI / 2;
    } else {
      nailMesh.rotation.x = 0;
    }

    // Ajouter à la scène
    sceneRef.current.add(nailMesh);
    nailMeshRef.current = nailMesh;
  }, [nailShape, nailTexture, nailColor]);

  // Mettre à jour la couleur de peau
  useEffect(() => {
    if (!fingerMeshRef.current) return;

    // Parcourir tous les meshes du doigt et mettre à jour la couleur de peau
    fingerMeshRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        if (
          (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial) &&
          material.color
        ) {
          material.color = getThreeColor(skinTone);
        }
      }
    });
  }, [skinTone]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: "500px" }}
    >
      {/* Overlay avec instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white text-xs p-2 rounded">
        Faites glisser pour faire pivoter • Molette pour zoomer • Double-cliquez
        pour réinitialiser la vue
      </div>
    </div>
  );
};

export default Nail3DViewer;
