import { createContext, useContext } from 'react';

export const DragContext = createContext({
    isDragging: false,
    setIsDragging: () => { }
});

export function useDragContext() {
    return useContext(DragContext);
}
