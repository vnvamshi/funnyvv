declare module '*.svg' {
    import * as React from 'react';
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.glb' {
    const content: string;
    export default content;
}

declare module '@react-three/fiber' {
    import { Object3D, Light } from 'three';
    
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

// Global declaration for Razorpay injected by checkout.js
interface Window {
	Razorpay: new (options: any) => { open: () => void };
}

// Lightweight module typings for markdown libs to satisfy TS
declare module 'react-markdown' {
  import * as React from 'react';
  const ReactMarkdown: React.ComponentType<any>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}
  