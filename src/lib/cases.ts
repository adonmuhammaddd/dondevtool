/** Case-conversion helpers. All operate on arbitrary input strings. */

/** Splits a string into lowercase word tokens across common separators. */
export function toWords(input: string): string[] {
  return (
    input
      // split camelCase / PascalCase boundaries
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // separators -> space
      .replace(/[_\-./\\]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.toLowerCase())
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export const cases = {
  camel: (s: string) =>
    toWords(s)
      .map((w, i) => (i === 0 ? w : cap(w)))
      .join(""),
  pascal: (s: string) => toWords(s).map(cap).join(""),
  snake: (s: string) => toWords(s).join("_"),
  constant: (s: string) => toWords(s).join("_").toUpperCase(),
  kebab: (s: string) => toWords(s).join("-"),
  title: (s: string) => toWords(s).map(cap).join(" "),
  sentence: (s: string) => {
    const w = toWords(s);
    return w.length ? cap(w[0]) + (w.length > 1 ? " " + w.slice(1).join(" ") : "") : "";
  },
  lower: (s: string) => toWords(s).join(" "),
  upper: (s: string) => toWords(s).join(" ").toUpperCase(),
} satisfies Record<string, (s: string) => string>;

export type CaseName = keyof typeof cases;

export const CASE_LABELS: Record<CaseName, string> = {
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  constant: "CONSTANT_CASE",
  kebab: "kebab-case",
  title: "Title Case",
  sentence: "Sentence case",
  lower: "lower case",
  upper: "UPPER CASE",
};
