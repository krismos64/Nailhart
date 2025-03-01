declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, EventDispatcher } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);

    enabled: boolean;
    target: THREE.Vector3;

    minDistance: number;
    maxDistance: number;

    minZoom: number;
    maxZoom: number;

    minPolarAngle: number;
    maxPolarAngle: number;

    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    enableDamping: boolean;
    dampingFactor: number;

    enableZoom: boolean;
    zoomSpeed: number;

    enableRotate: boolean;
    rotateSpeed: number;

    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    enableKeys: boolean;

    update(): boolean;
    dispose(): void;

    getPolarAngle(): number;
    getAzimuthalAngle(): number;

    saveState(): void;
    reset(): void;
  }
}
