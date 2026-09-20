<template>
  <svg
    viewBox="0 0 1000 1600"
    preserveAspectRatio="none"
    aria-hidden="true"
    class="h-full w-full overflow-visible"
  >
    <defs>
      <pattern
        id="sqc-frame-horizontal"
        width="72"
        height="18"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M4 9 14 2l10 7-10 7Z M24 9 36 2l12 7-12 7Z M48 9 58 2l10 7-10 7Z"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1.8"
          vector-effect="non-scaling-stroke"
        />
        <circle
          cx="36"
          cy="9"
          r="2.4"
          fill="var(--sqc-poc-accent)"
        />
      </pattern>

      <pattern
        id="sqc-frame-vertical"
        width="18"
        height="72"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M9 4 16 14 9 24 2 14Z M9 24 16 36 9 48 2 36Z M9 48 16 58 9 68 2 58Z"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1.8"
          vector-effect="non-scaling-stroke"
        />
        <circle
          cx="9"
          cy="36"
          r="2.4"
          fill="var(--sqc-poc-accent)"
        />
      </pattern>

      <g id="sqc-frame-corner">
        <path
          d="M0 58C18 58 30 48 36 36C42 24 54 18 72 18"
          fill="none"
          stroke="var(--sqc-poc-accent-strong)"
          stroke-width="2.2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M10 46C22 44 30 36 34 26C38 18 46 12 58 10"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1.6"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M36 36 47 24 58 36 47 48Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent)"
          stroke-width="1.8"
          vector-effect="non-scaling-stroke"
        />
        <circle
          cx="47"
          cy="36"
          r="3.2"
          fill="var(--sqc-poc-accent-strong)"
        />
        <path
          d="M24 52 30 46 36 52 30 58Z M52 24 58 18 64 24 58 30Z"
          fill="var(--sqc-poc-accent)"
          opacity=".75"
        />
      </g>
    </defs>

    <rect
      x="14"
      y="14"
      width="972"
      height="1572"
      rx="24"
      fill="none"
      stroke="var(--sqc-poc-accent-strong)"
      stroke-width="2.1"
      vector-effect="non-scaling-stroke"
    />

    <rect
      x="24"
      y="24"
      width="952"
      height="1552"
      rx="19"
      fill="none"
      stroke="var(--sqc-poc-accent-border)"
      stroke-width="1.4"
      vector-effect="non-scaling-stroke"
    />

    <rect
      x="76"
      y="17"
      width="848"
      height="18"
      fill="url(#sqc-frame-horizontal)"
    />

    <rect
      x="76"
      y="1565"
      width="848"
      height="18"
      fill="url(#sqc-frame-horizontal)"
    />

    <rect
      x="17"
      y="76"
      width="18"
      height="1448"
      fill="url(#sqc-frame-vertical)"
    />

    <rect
      x="965"
      y="76"
      width="18"
      height="1448"
      fill="url(#sqc-frame-vertical)"
    />

    <g transform="translate(14 14)">
      <use href="#sqc-frame-corner" />
    </g>

    <g transform="translate(986 14) scale(-1 1)">
      <use href="#sqc-frame-corner" />
    </g>

    <g transform="translate(14 1586) scale(1 -1)">
      <use href="#sqc-frame-corner" />
    </g>

    <g transform="translate(986 1586) scale(-1 -1)">
      <use href="#sqc-frame-corner" />
    </g>

    <g transform="translate(500 26)">
      <path
        d="M-34 0-18-10 0 0 18-10 34 0 18 10 0 0-18 10Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.6"
        vector-effect="non-scaling-stroke"
      />
      <circle
        cx="0"
        cy="0"
        r="4"
        fill="var(--sqc-poc-accent-strong)"
      />
    </g>

    <g transform="translate(500 1574)">
      <path
        d="M-34 0-18-10 0 0 18-10 34 0 18 10 0 0-18 10Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.6"
        vector-effect="non-scaling-stroke"
      />
      <circle
        cx="0"
        cy="0"
        r="4"
        fill="var(--sqc-poc-accent-strong)"
      />
    </g>
  </svg>
</template>
