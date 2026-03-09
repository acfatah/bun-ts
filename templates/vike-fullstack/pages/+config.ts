import type { Config } from "vike/types";
import vikePhoton from "vike-photon/config";
import vikeVue from "vike-vue/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "My Vike App",
  description: "Demo showcasing Vike",

  extends: [vikeVue, vikePhoton],

  // https://vike.dev/vike-photon
  photon: {
    server: "../server/entry.ts",
  },
} as Config;
