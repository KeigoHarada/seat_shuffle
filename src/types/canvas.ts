export interface CanvasObject {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
}
