export type GridTemplatePreset = {
  name: string;
  columns: string;
  rows?: string;
  description: string;
};

export const gridTemplatePresets: GridTemplatePreset[] = [
  {
    name: "Equal thirds",
    columns: "repeat(3, minmax(0, 1fr))",
    description: "Classic three-column layout",
  },
  {
    name: "Sidebar",
    columns: "240px 1fr",
    description: "Fixed sidebar with flexible content",
  },
  {
    name: "Feature grid",
    columns: "repeat(auto-fit, minmax(220px, 1fr))",
    description: "Responsive card layout",
  },
  {
    name: "Article",
    columns: "minmax(0, 3fr) minmax(0, 1fr)",
    description: "Content with aside",
  },
];

export function parseTemplateInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "1fr";
  }
  return trimmed;
}

