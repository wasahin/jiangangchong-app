import { useState, useCallback } from 'react';

interface UseBlurControlOptions {
  defaultBlur?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface BlurControl {
  blur: number;
  setBlur: (value: number) => void;
  increment: () => void;
  decrement: () => void;
  setPreset: (preset: 'light' | 'medium' | 'heavy' | 'none') => void;
  min: number;
  max: number;
  step: number;
}

export function useBlurControl({
  defaultBlur = 16,
  min = 0,
  max = 48,
  step = 1
}: UseBlurControlOptions = {}): BlurControl {
  const [blur, setBlur] = useState(defaultBlur);

  const increment = useCallback(() => {
    setBlur((prev) => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setBlur((prev) => Math.max(prev - step, min));
  }, [step, min]);

  const setPreset = useCallback((preset: 'light' | 'medium' | 'heavy' | 'none') => {
    const presetValues = {
      light: 8,
      medium: 16,
      heavy: 24,
      none: 0,
    };
    setBlur(presetValues[preset]);
  }, []);

  return {
    blur,
    setBlur,
    increment,
    decrement,
    setPreset,
    min,
    max,
    step,
  };
}