import React, { memo, useMemo } from 'react';

interface VirtualizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  maxVisibleItems?: number;
  containerHeight?: string;
}

const VirtualizedList: React.FC<VirtualizedListProps> = memo(({
  items,
  renderItem,
  maxVisibleItems = 10,
  containerHeight = "400px"
}) => {
  const visibleItems = useMemo(() => {
    return items.slice(0, maxVisibleItems);
  }, [items, maxVisibleItems]);

  return (
    <div style={{ height: containerHeight, overflowY: 'auto' }}>
      {visibleItems.map((item, index) => (
        <div key={item.id || index}>
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

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;