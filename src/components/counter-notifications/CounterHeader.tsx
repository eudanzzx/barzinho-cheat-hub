
import React from 'react';
import { Clock } from 'lucide-react';

interface CounterHeaderProps {
  notificationCount: number;
}

const CounterHeader: React.FC<CounterHeaderProps> = ({ notificationCount }) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Clock className="h-5 w-5 text-purple-600" />
      <h3 className="text-lg font-semibold text-purple-800">
        Contadores Ativos ({notificationCount})
      </h3>
    </div>
  );
};

export default CounterHeader;
