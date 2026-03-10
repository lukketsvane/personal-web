import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        'shadow-intensity'?: string;
        'interaction-prompt'?: string;
        poster?: string;
      };
    }
  }
}
