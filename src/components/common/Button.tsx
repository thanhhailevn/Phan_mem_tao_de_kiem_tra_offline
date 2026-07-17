import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  className = '',
  disabled,
  ...props
}) => {
  const classes = ['ui-btn', `ui-btn-${variant}`, `ui-btn-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button 
      className={classes} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" />
      ) : leftIcon ? (
        <span className="ui-btn-icon">{leftIcon}</span>
      ) : null}
      <span className="ui-btn-content">{children}</span>
    </button>
  );
};
