'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export default function ScoreCell({ value, max, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setInputValue(value === 0 ? '' : String(value));
  };

  const commit = () => {
    const num = parseInt(inputValue) || 0;
    const clamped = Math.min(Math.max(num, 0), max);
    onChange(clamped);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      commit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={max}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full h-full text-center border-0 bg-blue-50 font-medium text-foreground outline-none p-0 m-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-blue-50 font-medium text-foreground min-h-[28px]"
    >
      {value || ''}
    </div>
  );
}
