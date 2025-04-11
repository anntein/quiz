'use client';

import { FC, useEffect, useState } from 'react';

interface TimerProps {
  timeLimit: number;
  onTimeout: () => void;
  onTimeUpdate?: (timeLeft: number) => void;
}

const Timer: FC<TimerProps> = ({ timeLimit, onTimeout, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  // Reset timer when timeLimit changes
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const updateTimer = () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        const newTime = prev - 1;
        onTimeUpdate?.(newTime);
        return newTime;
      });
    };

    timer = setInterval(updateTimer, 1000);
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [onTimeout, onTimeUpdate]);
  
  return (
    <div className="text-center mb-4">
      <div className="text-2xl font-bold text-white">
        Time: {timeLeft}s
      </div>
    </div>
  );
};

export default Timer; 