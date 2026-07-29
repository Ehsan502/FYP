const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 3C10.6 3 3 10.6 3 20C3 29.4 10.6 37 20 37C29.4 37 37 29.4 37 20"
      stroke="#00C2A8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M37 20C37 10.6 29.4 3 20 3" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />
    <path d="M31 9L37 3M37 3V9M37 3H31" stroke="#FFB020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 31L3 37M3 37V31M3 37H9" stroke="#00C2A8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Logo;
