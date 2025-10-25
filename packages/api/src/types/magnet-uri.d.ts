declare module 'magnet-uri' {
  export interface Instance {
    dn?: string;
    xt?: string[];
    tr?: string | string[];
    [key: string]: any;
  }

  export function decode(uri: string): Instance;
  export function encode(parsed: Instance): string;
}