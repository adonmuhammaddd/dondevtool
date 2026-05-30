import type { ComponentType } from "react";
import JsonFormatter from "@/components/tools/JsonFormatter";
import JsonYaml from "@/components/tools/JsonYaml";
import Base64Tool from "@/components/tools/Base64Tool";
import UrlTool from "@/components/tools/UrlTool";
import CaseTool from "@/components/tools/CaseTool";
import UuidTool from "@/components/tools/UuidTool";
import HashTool from "@/components/tools/HashTool";
import PasswordTool from "@/components/tools/PasswordTool";
import LoremTool from "@/components/tools/LoremTool";
import JwtTool from "@/components/tools/JwtTool";
import TimestampTool from "@/components/tools/TimestampTool";
import NumberBaseTool from "@/components/tools/NumberBaseTool";
import ColorTool from "@/components/tools/ColorTool";
import RegexTool from "@/components/tools/RegexTool";
import CronTool from "@/components/tools/CronTool";
import DiffTool from "@/components/tools/DiffTool";
import TextTool from "@/components/tools/TextTool";
import CryptoTool from "@/components/tools/CryptoTool";
import UrlInspectorTool from "@/components/tools/UrlInspectorTool";
import ContrastTool from "@/components/tools/ContrastTool";
import JsonDiffTool from "@/components/tools/JsonDiffTool";

export type Category =
  | "Formatter & converter"
  | "Generator"
  | "Decoder & inspector"
  | "Tester";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  /** Short monospace glyph shown in the nav / cards. */
  glyph: string;
  /** All tools are genuinely functional; flagged "live" in the UI. */
  live: boolean;
  Component: ComponentType;
}

export const CATEGORIES: Category[] = [
  "Formatter & converter",
  "Generator",
  "Decoder & inspector",
  "Tester",
];

/** Short path-style abbreviation per category (e.g. ~/fmt). */
export const CAT_ABBR: Record<Category, string> = {
  "Formatter & converter": "fmt",
  Generator: "gen",
  "Decoder & inspector": "dec",
  Tester: "test",
};

export const TOOLS: Tool[] = [
  // Formatter & converter
  { id: "json", name: "JSON Formatter", description: "Format, validate, or minify JSON", category: "Formatter & converter", glyph: "{ }", live: true, Component: JsonFormatter },
  { id: "json-yaml", name: "JSON ↔ YAML", description: "Convert between JSON and YAML", category: "Formatter & converter", glyph: "⇄", live: true, Component: JsonYaml },
  { id: "base64", name: "Base64", description: "Encode / decode Base64 (UTF-8 safe)", category: "Formatter & converter", glyph: "64", live: true, Component: Base64Tool },
  { id: "url", name: "URL Encode", description: "Encode / decode URI components", category: "Formatter & converter", glyph: "%", live: true, Component: UrlTool },
  { id: "case", name: "Case Converter", description: "camelCase, snake_case, kebab-case…", category: "Formatter & converter", glyph: "Aa", live: true, Component: CaseTool },
  { id: "text", name: "Text Toolkit", description: "Sort, dedupe, trim, count lines", category: "Formatter & converter", glyph: "Tt", live: true, Component: TextTool },
  // Generator
  { id: "uuid", name: "UUID", description: "Generate UUID v4", category: "Generator", glyph: "id", live: true, Component: UuidTool },
  { id: "hash", name: "Hash", description: "MD5, SHA-1, SHA-256, SHA-512", category: "Generator", glyph: "#", live: true, Component: HashTool },
  { id: "password", name: "Password", description: "Cryptographically random passwords", category: "Generator", glyph: "✦", live: true, Component: PasswordTool },
  { id: "lorem", name: "Lorem Ipsum", description: "Placeholder text generator", category: "Generator", glyph: "¶", live: true, Component: LoremTool },
  { id: "crypto", name: "HMAC / AES", description: "Sign & encrypt with Web Crypto", category: "Generator", glyph: "⚷", live: true, Component: CryptoTool },
  // Decoder & inspector
  { id: "jwt", name: "JWT Decoder", description: "Decode JWT header & payload", category: "Decoder & inspector", glyph: "⬡", live: true, Component: JwtTool },
  { id: "timestamp", name: "Timestamp", description: "Unix epoch ↔ human date", category: "Decoder & inspector", glyph: "◷", live: true, Component: TimestampTool },
  { id: "number-base", name: "Number Base", description: "Bin / oct / dec / hex converter", category: "Decoder & inspector", glyph: "0b", live: true, Component: NumberBaseTool },
  { id: "color", name: "Color Converter", description: "HEX ↔ RGB ↔ HSL", category: "Decoder & inspector", glyph: "◑", live: true, Component: ColorTool },
  { id: "contrast", name: "Contrast Checker", description: "WCAG AA/AAA contrast ratio", category: "Decoder & inspector", glyph: "◐", live: true, Component: ContrastTool },
  { id: "url-inspect", name: "URL Inspector", description: "Parse URL parts + query → JSON", category: "Decoder & inspector", glyph: "?=", live: true, Component: UrlInspectorTool },
  // Tester
  { id: "regex", name: "Regex Tester", description: "Live regex matching & groups", category: "Tester", glyph: ".*", live: true, Component: RegexTool },
  { id: "cron", name: "Cron Parser", description: "Preview next cron run times", category: "Tester", glyph: "⏲", live: true, Component: CronTool },
  { id: "diff", name: "Text Diff", description: "Line-by-line text comparison", category: "Tester", glyph: "±", live: true, Component: DiffTool },
  { id: "json-diff", name: "JSON Diff", description: "Structural object comparison", category: "Tester", glyph: "Δ", live: true, Component: JsonDiffTool },
];
