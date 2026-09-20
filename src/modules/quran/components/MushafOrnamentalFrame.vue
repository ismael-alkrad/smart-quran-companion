<template>
  <svg
    viewBox="0 0 460 1000"
    preserveAspectRatio="none"
    aria-hidden="true"
    class="h-full w-full overflow-visible"
  >
    <defs>
      <g id="sqc-corner-ornament">
        <path
          d="M0 58C18 57 31 50 38 39C45 28 56 21 72 19"
          fill="none"
          stroke="var(--sqc-poc-accent-strong)"
          stroke-width="1.55"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M7 48C20 47 29 41 34 32C40 23 49 18 61 17"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".95"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M30 37C38 27 48 24 58 27C51 32 48 39 49 47C42 42 36 39 30 37Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent)"
          stroke-width=".8"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M37 31 45 23 53 31 45 39Z"
          fill="var(--sqc-poc-accent)"
          opacity=".72"
        />

        <path
          d="M17 49C22 42 28 40 34 42C29 46 27 51 28 56C24 53 20 51 17 49Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".7"
          vector-effect="non-scaling-stroke"
        />

        <circle
          cx="45"
          cy="31"
          r="2.1"
          fill="var(--sqc-poc-accent-strong)"
        />
      </g>

      <g id="sqc-side-medallion">
        <path
          d="M0-20C8-13 11-7 8 0C11 7 8 13 0 20C-8 13-11 7-8 0C-11-7-8-13 0-20Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".9"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M0-10 5 0 0 10-5 0Z"
          fill="var(--sqc-poc-accent)"
          opacity=".72"
        />
        <circle
          cx="0"
          cy="0"
          r="1.8"
          fill="var(--sqc-poc-accent-strong)"
        />
      </g>

      <g id="sqc-center-rosette">
        <path
          d="M-31 0-21-6-11 0 0-9 11 0 21-6 31 0 21 6 11 0 0 9-11 0-21 6Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".85"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M-10 0 0-5 10 0 0 5Z"
          fill="var(--sqc-poc-accent)"
          opacity=".72"
        />
        <circle
          cx="0"
          cy="0"
          r="1.9"
          fill="var(--sqc-poc-accent-strong)"
        />
      </g>
    </defs>

    <!-- restrained double border -->
    <rect
      x="7"
      y="7"
      width="446"
      height="986"
      rx="11"
      fill="none"
      stroke="var(--sqc-poc-accent-strong)"
      stroke-width="1.45"
      vector-effect="non-scaling-stroke"
    />

    <rect
      x="13"
      y="13"
      width="434"
      height="974"
      rx="8"
      fill="none"
      stroke="var(--sqc-poc-accent-border)"
      stroke-width=".85"
      opacity=".95"
      vector-effect="non-scaling-stroke"
    />

    <!-- quiet inner guide lines -->
    <path
      d="M18 78V455 M18 545V922 M442 78V455 M442 545V922"
      fill="none"
      stroke="var(--sqc-poc-accent-border)"
      stroke-width=".6"
      opacity=".46"
      vector-effect="non-scaling-stroke"
    />

    <path
      d="M76 18H190 M270 18H384 M76 982H190 M270 982H384"
      fill="none"
      stroke="var(--sqc-poc-accent-border)"
      stroke-width=".6"
      opacity=".46"
      vector-effect="non-scaling-stroke"
    />

    <!-- corners -->
    <g transform="translate(7 7)">
      <use href="#sqc-corner-ornament" />
    </g>

    <g transform="translate(453 7) scale(-1 1)">
      <use href="#sqc-corner-ornament" />
    </g>

    <g transform="translate(7 993) scale(1 -1)">
      <use href="#sqc-corner-ornament" />
    </g>

    <g transform="translate(453 993) scale(-1 -1)">
      <use href="#sqc-corner-ornament" />
    </g>

    <!-- centered rosettes -->
    <g transform="translate(230 18)">
      <use href="#sqc-center-rosette" />
    </g>

    <g transform="translate(230 982)">
      <use href="#sqc-center-rosette" />
    </g>

    <!-- side medallions -->
    <g transform="translate(18 500)">
      <use href="#sqc-side-medallion" />
    </g>

    <g transform="translate(442 500)">
      <use href="#sqc-side-medallion" />
    </g>

    <!-- tiny leaf pairs around side medallions -->
    <g
      fill="var(--sqc-poc-accent-soft)"
      stroke="var(--sqc-poc-accent-border)"
      stroke-width=".7"
      vector-effect="non-scaling-stroke"
    >
      <path d="M18 466C25 461 30 461 34 465C29 466 26 470 25 475C22 471 20 468 18 466Z" />
      <path d="M18 534C25 539 30 539 34 535C29 534 26 530 25 525C22 529 20 532 18 534Z" />

      <path d="M442 466C435 461 430 461 426 465C431 466 434 470 435 475C438 471 440 468 442 466Z" />
      <path d="M442 534C435 539 430 539 426 535C431 534 434 530 435 525C438 529 440 532 442 534Z" />
    </g>
  </svg>
</template>
