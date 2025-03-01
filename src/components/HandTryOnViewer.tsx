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
  const createNailGeometry = (shape: NailShape, fingerIndex: number) => {
    let geometry: THREE.BufferGeometry;

    // Ajuster les dimensions en fonction du doigt
    const widthFactor =
      fingerIndex === 4
        ? 1.2 // Pouce plus large
        : fingerIndex === 2
        ? 1.0 // Majeur standard
        : fingerIndex === 0
        ? 0.8 // Petit doigt plus étroit
        : 0.9; // Autres doigts

    const lengthFactor =
      fingerIndex === 2
        ? 1.1 // Majeur plus long
        : fingerIndex === 4
        ? 0.9 // Pouce plus court
        : fingerIndex === 0
        ? 0.85 // Petit doigt plus court
        : 1.0; // Autres doigts

    switch (shape) {
      case "round": {
        geometry = new THREE.CapsuleGeometry(
          0.5 * widthFactor,
          1 * lengthFactor,
          12,
          24
        );
        // Aplatir l'ongle pour plus de réalisme
        geometry.scale(1, 0.25, 1);
        break;
      }
      case "square": {
        geometry = new THREE.BoxGeometry(
          1 * widthFactor,
          0.2,
          1.5 * lengthFactor
        );
        // Arrondir légèrement les bords pour plus de réalisme
        geometry = new THREE.BoxGeometry(
          1 * widthFactor,
          0.2,
          1.5 * lengthFactor,
          1,
          1,
          3
        );
        break;
      }
      case "almond": {
        // Créer une forme d'amande plus réaliste
        const points = [];
        const width = 0.5 * widthFactor;
        const length = 1.5 * lengthFactor;

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
        const width = 0.5 * widthFactor;
        const length = 2 * lengthFactor;

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
        const width = 0.5 * widthFactor;
        const length = 2 * lengthFactor;

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
      default:
        geometry = new THREE.CapsuleGeometry(
          0.5 * widthFactor,
          1 * lengthFactor,
          12,
          24
        );
        geometry.scale(1, 0.25, 1);
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
        const pmremGenerator = new THREE.PMREMGenerator(rendererRef.current!);
        pmremGenerator.compileEquirectangularShader();

        new THREE.TextureLoader().load(
          "https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg",
          (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            metallicMaterial.envMap = envMap;
            texture.dispose();
            pmremGenerator.dispose();
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

  // Créer un modèle de main féminine plus réaliste
  const createHandModel = (skinToneColor: string) => {
    const handGroup = new THREE.Group();

    // Créer la paume avec une forme plus naturelle
    const palmShape = new THREE.Shape();

    // Dessiner le contour de la paume
    palmShape.moveTo(-1.5, 0); // Côté extérieur (petit doigt)
    palmShape.lineTo(-1.7, -2); // Poignet côté petit doigt
    palmShape.quadraticCurveTo(-1.5, -3.5, 0, -4); // Courbe du poignet
    palmShape.quadraticCurveTo(1.5, -3.5, 1.7, -2); // Poignet côté pouce
    palmShape.lineTo(2, -1); // Base du pouce
    palmShape.quadraticCurveTo(2.2, 0, 2, 1); // Courbe du pouce
    palmShape.lineTo(1.5, 0); // Retour vers la paume

    // Fermer la forme
    palmShape.lineTo(-1.5, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelSegments: 3,
    };

    const palmGeometry = new THREE.ExtrudeGeometry(palmShape, extrudeSettings);

    // Matériau de la peau avec subsurface scattering pour un effet plus réaliste
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: getThreeColor(skinToneColor),
      roughness: 0.8,
      metalness: 0.0,
      transmission: 0.1, // Légère translucidité
      thickness: 0.5, // Épaisseur pour la diffusion
      clearcoat: 0.1, // Légère brillance naturelle
      clearcoatRoughness: 0.8,
    });

    const palmMesh = new THREE.Mesh(palmGeometry, skinMaterial);
    palmMesh.rotation.x = Math.PI / 2; // Orienter la paume correctement
    handGroup.add(palmMesh);

    // Positions des doigts avec des angles plus naturels
    const fingerPositions = [
      {
        x: -1.2,
        y: 0,
        z: -0.5,
        rotation: { x: Math.PI / 2 + 0.1, y: 0.1, z: 0 },
        length: 2.2,
        width: 0.25,
      }, // Petit doigt
      {
        x: -0.6,
        y: 0,
        z: -0.7,
        rotation: { x: Math.PI / 2 + 0.05, y: 0.05, z: 0 },
        length: 2.5,
        width: 0.28,
      }, // Annulaire
      {
        x: 0,
        y: 0,
        z: -0.8,
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        length: 2.7,
        width: 0.3,
      }, // Majeur
      {
        x: 0.6,
        y: 0,
        z: -0.7,
        rotation: { x: Math.PI / 2 - 0.05, y: -0.05, z: 0 },
        length: 2.5,
        width: 0.28,
      }, // Index
      {
        x: 1.5,
        y: 0,
        z: -0.2,
        rotation: { x: Math.PI / 2, y: -0.8, z: 0.2 },
        length: 2.0,
        width: 0.35,
      }, // Pouce
    ];

    // Créer les doigts avec des articulations
    fingerPositions.forEach((position, index) => {
      // Groupe pour chaque doigt
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(position.x, position.y, position.z);
      fingerGroup.rotation.set(
        position.rotation.x,
        position.rotation.y,
        position.rotation.z
      );

      // Créer les phalanges
      const numPhalanges = index === 4 ? 2 : 3; // Le pouce a 2 phalanges, les autres 3
      const phalangeLength = position.length / numPhalanges;

      for (let i = 0; i < numPhalanges; i++) {
        // Réduire légèrement la taille pour chaque phalange
        const phalangeWidth = position.width * (1 - i * 0.1);

        // Créer une phalange avec une forme plus naturelle
        const phalangeGeometry = new THREE.CapsuleGeometry(
          phalangeWidth,
          phalangeLength * 0.8,
          8,
          8
        );

        // Aplatir légèrement la phalange
        phalangeGeometry.scale(1, 0.7, 1);

        const phalangeMesh = new THREE.Mesh(phalangeGeometry, skinMaterial);

        // Positionner la phalange
        phalangeMesh.position.z = -i * phalangeLength - phalangeLength / 2;

        // Ajouter une légère courbure aux phalanges
        phalangeMesh.rotation.x = i * 0.1;

        fingerGroup.add(phalangeMesh);

        // Ajouter une articulation entre les phalanges (sauf pour la première)
        if (i > 0) {
          const jointGeometry = new THREE.SphereGeometry(
            phalangeWidth * 0.9,
            8,
            8
          );
          const jointMesh = new THREE.Mesh(jointGeometry, skinMaterial);
          jointMesh.position.z = -i * phalangeLength;
          jointMesh.scale.set(1, 0.7, 1);
          fingerGroup.add(jointMesh);
        }
      }

      // Ajouter l'ongle sur la dernière phalange
      const nailGeometry = createNailGeometry(nailShape, index);
      const nailMaterial = createNailMaterial(
        nailTexture,
        nailColors[index] || nailColors[0]
      );

      const nailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

      // Positionner l'ongle sur le bout du doigt
      const nailZ = -numPhalanges * phalangeLength;
      const nailY = position.width * 0.5; // Placer l'ongle sur le dessus du doigt

      nailMesh.position.set(0, nailY, nailZ);

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

      fingerGroup.add(nailMesh);
      nailMeshesRef.current[index] = nailMesh;

      handGroup.add(fingerGroup);
    });

    // Ajouter des détails comme les lignes de la paume
    const palmLinesGeometry = new THREE.TorusGeometry(1, 0.02, 8, 20, Math.PI);
    const palmLinesMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skinToneColor).multiplyScalar(0.85), // Plus foncé que la peau
      transparent: true,
      opacity: 0.5,
    });

    // Ligne de vie
    const lifeLine = new THREE.Mesh(palmLinesGeometry, palmLinesMaterial);
    lifeLine.position.set(1, 0.1, -2);
    lifeLine.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    handGroup.add(lifeLine);

    // Ligne de tête
    const headLine = new THREE.Mesh(palmLinesGeometry, palmLinesMaterial);
    headLine.position.set(0, 0.1, -2);
    headLine.rotation.set(Math.PI / 2, 0, 0);
    headLine.scale.set(0.8, 1, 1);
    handGroup.add(headLine);

    // Ligne de cœur
    const heartLine = new THREE.Mesh(palmLinesGeometry, palmLinesMaterial);
    heartLine.position.set(-0.5, 0.1, -1.5);
    heartLine.rotation.set(Math.PI / 2, 0, -Math.PI / 6);
    heartLine.scale.set(0.6, 1, 1);
    handGroup.add(heartLine);

    return handGroup;
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
    scene.background = new THREE.Color(0x111111);
    // Ajouter un léger brouillard pour la profondeur
    scene.fog = new THREE.FogExp2(0x111111, 0.03);
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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0, -2); // Cibler le centre de la main
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

    // Lumière d'accentuation pour les ongles
    const nailLight = new THREE.SpotLight(0xffffff, 1.5);
    nailLight.position.set(0, 3, 3);
    nailLight.angle = Math.PI / 6;
    nailLight.penumbra = 0.2;
    scene.add(nailLight);

    // Lumière de remplissage douce
    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    // Créer et ajouter le modèle de main
    const handModel = createHandModel(skinTone);
    handModel.position.set(0, 0, 0);
    scene.add(handModel);
    handModelRef.current = handModel;

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

      // Ajouter un léger mouvement de respiration à la main
      if (handModelRef.current) {
        handModelRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
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

  // Mettre à jour les ongles lorsque les propriétés changent
  useEffect(() => {
    if (!sceneRef.current || !handModelRef.current) return;

    // Mettre à jour chaque ongle
    nailMeshesRef.current.forEach((nailMesh, index) => {
      if (!nailMesh || !sceneRef.current) return;

      // Supprimer l'ancien mesh
      const parent = nailMesh.parent;
      if (parent) {
        parent.remove(nailMesh);
      }

      // Créer un nouveau mesh avec les nouvelles propriétés
      const nailGeometry = createNailGeometry(nailShape, index);
      const nailMaterial = createNailMaterial(
        nailTexture,
        nailColors[index] || nailColors[0]
      );

      const newNailMesh = new THREE.Mesh(nailGeometry, nailMaterial);

      // Copier la position et la rotation de l'ancien ongle
      if (nailMesh) {
        newNailMesh.position.copy(nailMesh.position);
        newNailMesh.rotation.copy(nailMesh.rotation);
        newNailMesh.scale.copy(nailMesh.scale);
      }

      // Ajouter le nouvel ongle au même parent
      if (parent) {
        parent.add(newNailMesh);
      }

      // Mettre à jour la référence
      nailMeshesRef.current[index] = newNailMesh;
    });
  }, [nailShape, nailTexture, nailColors]);

  // Mettre à jour la couleur de peau
  useEffect(() => {
    if (!handModelRef.current) return;

    // Parcourir tous les meshes de la main et mettre à jour la couleur de peau
    handModelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        if (
          (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial) &&
          material.color
        ) {
          // Ne pas modifier les ongles
          const isNail = nailMeshesRef.current.includes(child as THREE.Mesh);
          if (!isNail && material.color) {
            material.color = getThreeColor(skinTone);
          }
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

export default HandTryOnViewer;
