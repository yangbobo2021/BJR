// sanity/schemaTypes/landingPage.ts
import { defineField, defineType } from "sanity";

export const landingPage = defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description:
        "Optional small uppercase line above the logo or fallback heading.",
    }),
    defineField({
      name: "title",
      title: "Fallback Title",
      type: "string",
      description:
        "Used only if no logo image is supplied.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logoImage",
      title: "Logo Image",
      type: "image",
      description:
        "Transparent PNG or WebP preferred. This replaces the large text heading.",
      options: { hotspot: true },
    }),
    defineField({
      name: "logoAlt",
      title: "Logo Alt Text",
      type: "string",
      initialValue: "Site logo",
    }),
    defineField({
      name: "logoHeightPx",
      title: "Logo Height (px)",
      type: "number",
      description:
        "Controls rendered logo height on the landing page.",
      initialValue: 132,
      validation: (rule) => rule.min(48).max(420).integer(),
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      description:
        "Used when no CTA image is supplied.",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Link",
      type: "url",
      description:
        "Outbound link for the secondary CTA.",
    }),
    defineField({
      name: "ctaImage",
      title: "CTA Image",
      type: "image",
      description:
        "Optional uploaded image to use instead of the text CTA button.",
      options: { hotspot: true },
    }),
    defineField({
      name: "ctaImageAlt",
      title: "CTA Image Alt Text",
      type: "string",
      description:
        "Accessible text for the CTA image link.",
    }),
    defineField({
      name: "ctaImageHeightPx",
      title: "CTA Image Height (px)",
      type: "number",
      description:
        "Controls rendered height of the CTA image link.",
      initialValue: 44,
      validation: (rule) => rule.min(28).max(160).integer(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "logoImage",
      subtitle: "subtitle",
    },
    prepare(selection) {
      return {
        title: selection.title || "Landing Page",
        subtitle:
          typeof selection.subtitle === "string" && selection.subtitle.trim().length > 0
            ? selection.subtitle
            : "No subtitle set",
        media: selection.media,
      };
    },
  },
});