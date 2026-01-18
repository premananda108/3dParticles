import { createContext, useContext } from 'react';

export const DragContext = createContext({
    isDragging: false,
    setIsDragging: () => { },
    gizmoHoveredRef: { current: false }
});

export function useDragContext() {
    return useContext(DragContext);
}
