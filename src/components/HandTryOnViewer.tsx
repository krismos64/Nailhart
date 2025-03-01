import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { NailShape, NailTexture } from "./NailCanvas";

interface HandTryOnViewerProps {
  nailShape: NailShape;
  nailTexture: NailTexture;
  nailColors: string[]; // Tableau de couleurs pour chaque ongle
  skinTone?: string;
}

const HandTryOnViewer: React.FC<HandTryOnViewerProps> = ({
  nailShape,
  nailTexture,
  nailColors,
  skinTone = "#e8c4a2",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nailMeshesRef = useRef<THREE.Mesh[]>([]);
  const handModelRef = useRef<THREE.Group | null>(null);

  // Convertir la couleur hex en couleur THREE.js
  const getThreeColor = (hexColor: string) => {
    return new THREE.Color(hexColor);
  };

  // Créer la géométrie de l'ongle en fonction de la forme
  const createNailGeometry = (shape: NailShape) => {
    let geometry: THREE.BufferGeometry;

    switch (shape) {
      case "round":
        geometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        break;
      case "square":
        geometry = new THREE.BoxGeometry(1, 0.2, 1.5);
        break;
      case "almond": {
        // Utiliser une géométrie personnalisée pour la forme amande
        const almondGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        almondGeometry.scale(1, 0.3, 1);
        geometry = almondGeometry;
        break;
      }
      case "stiletto":
        geometry = new THREE.ConeGeometry(0.5, 2, 8);
        break;
      case "coffin": {
        // Utiliser une géométrie personnalisée pour la forme ballerine
        const coffinGeometry = new THREE.BoxGeometry(1, 0.2, 2);
        coffinGeometry.scale(1, 1, 0.7);
        geometry = coffinGeometry;
        break;
      }
      default:
        geometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        break;
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
        });
        break;
      case "matte":
        material = new THREE.MeshStandardMaterial({
          color: threeColor,
          metalness: 0.0,
          roughness: 0.9,
        });
        break;
      case "metallic":
        material = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          metalness: 0.9,
          roughness: 0.2,
          reflectivity: 1.0,
        });
        break;
      case "glitter": {
        // Simuler l'effet pailleté avec une texture de points brillants
        const glitterMaterial = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          metalness: 0.5,
          roughness: 0.2,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
        });

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

  // Créer un modèle de main simple
  const createHandModel = (skinToneColor: string) => {
    const handGroup = new THREE.Group();

    // Créer la paume
    const palmGeometry = new THREE.BoxGeometry(3, 0.5, 4);
    const palmMaterial = new THREE.MeshStandardMaterial({
      color: getThreeColor(skinToneColor),
      roughness: 0.8,
      metalness: 0.1,
    });
    const palmMesh = new THREE.Mesh(palmGeometry, palmMaterial);
    handGroup.add(palmMesh);

    // Positions des doigts
    const fingerPositions = [
      { x: -1.2, y: 0, z: -2, rotation: 0 }, // Petit doigt
      { x: -0.6, y: 0, z: -2.2, rotation: 0 }, // Annulaire
      { x: 0, y: 0, z: -2.4, rotation: 0 }, // Majeur
      { x: 0.6, y: 0, z: -2.2, rotation: 0 }, // Index
      { x: 1.5, y: 0, z: -1.5, rotation: 0.5 }, // Pouce
    ];

    // Créer les doigts
    fingerPositions.forEach((position, index) => {
      // Créer le doigt
      const fingerLength = index === 2 ? 3 : index === 4 ? 2 : 2.5; // Le majeur est plus long
      const fingerGeometry = new THREE.CylinderGeometry(
        0.3, // Rayon supérieur
        0.25, // Rayon inférieur
        fingerLength, // Hauteur
        8 // Segments
      );

      const fingerMaterial = new THREE.MeshStandardMaterial({
        color: getThreeColor(skinToneColor),
        roughness: 0.8,
        metalness: 0.1,
      });

      const fingerMesh = new THREE.Mesh(fingerGeometry, fingerMaterial);

      // Positionner le doigt
      fingerMesh.position.set(
        position.x,
        position.y,
        position.z - fingerLength / 2
      );
      fingerMesh.rotation.x = Math.PI / 2 + position.rotation;

      handGroup.add(fingerMesh);

      // Créer l'ongle
      const nailGeometry = createNailGeometry(nailShape);
      const nailMaterial = createNailMaterial(
        nailTexture,
        nailColors[index] || nailColors[0]
      );

      const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

      // Positionner l'ongle sur le doigt
      const nailScale = index === 4 ? 0.7 : 0.8; // Le pouce a un ongle plus petit
      nailMesh.scale.set(nailScale, nailScale, nailScale);

      // Calculer la position de l'ongle à l'extrémité du doigt
      const nailPositionZ = position.z - fingerLength;
      nailMesh.position.set(position.x, position.y + 0.2, nailPositionZ);
      nailMesh.rotation.x = Math.PI / 2 + position.rotation - Math.PI / 6;

      handGroup.add(nailMesh);
      nailMeshesRef.current[index] = nailMesh;
    });

    return handGroup;
  };

  // Initialiser la scène 3D
  useEffect(() => {
    if (!containerRef.current) return;

    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 5);
    cameraRef.current = camera;

    // Ajouter les contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // Ajouter l'éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Créer le modèle de main
    const handModel = createHandModel(skinTone);
    scene.add(handModel);
    handModelRef.current = handModel;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
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
  }, [nailShape, nailTexture, nailColors, skinTone]);

  // Mettre à jour les ongles lorsque les paramètres changent
  useEffect(() => {
    if (!sceneRef.current || nailMeshesRef.current.length === 0) return;

    // Mettre à jour chaque ongle
    nailMeshesRef.current.forEach((nailMesh, index) => {
      if (!nailMesh) return;

      // Supprimer l'ancien mesh
      sceneRef.current?.remove(nailMesh);

      // Créer un nouveau mesh avec les nouveaux paramètres
      const nailGeometry = createNailGeometry(nailShape);
      const nailMaterial = createNailMaterial(
        nailTexture,
        nailColors[index] || nailColors[0]
      );

      const newNailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

      // Copier la position et la rotation de l'ancien mesh
      newNailMesh.position.copy(nailMesh.position);
      newNailMesh.rotation.copy(nailMesh.rotation);
      newNailMesh.scale.copy(nailMesh.scale);

      // Ajouter à la scène
      sceneRef.current?.add(newNailMesh);
      nailMeshesRef.current[index] = newNailMesh;
    });
  }, [nailShape, nailTexture, nailColors]);

  // Mettre à jour la couleur de peau
  useEffect(() => {
    if (!handModelRef.current) return;

    // Mettre à jour la couleur de peau pour tous les éléments de la main
    handModelRef.current.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        // Ne pas modifier les ongles
        if (!nailMeshesRef.current.includes(child)) {
          child.material.color = getThreeColor(skinTone);
        }
      }
    });
  }, [skinTone]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
};

export default HandTryOnViewer;
