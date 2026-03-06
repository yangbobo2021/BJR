import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  embed?: boolean;
  maxWidth?: number;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminPageFrame(props: Props) {
  const {
    title,
    subtitle,
    embed = false,
    maxWidth = 1120,
    headerActions,
    children,
  } = props;

  const outerStyle: React.CSSProperties = {
    padding: embed ? 16 : 24,
    maxWidth: embed ? undefined : maxWidth,
    margin: embed ? undefined : "0 auto",
  };

  return (
    <div style={outerStyle}>
      <div
        style={{
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 0.56,
                  userSelect: "none",
                }}
              >
                Admin
              </div>
              <h1
                style={{
                  margin: "6px 0 0",
                  fontSize: 22,
                  lineHeight: 1.15,
                  fontWeight: 700,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    lineHeight: 1.5,
                    opacity: 0.72,
                    maxWidth: 760,
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>

            {headerActions ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {headerActions}
              </div>
            ) : null}
          </div>
        </div>

        <div>{children}</div>
      </div>

      {embed ? (
        <style>{`
          html, body { background: transparent !important; }
        `}</style>
      ) : null}
    </div>
  );
}