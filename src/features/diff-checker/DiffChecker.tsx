import { useMemo, useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

type DiffKind = "same" | "changed" | "added" | "removed";

type DiffRow = {
  kind: DiffKind;
  leftLine?: number;
  rightLine?: number;
  leftText: string;
  rightText: string;
};

type DiffOperation =
  | { type: "same"; leftLine: number; rightLine: number; text: string }
  | { type: "removed"; leftLine: number; text: string }
  | { type: "added"; rightLine: number; text: string };

const LCS_CELL_LIMIT = 180_000;

const leftSample = `function formatUser(user) {
  return {
    id: user.id,
    name: user.name.trim(),
    role: "member"
  };
}`;

const rightSample = `function formatUser(user) {
  return {
    id: user.id,
    name: user.displayName.trim(),
    active: true,
    role: "admin"
  };
}`;

function splitLines(value: string) {
  if (!value) {
    return [];
  }

  return value.replace(/\r\n?/g, "\n").split("\n");
}

function buildDiffRows(leftLines: string[], rightLines: string[]) {
  if (leftLines.length * rightLines.length > LCS_CELL_LIMIT) {
    return buildAlignedRows(leftLines, rightLines);
  }

  return coalesceOperations(buildLcsOperations(leftLines, rightLines));
}

function buildAlignedRows(leftLines: string[], rightLines: string[]): DiffRow[] {
  const rowCount = Math.max(leftLines.length, rightLines.length);
  const rows: DiffRow[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const hasLeft = index < leftLines.length;
    const hasRight = index < rightLines.length;
    const leftText = hasLeft ? leftLines[index] : "";
    const rightText = hasRight ? rightLines[index] : "";

    if (hasLeft && hasRight) {
      rows.push({
        kind: leftText === rightText ? "same" : "changed",
        leftLine: index + 1,
        rightLine: index + 1,
        leftText,
        rightText,
      });
    } else if (hasLeft) {
      rows.push({
        kind: "removed",
        leftLine: index + 1,
        leftText,
        rightText: "",
      });
    } else if (hasRight) {
      rows.push({
        kind: "added",
        rightLine: index + 1,
        leftText: "",
        rightText,
      });
    }
  }

  return rows;
}

function buildLcsOperations(
  leftLines: string[],
  rightLines: string[],
): DiffOperation[] {
  const rows = leftLines.length;
  const columns = rightLines.length;
  const matrix = Array.from(
    { length: rows + 1 },
    () => new Uint32Array(columns + 1),
  );

  for (let leftIndex = rows - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = columns - 1; rightIndex >= 0; rightIndex -= 1) {
      matrix[leftIndex][rightIndex] =
        leftLines[leftIndex] === rightLines[rightIndex]
          ? matrix[leftIndex + 1][rightIndex + 1] + 1
          : Math.max(
              matrix[leftIndex + 1][rightIndex],
              matrix[leftIndex][rightIndex + 1],
            );
    }
  }

  const operations: DiffOperation[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < rows && rightIndex < columns) {
    if (leftLines[leftIndex] === rightLines[rightIndex]) {
      operations.push({
        type: "same",
        leftLine: leftIndex + 1,
        rightLine: rightIndex + 1,
        text: leftLines[leftIndex],
      });
      leftIndex += 1;
      rightIndex += 1;
    } else if (
      matrix[leftIndex + 1][rightIndex] >= matrix[leftIndex][rightIndex + 1]
    ) {
      operations.push({
        type: "removed",
        leftLine: leftIndex + 1,
        text: leftLines[leftIndex],
      });
      leftIndex += 1;
    } else {
      operations.push({
        type: "added",
        rightLine: rightIndex + 1,
        text: rightLines[rightIndex],
      });
      rightIndex += 1;
    }
  }

  while (leftIndex < rows) {
    operations.push({
      type: "removed",
      leftLine: leftIndex + 1,
      text: leftLines[leftIndex],
    });
    leftIndex += 1;
  }

  while (rightIndex < columns) {
    operations.push({
      type: "added",
      rightLine: rightIndex + 1,
      text: rightLines[rightIndex],
    });
    rightIndex += 1;
  }

  return operations;
}

function coalesceOperations(operations: DiffOperation[]) {
  const rows: DiffRow[] = [];
  let index = 0;

  while (index < operations.length) {
    const operation = operations[index];

    if (operation.type === "same") {
      rows.push({
        kind: "same",
        leftLine: operation.leftLine,
        rightLine: operation.rightLine,
        leftText: operation.text,
        rightText: operation.text,
      });
      index += 1;
      continue;
    }

    const removed: Extract<DiffOperation, { type: "removed" }>[] = [];
    const added: Extract<DiffOperation, { type: "added" }>[] = [];

    while (operations[index]?.type === "removed") {
      removed.push(operations[index] as Extract<DiffOperation, { type: "removed" }>);
      index += 1;
    }

    while (operations[index]?.type === "added") {
      added.push(operations[index] as Extract<DiffOperation, { type: "added" }>);
      index += 1;
    }

    const changedCount = Math.min(removed.length, added.length);

    for (let pairIndex = 0; pairIndex < changedCount; pairIndex += 1) {
      rows.push({
        kind: "changed",
        leftLine: removed[pairIndex].leftLine,
        rightLine: added[pairIndex].rightLine,
        leftText: removed[pairIndex].text,
        rightText: added[pairIndex].text,
      });
    }

    for (let removedIndex = changedCount; removedIndex < removed.length; removedIndex += 1) {
      rows.push({
        kind: "removed",
        leftLine: removed[removedIndex].leftLine,
        leftText: removed[removedIndex].text,
        rightText: "",
      });
    }

    for (let addedIndex = changedCount; addedIndex < added.length; addedIndex += 1) {
      rows.push({
        kind: "added",
        rightLine: added[addedIndex].rightLine,
        leftText: "",
        rightText: added[addedIndex].text,
      });
    }
  }

  return rows;
}

function getStats(rows: DiffRow[]) {
  return rows.reduce(
    (stats, row) => {
      if (row.kind !== "same") {
        stats[row.kind] += 1;
      }

      return stats;
    },
    {
      added: 0,
      removed: 0,
      changed: 0,
    },
  );
}

function getCellClass(row: DiffRow, side: "left" | "right") {
  if (row.kind === "added" && side === "right") {
    return "border-success-border bg-success-bg text-success";
  }

  if (row.kind === "removed" && side === "left") {
    return "border-danger-border bg-danger-bg text-danger";
  }

  if (row.kind === "changed") {
    return side === "left"
      ? "border-warning-border bg-warning-bg text-warning"
      : "border-accent/20 bg-accent-bg text-accent";
  }

  return "border-border bg-ground/30 text-secondary";
}

function DiffCell({
  row,
  side,
}: {
  row: DiffRow;
  side: "left" | "right";
}) {
  const lineNumber = side === "left" ? row.leftLine : row.rightLine;
  const text = side === "left" ? row.leftText : row.rightText;

  return (
    <div
      className={`grid min-h-10 grid-cols-[4rem_1fr] border-b md:border-b-0 ${getCellClass(row, side)}`}
    >
      <div className="select-none border-r border-inherit px-3 py-2 text-right font-mono text-xs text-muted">
        {lineNumber ?? ""}
      </div>
      <pre className="custom-scrollbar overflow-x-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-xs leading-5">
        {text || " "}
      </pre>
    </div>
  );
}

export default function DiffChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const leftLines = useMemo(() => splitLines(left), [left]);
  const rightLines = useMemo(() => splitLines(right), [right]);
  const rows = useMemo(() => buildDiffRows(leftLines, rightLines), [leftLines, rightLines]);
  const stats = useMemo(() => getStats(rows), [rows]);
  const hasInput = left.trim().length > 0 || right.trim().length > 0;
  const totalChanges = stats.added + stats.removed + stats.changed;

  function loadSample() {
    setLeft(leftSample);
    setRight(rightSample);
  }

  function clear() {
    setLeft("");
    setRight("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ToolTextarea
          label="Original"
          value={left}
          onChange={setLeft}
          placeholder="Paste original text"
          rows={14}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label="Changed"
          value={right}
          onChange={setRight}
          placeholder="Paste changed text"
          rows={14}
        />
      </div>

      {hasInput && (
        <ToolActions>
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        </ToolActions>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase text-muted">Rows</div>
          <div className="mt-1 text-2xl font-semibold text-primary">{rows.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase text-muted">Added</div>
          <div className="mt-1 text-2xl font-semibold text-success">{stats.added}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase text-muted">Removed</div>
          <div className="mt-1 text-2xl font-semibold text-danger">{stats.removed}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase text-muted">Changed</div>
          <div className="mt-1 text-2xl font-semibold text-warning">{stats.changed}</div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid border-b border-border bg-elevated text-sm font-semibold text-secondary md:grid-cols-2">
          <div className="border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            Original
          </div>
          <div className="px-4 py-3">Changed</div>
        </div>

        {hasInput ? (
          <div className="max-h-[38rem] overflow-auto custom-scrollbar">
            {rows.map((row, index) => (
              <div
                key={`${row.kind}-${row.leftLine ?? "x"}-${row.rightLine ?? "x"}-${index}`}
                className="grid border-b border-border last:border-b-0 md:grid-cols-2"
              >
                <DiffCell row={row} side="left" />
                <DiffCell row={row} side="right" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted">
            Paste text into either panel to compare.
          </div>
        )}
      </section>

      {hasInput && totalChanges === 0 && (
        <p className="text-center text-sm text-success">
          No differences found.
        </p>
      )}
    </div>
  );
}
