/** Line-oriented text transformations + counting for the Text Toolkit. */

export type TextOp =
  | "sort-asc"
  | "sort-desc"
  | "dedupe"
  | "reverse"
  | "trim"
  | "remove-blank"
  | "join"
  | "upper"
  | "lower";

export const TEXT_OPS: { op: TextOp; label: string }[] = [
  { op: "sort-asc", label: "sort A→Z" },
  { op: "sort-desc", label: "sort Z→A" },
  { op: "dedupe", label: "dedupe" },
  { op: "reverse", label: "reverse" },
  { op: "trim", label: "trim lines" },
  { op: "remove-blank", label: "rm blank" },
  { op: "join", label: "join lines" },
  { op: "upper", label: "UPPER" },
  { op: "lower", label: "lower" },
];

const splitLines = (s: string) => s.replace(/\r\n/g, "\n").split("\n");

export function applyTextOp(input: string, op: TextOp): string {
  const lines = splitLines(input);
  switch (op) {
    case "sort-asc":
      return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    case "sort-desc":
      return [...lines].sort((a, b) => b.localeCompare(a)).join("\n");
    case "dedupe": {
      const seen = new Set<string>();
      return lines.filter((l) => (seen.has(l) ? false : seen.add(l))).join("\n");
    }
    case "reverse":
      return [...lines].reverse().join("\n");
    case "trim":
      return lines.map((l) => l.trim()).join("\n");
    case "remove-blank":
      return lines.filter((l) => l.trim() !== "").join("\n");
    case "join":
      return lines.filter((l) => l !== "").join(" ");
    case "upper":
      return input.toUpperCase();
    case "lower":
      return input.toLowerCase();
  }
}

export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  bytes: number;
}

export function textStats(input: string): TextStats {
  return {
    chars: [...input].length,
    charsNoSpaces: [...input.replace(/\s/g, "")].length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input === "" ? 0 : splitLines(input).length,
    bytes: new TextEncoder().encode(input).length,
  };
}
