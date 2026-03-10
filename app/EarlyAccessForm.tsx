// web/app/EarlyAccessForm.tsx
"use client";

import React, { useMemo, useState } from "react";

type SubmitState = "idle" | "loading" | "ok" | "err";

export default function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");

  const emailIsValid = useMemo(() => {
    const value = email.trim();
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [email]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailIsValid || status === "loading") {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          company: "",
        }),
      });

      if (response.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  }

  const statusColor =
    status === "ok"
      ? "rgba(180,255,212,0.88)"
      : status === "err"
        ? "rgba(255,202,162,0.92)"
        : "rgba(255,255,255,0.60)";

  return (
    <>
      <style>{`
        .afEarlyAccessRoot {
          width: min(100%, 520px);
          margin-top: 18px;
          display: grid;
          gap: 10px;
        }

        .afEarlyAccessForm {
          width: 100%;
          display: grid;
          gap: 0;
        }

        .afEarlyAccessFieldset {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%);
          box-shadow:
            0 24px 56px rgba(0,0,0,0.26),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .afEarlyAccessInputWrap {
          min-width: 0;
          display: flex;
          align-items: center;
          padding: 0 10px 0 14px;
        }

        .afEarlyAccessInput {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: rgba(255,255,255,0.92);
          font-size: 12px;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        .afEarlyAccessInput::placeholder {
          color: rgba(255,255,255,0.42);
        }

        .afEarlyAccessButton {
          position: relative;
          min-width: 140px;
          height: 32px;
          padding: 0 18px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.92);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow:
            0 16px 34px rgba(0,0,0,0.22),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transition:
            transform 160ms ease,
            background 160ms ease,
            border-color 160ms ease,
            opacity 160ms ease,
            filter 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .afEarlyAccessButton:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.20);
          filter: brightness(1.03);
        }

        .afEarlyAccessButton:active:not(:disabled) {
          transform: translateY(0) scale(0.985);
        }

        .afEarlyAccessButton:disabled {
          cursor: default;
          opacity: 0.56;
        }

        .afEarlyAccessButton:focus-visible,
        .afEarlyAccessInput:focus-visible {
          outline: none;
        }

        .afEarlyAccessFieldset:has(.afEarlyAccessInput:focus-visible) {
          border-color: rgba(255,255,255,0.18);
          box-shadow:
            0 24px 56px rgba(0,0,0,0.26),
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 0 0 3px rgba(255,255,255,0.08);
        }

        .afEarlyAccessStatus {
          min-height: 18px;
          font-size: 13px;
          line-height: 1.4;
          text-align: center;
        }

        @media (max-width: 640px) {
          .afEarlyAccessFieldset {
            grid-template-columns: 1fr;
            border-radius: 24px;
            padding: 12px;
          }

          .afEarlyAccessInputWrap {
            padding: 2px 8px 0 10px;
          }

          .afEarlyAccessButton {
            width: 100%;
            min-width: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .afEarlyAccessButton {
            transition: none !important;
          }
        }
      `}</style>

      <div className="afEarlyAccessRoot">
        <form className="afEarlyAccessForm" onSubmit={onSubmit} noValidate>
          <div className="afEarlyAccessFieldset">
            <div className="afEarlyAccessInputWrap">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@domain.com"
                required
                aria-label="Email address"
                className="afEarlyAccessInput"
                disabled={status === "loading"}
              />
            </div>

            <button
              type="submit"
              disabled={!emailIsValid || status === "loading"}
              className="afEarlyAccessButton"
            >
              {status === "loading" ? "Submitting…" : "Request early access"}
            </button>
          </div>
        </form>

        <div
          className="afEarlyAccessStatus"
          role="status"
          aria-live="polite"
          style={{ color: statusColor }}
        >
          {status === "ok"
            ? "You’re on the list."
            : status === "err"
              ? "Something went wrong. Try again."
              : ""}
        </div>
      </div>
    </>
  );
}