import React from 'react';

export const RifleIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 10v2h-8L11 14H6l-2 4H2l2-4H2V10h4l2-2h6l2 2h6z" />
    <path d="M10 14v4h3v-4" />
    <path d="M14 10V8h2v2" />
  </svg>
);
