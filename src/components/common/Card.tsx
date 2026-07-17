import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false }) => {
  const classes = ['ui-card', glass ? 'glass-panel' : '', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
};
