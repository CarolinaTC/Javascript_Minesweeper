export function GameFace({ status }) {
  return (
    <svg className="game-face" viewBox="0 0 40 40" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="var(--accent)"
        stroke="var(--on-accent)"
        strokeWidth="2"
      />
      <g
        fill="none"
        stroke="var(--on-accent)"
        strokeWidth="2.5"
        strokeLinecap="square"
      >
        {status === 'lost' ? (
          <path d="m11 12 5 5m-5 0 5-5m8 0 5 5m-5 0 5-5M13 29v-4h14v4" />
        ) : status === 'won' ? (
          <>
            <path d="M9 13h22m-20 0v6h6v-6m6 0v6h6v-6M13 25l4 4h6l4-4" />
            <path d="M11 15h6m6 0h6" strokeWidth="4" />
          </>
        ) : (
          <>
            <path d="M13 13v4m14-4v4" />
            <path
              d={status === 'playing' ? 'M17 26v-4h6v4Z' : 'M12 24l4 4h8l4-4'}
            />
          </>
        )}
      </g>
    </svg>
  );
}
