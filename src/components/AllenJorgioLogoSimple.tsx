import React from 'react';

interface AllenJorgioLogoSimpleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const AllenJorgioLogoSimple: React.FC<AllenJorgioLogoSimpleProps> = ({ 
  className = '', 
  size = 'md',
  color = 'text-gray-800'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`${className}`}>
      <div className={`font-serif font-medium ${sizeClasses[size]} ${color} italic`}>
        Allen Jorgio
        <span className="text-xs ml-1">®</span>
      </div>
    </div>
  );
};

export default AllenJorgioLogoSimple;
