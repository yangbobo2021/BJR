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
          width: min(100%, 1040px);
          margin-top: 18px;
          display: grid;
          gap: 10px;
        }

        .afEarlyAccessForm {
          width: 100%;
          display: grid;
          gap: 0;
        }

        .afEarlyAccessRow {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: stretch;
        }

        .afEarlyAccessInputShell {
          min-width: 0;
          display: flex;
          align-items: center;
          min-height: 72px;
          padding: 0 22px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%);
          box-shadow:
            0 24px 56px rgba(0,0,0,0.26),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        .afEarlyAccessInputShell:focus-within {
          border-color: rgba(255,255,255,0.18);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.03) 100%);
          box-shadow:
            0 24px 56px rgba(0,0,0,0.26),
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 0 0 3px rgba(255,255,255,0.06);
        }

        .afEarlyAccessInput {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: rgba(255,255,255,0.92);
          font-size: clamp(18px, 2vw, 20px);
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .afEarlyAccessInput::placeholder {
          color: rgba(255,255,255,0.38);
        }

        .afEarlyAccessButton {
          min-width: 320px;
          min-height: 72px;
          padding: 0 28px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%);
          color: rgba(255,255,255,0.92);
          font-size: clamp(16px, 1.8vw, 18px);
          font-weight: 650;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow:
            0 24px 56px rgba(0,0,0,0.26),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transition:
            background 160ms ease,
            border-color 160ms ease,
            opacity 160ms ease,
            filter 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .afEarlyAccessButton:hover:not(:disabled) {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.06) 100%);
          border-color: rgba(255,255,255,0.20);
          filter: brightness(1.03);
        }

        .afEarlyAccessButton:disabled {
          cursor: default;
          opacity: 0.56;
        }

        .afEarlyAccessButton:focus-visible,
        .afEarlyAccessInput:focus-visible {
          outline: none;
        }

        .afEarlyAccessStatus {
          min-height: 18px;
          font-size: 13px;
          line-height: 1.4;
          text-align: center;
        }

        @media (max-width: 820px) {
          .afEarlyAccessRow {
            grid-template-columns: 1fr;
          }

          .afEarlyAccessInputShell,
          .afEarlyAccessButton {
            min-height: 64px;
          }

          .afEarlyAccessButton {
            min-width: 0;
            width: 100%;
          }

          .afEarlyAccessInput {
            font-size: 17px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .afEarlyAccessInputShell,
          .afEarlyAccessButton {
            transition: none !important;
          }
        }
      `}</style>

      <div className="afEarlyAccessRoot">
        <form className="afEarlyAccessForm" onSubmit={onSubmit} noValidate>
          <div className="afEarlyAccessRow">
            <div className="afEarlyAccessInputShell">
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