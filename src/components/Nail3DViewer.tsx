import React, { useRef, useEffect } from "react";
import * as THREE from "three";
// @ts-ignore
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
  const fingerMeshRef = useRef<THREE.Mesh | null>(null);

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
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Ajouter les contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
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

    // Créer le doigt
    const fingerGeometry = new THREE.CylinderGeometry(0.5, 0.4, 3, 16);
    const fingerMaterial = new THREE.MeshStandardMaterial({
      color: getThreeColor(skinTone),
      roughness: 0.8,
      metalness: 0.1,
    });
    const fingerMesh = new THREE.Mesh(fingerGeometry, fingerMaterial);
    fingerMesh.rotation.x = Math.PI / 2;
    fingerMesh.position.z = -1;
    scene.add(fingerMesh);
    fingerMeshRef.current = fingerMesh;

    // Créer l'ongle
    const nailGeometry = createNailGeometry(nailShape);
    const nailMaterial = createNailMaterial(nailTexture, nailColor);
    const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

    // Positionner l'ongle sur le doigt
    nailMesh.position.set(0, 0, 0.8);
    nailMesh.rotation.x = -Math.PI / 6;
    scene.add(nailMesh);
    nailMeshRef.current = nailMesh;

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
  }, [nailShape, nailTexture, nailColor, skinTone]);

  // Mettre à jour la forme de l'ongle
  useEffect(() => {
    if (!sceneRef.current || !nailMeshRef.current) return;

    // Supprimer l'ancien mesh
    sceneRef.current.remove(nailMeshRef.current);

    // Créer un nouveau mesh avec la nouvelle forme
    const nailGeometry = createNailGeometry(nailShape);
    const nailMaterial = createNailMaterial(nailTexture, nailColor);
    const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

    // Positionner l'ongle sur le doigt
    nailMesh.position.set(0, 0, 0.8);
    nailMesh.rotation.x = -Math.PI / 6;

    // Ajouter à la scène
    sceneRef.current.add(nailMesh);
    nailMeshRef.current = nailMesh;
  }, [nailShape, nailTexture, nailColor]);

  // Mettre à jour la couleur de peau
  useEffect(() => {
    if (!fingerMeshRef.current) return;

    (fingerMeshRef.current.material as THREE.MeshStandardMaterial).color =
      getThreeColor(skinTone);
  }, [skinTone]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
};

export default Nail3DViewer;
