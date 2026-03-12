// sanity/schemaTypes/badgeDefinition.ts
import { defineField, defineType } from "sanity";

export const badgeDefinition = defineType({
  name: "badgeDefinition",
  title: "Badge Definition",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "keySuffix",
      title: "Badge key suffix",
      type: "string",
      description:
        "Enter only the suffix portion, for example early_supporter. The app will derive the entitlement key as badge_early_supporter.",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
            name: "badge key suffix",
            invert: false,
          })
          .error(
            "Badge key suffixes must use lowercase letters, numbers, and underscores only.",
          ),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "shareable",
      title: "Shareable",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "undisclosed",
      title: "Undisclosed until unlocked",
      type: "boolean",
      initialValue: false,
      description:
        "Hide this badge from members who have not unlocked it yet. Useful for exclusive, retired, or time-bound badges that should not appear as visible locked promises.",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "internalNote",
      title: "Internal note",
      type: "text",
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [
        { field: "displayOrder", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      keySuffix: "keySuffix",
      media: "image",
      active: "active",
      undisclosed: "undisclosed",
    },
    prepare(selection) {
      const title =
        typeof selection.title === "string" && selection.title.trim()
          ? selection.title.trim()
          : "Untitled badge";

      const entitlementKey =
        typeof selection.keySuffix === "string" && selection.keySuffix.trim()
          ? `badge_${selection.keySuffix.trim()}`
          : "No entitlement key";

      const stateBits = [
        selection.active === false ? "inactive" : null,
        selection.undisclosed === true ? "undisclosed" : null,
      ].filter((value): value is string => Boolean(value));

      return {
        title,
        subtitle:
          stateBits.length > 0
            ? `${entitlementKey} · ${stateBits.join(" · ")}`
            : entitlementKey,
        media: selection.media,
      };
    },
  },
});
