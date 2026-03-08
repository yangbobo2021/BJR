// web/app/(site)/exegesis/[recordingId]/components/ExegesisRichComposer.tsx
"use client";

import React from "react";
import TipTapEditor from "../TipTapEditor";

type ExegesisRichComposerProps = {
  editorKey: string;
  valuePlain: string;
  valueDoc: unknown | null;
  disabled: boolean;
  showToolbar: boolean;
  autofocus?: boolean;
  placeholder: string;
  error?: string;
  posting: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  onChangePlain: (plain: string) => void;
  onChangeDoc: (doc: unknown | null) => void;
  onToggleToolbar: () => void;
  onSubmit: () => void;
};

export default function ExegesisRichComposer({
  editorKey,
  valuePlain,
  valueDoc,
  disabled,
  showToolbar,
  autofocus,
  placeholder,
  error,
  posting,
  submitLabel,
  submitDisabled,
  onChangePlain,
  onChangeDoc,
  onToggleToolbar,
  onSubmit,
}: ExegesisRichComposerProps) {
  const charCount = valuePlain.trim().length;
  const showCharWarning = charCount >= 4500;

  return (
    <>
      <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="[&_.tiptap-editor-shell]:rounded-none [&_.tiptap-editor-shell]:border-0 [&_.tiptap-editor-shell]:bg-transparent [&_.tiptap-editor-shell]:shadow-none [&_.tiptap-editor]:rounded-none [&_.tiptap-editor]:border-0 [&_.tiptap-editor]:bg-transparent [&_.tiptap-editor]:shadow-none [&_.tiptap-editor]:rounded-b-none">
          <TipTapEditor
            key={editorKey}
            valuePlain={valuePlain}
            valueDoc={valueDoc}
            disabled={disabled}
            showToolbar={showToolbar}
            autofocus={autofocus}
            placeholder={placeholder}
            onChangePlain={onChangePlain}
            onChangeDoc={onChangeDoc}
          />
        </div>

        <div className="flex items-stretch justify-between border-t border-white/10 bg-white/[0.03]">
          <button
            type="button"
            className="rounded-none rounded-bl-xl border-r border-white/10 bg-transparent px-3 py-2 text-xs hover:bg-white/5 disabled:opacity-40"
            disabled={disabled}
            onClick={onToggleToolbar}
            title={showToolbar ? "Hide formatting" : "Formatting"}
          >
            Aa
          </button>

          <div className="flex items-center gap-3 pl-3">
            {showCharWarning ? (
              <div className="text-xs opacity-70">{charCount}/5000</div>
            ) : null}

            <button
              className="rounded-none rounded-br-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-40"
              disabled={submitDisabled}
              onClick={onSubmit}
            >
              {posting ? `${submitLabel}…` : submitLabel}
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="mt-2 text-xs opacity-75">{error}</div> : null}
    </>
  );
}
