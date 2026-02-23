// sanity/schemaTypes/moduleExegesis.ts
import { defineField, defineType } from "sanity";

export const moduleExegesis = defineType({
  name: "moduleExegesis",
  title: "Module: Exegesis",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "followPlayer",
      title: "Follow current player track",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "initialTrackId",
      title: "Initial pinned trackId (optional)",
      type: "string",
      description:
        "Only used when Follow player is off. Leave blank to default to first track in queue.",
    }),
  ],
  preview: {
    select: { title: "title", followPlayer: "followPlayer" },
    prepare({ title, followPlayer }) {
      return {
        title: title ?? "Exegesis",
        subtitle: followPlayer ? "Follows player track" : "Pinned track",
      };
    },
  },
});