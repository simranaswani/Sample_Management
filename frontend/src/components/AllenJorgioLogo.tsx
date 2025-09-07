import React from 'react';

interface AllenJorgioLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

const AllenJorgioLogo: React.FC<AllenJorgioLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showSubtitle = true 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg
        className={`${sizeClasses[size]}`}
        viewBox="0 0 220 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Allen Jorgio Logo Text with Elegant Script Font */}
        <text
          x="10"
          y="35"
          fontFamily="'Times New Roman', 'Times', serif"
          fontSize="32"
          fontWeight="400"
          fill="currentColor"
          className="text-gray-800"
          style={{
            letterSpacing: '0.5px',
            fontStyle: 'normal',
            fontVariant: 'small-caps'
          }}
        >
          Allen Jorgio
        </text>
        
        {/* Registered Trademark Symbol */}
        <circle cx="195" cy="15" r="5" fill="currentColor" className="text-gray-800" />
        <text
          x="195"
          y="18"
          fontFamily="Arial, sans-serif"
          fontSize="7"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ®
        </text>
      </svg>
      
    </div>
  );
};

export default AllenJorgioLogo;
