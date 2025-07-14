import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useIsMobile } from '@/hooks/use-mobile';

interface VirtualizedListOptimizedProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  maxHeight?: number;
  className?: string;
  overscan?: number;
}

function VirtualizedListOptimized<T>({
  items,
  renderItem,
  itemHeight,
  maxHeight = 600,
  className = '',
  overscan = 5
}: VirtualizedListOptimizedProps<T>) {
  const isMobile = useIsMobile();
  const [containerHeight, setContainerHeight] = useState(maxHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust height based on available space
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 50; // 50px buffer
        setContainerHeight(Math.min(maxHeight, Math.max(300, availableHeight)));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [maxHeight]);

  // Memoize the list height calculation
  const listHeight = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    return Math.min(containerHeight, totalHeight);
  }, [items.length, itemHeight, containerHeight]);

  // Memoize the row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style} className="px-1">
        {renderItem(item, index)}
      </div>
    );
  }, [items, renderItem]);

  // Don't virtualize if we have few items or on mobile
  if (items.length < 10 || isMobile) {
    return (
      <div ref={containerRef} className={className}>
        {items.map((item, index) => (
          <div key={index} className="mb-2">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <List
        height={listHeight}
        width="100%"
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscan}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Row}
      </List>
    </div>
  );
}

export default memo(VirtualizedListOptimized) as typeof VirtualizedListOptimized;