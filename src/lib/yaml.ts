/**
 * Minimal JSON <-> YAML conversion (no dependencies).
 *
 * The serializer (jsonToYaml) emits standard block-style YAML and is reliable.
 * The parser (yamlToValue) supports the common block-style subset — mappings,
 * sequences, scalars (string/number/bool/null), and quoted strings — which
 * round-trips anything the serializer produces plus typical hand-written YAML.
 * It does not implement anchors, tags, or flow collections.
 */

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [k: string]: JsonValue };

// ----------------------------- Serialize -----------------------------

export function jsonToYaml(value: JsonValue): string {
  if (!isContainer(value)) return scalarToYaml(value) + "\n";
  const lines = isArray(value)
    ? arrayLines(value, 0)
    : objectLines(value, 0);
  return lines.join("\n") + "\n";
}

/** Renders an object's entries as indented YAML lines. */
function objectLines(
  obj: { [k: string]: JsonValue },
  indent: number,
): string[] {
  const pad = "  ".repeat(indent);
  const entries = Object.entries(obj);
  if (entries.length === 0) return [`${pad}{}`];

  const out: string[] = [];
  for (const [k, v] of entries) {
    const key = keyToYaml(k);
    if (isArray(v)) {
      if (v.length === 0) out.push(`${pad}${key}: []`);
      else {
        out.push(`${pad}${key}:`);
        out.push(...arrayLines(v, indent + 1));
      }
    } else if (isContainer(v)) {
      if (Object.keys(v).length === 0) out.push(`${pad}${key}: {}`);
      else {
        out.push(`${pad}${key}:`);
        out.push(...objectLines(v, indent + 1));
      }
    } else {
      out.push(`${pad}${key}: ${scalarToYaml(v)}`);
    }
  }
  return out;
}

/** Renders an array's items as indented YAML lines (each prefixed with "- "). */
function arrayLines(arr: JsonValue[], indent: number): string[] {
  const pad = "  ".repeat(indent);
  if (arr.length === 0) return [`${pad}[]`];

  const out: string[] = [];
  for (const item of arr) {
    if (isArray(item)) {
      if (item.length === 0) out.push(`${pad}- []`);
      else {
        out.push(`${pad}-`);
        out.push(...arrayLines(item, indent + 1));
      }
    } else if (isContainer(item)) {
      const inner = objectLines(item, indent + 1);
      // Hoist the first child onto the dash line; "${pad}- " is exactly the
      // width of one extra indent level, so alignment is preserved.
      const first = inner[0].slice((indent + 1) * 2);
      out.push(`${pad}- ${first}`);
      out.push(...inner.slice(1));
    } else {
      out.push(`${pad}- ${scalarToYaml(item)}`);
    }
  }
  return out;
}

function isContainer(
  v: JsonValue,
): v is JsonValue[] | { [k: string]: JsonValue } {
  return v !== null && typeof v === "object";
}

function isArray(v: JsonValue): v is JsonValue[] {
  return Array.isArray(v);
}

function keyToYaml(k: string): string {
  return needsQuote(k) ? JSON.stringify(k) : k;
}

function scalarToYaml(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "null";
  if (typeof v === "string") return needsQuote(v) ? JSON.stringify(v) : v;
  // Containers are handled by the callers; fall back to JSON for safety.
  return JSON.stringify(v);
}

function needsQuote(s: string): boolean {
  if (s === "") return true;
  if (s !== s.trim()) return true;
  if (/^(true|false|null|~|yes|no|on|off)$/i.test(s)) return true;
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return true;
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(s)) return true;
  if (/^[-?]/.test(s)) return true;
  return false;
}

// ------------------------------- Parse -------------------------------

interface Line {
  indent: number;
  content: string;
}

export function yamlToValue(yaml: string): JsonValue {
  const lines: Line[] = [];
  for (const raw of yaml.replace(/\r\n/g, "\n").split("\n")) {
    const stripped = stripComment(raw);
    if (stripped.trim() === "") continue;
    if (stripped.trim() === "---") continue;
    lines.push({ indent: countIndent(stripped), content: stripped.trim() });
  }
  if (lines.length === 0) return null;
  const [value] = parseBlock(lines, 0, lines[0].indent);
  return value;
}

function parseBlock(
  lines: Line[],
  start: number,
  indent: number,
): [JsonValue, number] {
  if (lines[start].content.startsWith("- ") || lines[start].content === "-") {
    return parseSequence(lines, start, indent);
  }
  return parseMapping(lines, start, indent);
}

function parseSequence(
  lines: Line[],
  start: number,
  indent: number,
): [JsonValue[], number] {
  const arr: JsonValue[] = [];
  let i = start;
  while (i < lines.length && lines[i].indent === indent) {
    const line = lines[i];
    if (!line.content.startsWith("-")) break;
    const rest = line.content.slice(1).trim();
    if (rest === "") {
      // Nested block belongs to this item.
      const [val, next] = parseBlock(lines, i + 1, lines[i + 1].indent);
      arr.push(val);
      i = next;
    } else if (looksLikeKey(rest)) {
      // Inline map item: "- key: value" — treat the rest as a mapping whose
      // first line sits at indent+2, plus deeper lines.
      const synthetic: Line[] = [{ indent: indent + 2, content: rest }];
      let j = i + 1;
      while (j < lines.length && lines[j].indent > indent) {
        synthetic.push(lines[j]);
        j++;
      }
      const [val] = parseMapping(synthetic, 0, indent + 2);
      arr.push(val);
      i = j;
    } else {
      arr.push(parseScalar(rest));
      i++;
    }
  }
  return [arr, i];
}

function parseMapping(
  lines: Line[],
  start: number,
  indent: number,
): [{ [k: string]: JsonValue }, number] {
  const obj: { [k: string]: JsonValue } = {};
  let i = start;
  while (i < lines.length && lines[i].indent === indent) {
    const { key, value } = splitKeyValue(lines[i].content);
    if (value === "") {
      // Value is a nested block on the following deeper lines.
      if (i + 1 < lines.length && lines[i + 1].indent > indent) {
        const [val, next] = parseBlock(lines, i + 1, lines[i + 1].indent);
        obj[key] = val;
        i = next;
      } else {
        obj[key] = null;
        i++;
      }
    } else {
      obj[key] = parseScalar(value);
      i++;
    }
  }
  return [obj, i];
}

function splitKeyValue(content: string): { key: string; value: string } {
  const idx = findColon(content);
  if (idx === -1) return { key: content, value: "" };
  const key = unquote(content.slice(0, idx).trim());
  const value = content.slice(idx + 1).trim();
  return { key, value };
}

/** Finds the key/value separating colon, ignoring colons inside quotes. */
function findColon(s: string): number {
  let q: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
    } else if (c === '"' || c === "'") {
      q = c;
    } else if (c === ":" && (i + 1 >= s.length || s[i + 1] === " ")) {
      return i;
    }
  }
  return -1;
}

function looksLikeKey(s: string): boolean {
  return findColon(s) !== -1;
}

function parseScalar(s: string): JsonValue {
  if (s === "" || s === "~" || s.toLowerCase() === "null") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return Number(s);
  if (s === "[]") return [];
  if (s === "{}") return {};
  return unquote(s);
}

function unquote(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    if (s[0] === '"') {
      try {
        return JSON.parse(s) as string;
      } catch {
        return s.slice(1, -1);
      }
    }
    return s.slice(1, -1).replace(/''/g, "'");
  }
  return s;
}

function stripComment(line: string): string {
  let q: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) q = null;
    } else if (c === '"' || c === "'") {
      q = c;
    } else if (c === "#" && (i === 0 || line[i - 1] === " " || line[i - 1] === "\t")) {
      return line.slice(0, i);
    }
  }
  return line;
}

function countIndent(line: string): number {
  let n = 0;
  while (n < line.length && line[n] === " ") n++;
  return n;
}
