declare module '*.mdx' {
    import type { ReactElement } from 'react'
    const component: (props: any) => ReactElement
    export default component
  }
  
  declare namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
  