import React from 'react';
type ClaraLogoProps = {
  size?: number;
  className?: string;
};
export function ClaraLogo({ size = 24, className = '' }: ClaraLogoProps) {
  return (
    <img
      src="/clara-code-logo-2d.png"
      alt="Clara Code"
      width={size}
      height={size}
      className={`object-contain ${className}`} />);


}