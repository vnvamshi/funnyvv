import { Object3D, Light } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      primitive: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      spotLight: any;
      perspectiveCamera: any;
      orthographicCamera: any;
      scene: any;
    }
  }
} 