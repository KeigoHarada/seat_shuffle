import { create } from "zustand";

export interface ContextMenuState {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
}

export interface PopoverPos {
  x: number;
  y: number;
}

interface CanvasOverlayState {
  contextMenu: ContextMenuState | null;
  assignPopoverSeatId: string | null;
  popoverPos: PopoverPos;
  showGroupPopover: boolean;
  groupPopoverPos: PopoverPos;

  openContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;
  openSeatAssignPopover: (seatId: string, pos: PopoverPos) => void;
  closeSeatAssignPopover: () => void;
  openGroupAssignPopover: (pos: PopoverPos) => void;
  closeGroupAssignPopover: () => void;
  closeAllOverlays: () => void;
}

export const useCanvasOverlayStore = create<CanvasOverlayState>((set) => ({
  contextMenu: null,
  assignPopoverSeatId: null,
  popoverPos: { x: 0, y: 0 },
  showGroupPopover: false,
  groupPopoverPos: { x: 0, y: 0 },

  openContextMenu: (contextMenu) =>
    set({
      contextMenu,
      assignPopoverSeatId: null,
      showGroupPopover: false,
    }),
  closeContextMenu: () => set({ contextMenu: null }),

  openSeatAssignPopover: (seatId, popoverPos) =>
    set({
      assignPopoverSeatId: seatId,
      popoverPos,
      contextMenu: null,
      showGroupPopover: false,
    }),
  closeSeatAssignPopover: () => set({ assignPopoverSeatId: null }),

  openGroupAssignPopover: (groupPopoverPos) =>
    set({
      showGroupPopover: true,
      groupPopoverPos,
      contextMenu: null,
      assignPopoverSeatId: null,
    }),
  closeGroupAssignPopover: () => set({ showGroupPopover: false }),

  closeAllOverlays: () =>
    set({
      contextMenu: null,
      assignPopoverSeatId: null,
      showGroupPopover: false,
    }),
}));
