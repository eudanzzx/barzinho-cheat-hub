import React, { memo, useMemo, useCallback, useState } from 'react';

interface VirtualizedListOptimizedProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  maxVisibleItems?: number;
  itemHeight?: number;
  containerHeight?: string;
}

const VirtualizedListOptimized: React.FC<VirtualizedListOptimizedProps> = memo(({
  items,
  renderItem,
  maxVisibleItems = 10,
  itemHeight = 120,
  containerHeight = "400px"
}) => {
  // Simplificar virtualização para melhor performance
  const visibleItems = useMemo(() => {
    return items.slice(0, maxVisibleItems);
  }, [items, maxVisibleItems]);

  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const
  }), [containerHeight]);

  return (
    <div style={containerStyle}>
      {visibleItems.map((item, index) => (
        <div key={item.id || index} style={{ minHeight: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
      {items.length > maxVisibleItems && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Mostrando {visibleItems.length} de {items.length} itens
        </div>
      )}
    </div>
  );
});

VirtualizedListOptimized.displayName = 'VirtualizedListOptimized';

export default VirtualizedListOptimized;