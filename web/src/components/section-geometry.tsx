/**
 * Decorative geometry for airy sections.
 *
 * Mirrors the reference site's treatment: solid, filled brand shapes — cropped
 * quarter circles, soft blobs and dot grids — rather than thin outlines, which
 * read as stray line-art at low opacity.
 *
 * Purely presentational: no text, no interaction, hidden from assistive tech.
 */

function Quarter() {
  return <path d="M0 0 H100 A100 100 0 0 1 0 100 Z" fill="currentColor" />;
}

function Blob() {
  return (
    <path
      d="M50 2c26 0 48 18 48 44 0 30-22 52-50 52S0 78 0 48C0 20 24 2 50 2Z"
      fill="currentColor"
    />
  );
}

/** A cropped ring — reads as a donut when the outer disc is subtracted. */
function RingBlock() {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill="currentColor" />
      <circle cx="50" cy="50" r="30" fill="white" opacity="0.92" />
    </>
  );
}

function Dots({ dense = false }: { dense?: boolean }) {
  const cols = dense ? 7 : 5;
  const step = 100 / (cols + 1);
  const count = dense ? 49 : 25;

  return (
    <g fill="currentColor">
      {Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <circle
            key={i}
            cx={step * (col + 1)}
            cy={step * (row + 1)}
            r={dense ? 1.6 : 2.2}
          />
        );
      })}
    </g>
  );
}

const SHAPES = {
  quarter: Quarter,
  blob: Blob,
  dots: () => <Dots />,
  dotsDense: () => <Dots dense />,
  ringBlock: RingBlock,
} satisfies Record<string, () => React.JSX.Element>;

export type ShapeName = keyof typeof SHAPES;

export function SectionGeometry({
  shape = "quarter",
  className = "",
  size = 240,
}: {
  shape?: ShapeName;
  className?: string;
  size?: number;
}) {
  const Shape = SHAPES[shape];

  return (
    <div
      aria-hidden="true"
      // pointer-events-none keeps decoration clear of the content layered over it.
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
        <Shape />
      </svg>
    </div>
  );
}