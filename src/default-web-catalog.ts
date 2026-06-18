import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn";
import type { z } from "zod";
import type { Spec } from "./types";

export const defaultWebCatalog = defineCatalog(schema, {
  actions: {},
  components: shadcnComponentDefinitions,
});

export const defaultWebSpecSchema = defaultWebCatalog.zodSchema() as z.ZodType<Spec>;
