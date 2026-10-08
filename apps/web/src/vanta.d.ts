declare module 'vanta/dist/vanta.halo.min' {
  const HALO: (options: Record<string, unknown>) => { destroy: () => void };
  export default HALO;
}
