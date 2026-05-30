/** Line-based text diff via longest-common-subsequence. */

export type DiffType = "eq" | "add" | "del";

export interface DiffLine {
  type: DiffType;
  text: string;
  /** 1-based line number in the original (left) text, or null for additions. */
  leftNo: number | null;
  /** 1-based line number in the new (right) text, or null for deletions. */
  rightNo: number | null;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

/**
 * Computes a line diff between `left` and `right`.
 * Returns an ordered list of lines tagged eq/add/del.
 */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = splitLines(left);
  const b = splitLines(right);
  const m = a.length;
  const n = b.length;

  // LCS length table.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNo = 1;
  let rightNo = 1;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ type: "eq", text: a[i], leftNo: leftNo++, rightNo: rightNo++ });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: a[i], leftNo: leftNo++, rightNo: null });
      i++;
    } else {
      out.push({ type: "add", text: b[j], leftNo: null, rightNo: rightNo++ });
      j++;
    }
  }
  while (i < m)
    out.push({ type: "del", text: a[i++], leftNo: leftNo++, rightNo: null });
  while (j < n)
    out.push({ type: "add", text: b[j++], leftNo: null, rightNo: rightNo++ });

  return out;
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return lines.reduce<DiffStats>(
    (acc, l) => {
      if (l.type === "add") acc.added++;
      else if (l.type === "del") acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}

function splitLines(s: string): string[] {
  if (s === "") return [];
  return s.replace(/\r\n/g, "\n").split("\n");
}
