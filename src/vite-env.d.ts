/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_GOV_IN_API_KEY?: string;
  readonly VITE_OSRM_ROUTING_URL?: string;
  readonly VITE_ENABLE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

