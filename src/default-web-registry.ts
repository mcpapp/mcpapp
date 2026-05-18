import { defineCatalog } from "@json-render/core";
import { defineRegistry } from "@json-render/react";
import { schema } from "@json-render/react/schema";
import {
  shadcnComponentDefinitions,
  shadcnComponents,
} from "@json-render/shadcn";
import type { Registry } from "./types";

export const defaultWebCatalog = defineCatalog(schema, {
  actions: {},
  components: shadcnComponentDefinitions,
});

export const { registry: defaultWebRegistry } = defineRegistry(
  defaultWebCatalog,
  {
    components: shadcnComponents,
  },
) satisfies { registry: Registry };
