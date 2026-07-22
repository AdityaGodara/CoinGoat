import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { sanityProjectId, sanityDataset, sanityApiVersion } from "./src/lib/api/sanity/env";

export default defineConfig({
  name: "coingoat",
  title: "CoinGoat CMS",
  basePath: "/studio",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool({ defaultApiVersion: sanityApiVersion })],
});
