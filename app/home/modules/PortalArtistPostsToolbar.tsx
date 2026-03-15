"use client";

import React from "react";
import { usePortalViewer } from "@/app/home/PortalViewerProvider";
import { useMembershipModal } from "@/app/home/MembershipModalProvider";
import {
  POST_TYPES,
  type PostType,
} from "./portalArtistPostsTypes";

type SubmitQuestionCTAProps = {
  onOpenComposer: () => void;
};

function SubmitQuestionCTA(props: SubmitQuestionCTAProps) {
  const { onOpenComposer } = props;
  const { tier, isSignedIn } = usePortalViewer();
  const { openMembershipModal } = useMembershipModal();

  if (!isSignedIn || tier === "none") return null;

  const locked = tier === "friend";
  const label = locked ? "Ask a Question (Patron+)" : "Ask a Question";

  return (
    <button
      type="button"
      onClick={() => {
        if (locked) openMembershipModal();
        else onOpenComposer();
      }}
      aria-disabled={locked}
      title={
        locked
          ? "Become a Patron to submit questions."
          : "Send a question for the next Q&A post."
      }
      style={{
        height: 28,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        background: locked
          ? "rgba(255,255,255,0.035)"
          : "rgba(255,255,255,0.07)",
        color: locked ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.92)",
        cursor: "pointer",
        opacity: locked ? 0.86 : 1,
        userSelect: "none",
        fontSize: 12,
        lineHeight: "28px",
        fontWeight: 700,
        letterSpacing: 0.2,
        transition:
          "transform 160ms ease, opacity 160ms ease, filter 160ms ease",
      }}
      onMouseDown={(event) => {
        const element = event.currentTarget;
        element.style.transform = "scale(0.98)";
        window.setTimeout(() => {
          element.style.transform = "scale(1)";
        }, 120);
      }}
    >
      {label}
    </button>
  );
}

type Props = {
  postTypeFilter: "" | PostType;
  composerOpen: boolean;
  useOverlayToolbar: boolean;
  overlayToolbarRef: React.RefObject<HTMLDivElement | null>;
  onChangeFilter: (next: "" | PostType) => void;
  onOpenComposer: () => void;
};

function PostTypeSelect(props: {
  value: "" | PostType;
  onChange: (next: "" | PostType) => void;
  constrained?: boolean;
}) {
  const { value, onChange, constrained = false } = props;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as "" | PostType)}
      aria-label="Filter posts by type"
      style={{
        height: 28,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.035)",
        color:
          value === ""
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.86)",
        padding: "0 10px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.2,
        outline: "none",
        cursor: "pointer",
        maxWidth: constrained ? "100%" : undefined,
      }}
    >
      <option value="" disabled>
        Post type
      </option>

      {POST_TYPES.map((option) => (
        <option key={option.label} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function PortalArtistPostsToolbar(props: Props) {
  const {
    postTypeFilter,
    composerOpen,
    useOverlayToolbar,
    overlayToolbarRef,
    onChangeFilter,
    onOpenComposer,
  } = props;

  if (useOverlayToolbar) {
    return (
      <div
        ref={overlayToolbarRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 3,
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          maxWidth: "100%",
        }}
      >
        <PostTypeSelect value={postTypeFilter} onChange={onChangeFilter} />
        <SubmitQuestionCTA onOpenComposer={onOpenComposer} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 2,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          flex: "0 1 auto",
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <PostTypeSelect
          value={postTypeFilter}
          onChange={onChangeFilter}
          constrained
        />

        {!composerOpen ? (
          <SubmitQuestionCTA onOpenComposer={onOpenComposer} />
        ) : null}
      </div>
    </div>
  );
}