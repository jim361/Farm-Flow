import type { Edge, Node } from "@xyflow/react";

export type SavedUserWorkflow = {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
};
