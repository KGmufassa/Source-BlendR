import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@source-blendr/domain", "@source-blendr/shared"],
};

export default config;
