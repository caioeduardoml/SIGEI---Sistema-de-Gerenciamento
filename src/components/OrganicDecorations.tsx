import React from 'react';

interface DecorProps {
  className?: string;
  color?: string;
}

// Seta desenhada a mao para conduzir o olhar ate o CTA
export const HandDrawnArrow: React.FC<DecorProps> = ({ color = '#287F78' }) => (
  <svg
    width="68"
    height="34"
    viewBox="0 0 68 34"
    fill="none"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <path
      d="M3 22C16 10 34 7 58 14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 0"
    />
    <path
      d="M49 6L61 15L47 22"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Estrela artesanal de quatro pontas
export const HandDrawnSparkle: React.FC<DecorProps & { size?: number }> = ({
  color = '#FFA000',
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16 3C16.8 10.5 21.5 15.2 29 16C21.5 16.8 16.8 21.5 16 29C15.2 21.5 10.5 16.8 3 16C10.5 15.2 15.2 10.5 16 3Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Pequeno raio artesanal em line art
export const HandDrawnBolt: React.FC<DecorProps> = ({ color = '#FFA000' }) => (
  <svg
    width="26"
    height="32"
    viewBox="0 0 26 32"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15 2L4 17H13L10 30L22 14H13L15 2Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
