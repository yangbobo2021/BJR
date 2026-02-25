// sanity/schemaTypes/moduleExegesis.ts
import { defineField, defineType } from "sanity";

export const moduleExegesis = defineType({
  name: "moduleExegesis",
  title: "Module: Exegesis",
  type: "object",
  fields: [defineField({ name: "title", title: "Title", type: "string" })],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return {
        title: title ?? "Exegesis",
        subtitle: "Track index",
      };
    },
  },
});