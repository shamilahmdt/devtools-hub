import { useState, useMemo } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

const AVAILABLE_FLAGS = [
  { id: "g", label: "global", desc: "match all occurrences" },
  { id: "i", label: "ignore case", desc: "case-insensitive matching" },
  { id: "m", label: "multiline", desc: "^ and $ match start/end of line" },
  { id: "s", label: "dotall", desc: ". matches newline" },
  { id: "u", label: "unicode", desc: "treat pattern as a sequence of unicode code points" },
  { id: "y", label: "sticky", desc: "match only from index indicated by lastindex" },
];

const samplePattern = "([A-Z])\\w+";
const sampleString = `Hello World, this is a Regex Sandbox!
We can Match multiple Words that start with Capital letters.`;

export default function RegexSandbox() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<string[]>(["g"]);
  const [testString, setTestString] = useState("");

  const toggleFlag = (flagId: string) => {
    setFlags((prev) =>
      prev.includes(flagId) ? prev.filter((f) => f !== flagId) : [...prev, flagId]
    );
  };

  const loadSample = () => {
    setPattern(samplePattern);
    setTestString(sampleString);
    setFlags(["g"]);
  };

  const clear = () => {
    setPattern("");
    setTestString("");
  };

  const { matches, error, regexObj } = useMemo(() => {
    if (!pattern) return { matches: [], error: null, regexObj: null };

    try {
      const regex = new RegExp(pattern, flags.join(""));
      const foundMatches: RegExpExecArray[] = [];
      let match;
      let lastIndex = -1;

      if (regex.global) {
        while ((match = regex.exec(testString)) !== null) {
          // prevent infinite loop on zero-width matches
          if (match.index === lastIndex) {
            regex.lastIndex++;
          }
          lastIndex = match.index;
          foundMatches.push(match);
        }
      } else {
        match = regex.exec(testString);
        if (match) foundMatches.push(match);
      }

      return { matches: foundMatches, error: null, regexObj: regex };
    } catch (e: any) {
      return { matches: [], error: e.message as string, regexObj: null };
    }
  }, [pattern, flags, testString]);

  // build highlighted text parts
  const highlightedParts = useMemo(() => {
    if (!testString) return [];
    if (!matches.length || error) return [{ text: testString, isMatch: false }];

    const parts: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
    let currentIndex = 0;

    matches.forEach((match, index) => {
      const matchStart = match.index;
      const matchLength = match[0].length;

      if (matchStart > currentIndex) {
        parts.push({
          text: testString.slice(currentIndex, matchStart),
          isMatch: false,
        });
      }

      if (matchLength > 0) {
        parts.push({
          text: testString.slice(matchStart, matchStart + matchLength),
          isMatch: true,
          matchIndex: index,
        });
        currentIndex = matchStart + matchLength;
      }
    });

    if (currentIndex < testString.length) {
      parts.push({
        text: testString.slice(currentIndex),
        isMatch: false,
      });
    }

    return parts;
  }, [testString, matches, error]);

  const hasInput = pattern.length > 0 || testString.length > 0;

  return (
    <div className="space-y-6">
      {/* pattern input and flags */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <label className="text-sm text-secondary mb-2 block">Regular Expression</label>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted font-mono text-lg">
                /
              </span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="w-full rounded-lg border border-border bg-ground px-8 py-3 font-mono text-primary outline-none focus:border-accent/50 text-base"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted font-mono text-lg">
                /{flags.join("")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_FLAGS.map((flag) => (
                <button
                  key={flag.id}
                  onClick={() => toggleFlag(flag.id)}
                  title={flag.desc}
                  className={`flex size-10 items-center justify-center rounded-lg border font-mono text-sm transition-all ${
                    flags.includes(flag.id)
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-border bg-ground text-secondary hover:border-accent/50 hover:text-primary"
                  }`}
                >
                  {flag.id}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      </div>

      <ToolTextarea
        label="Test String"
        value={testString}
        onChange={setTestString}
        placeholder="Paste your test text here..."
        rows={8}
        rightLabel={<SampleButton onClick={loadSample} />}
      />

      {hasInput && (
        <ToolActions>
          <Button variant="secondary" onClick={clear}>
            clear
          </Button>
        </ToolActions>
      )}

      {/* results section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Matches ({matches.length})</h3>
        
        {/* highlighted text box */}
        <div className="rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words min-h-[6rem]">
          {!testString ? (
            <span className="text-muted">Test string is empty.</span>
          ) : highlightedParts.map((part, i) =>
            part.isMatch ? (
              <mark
                key={i}
                className={`rounded px-0.5 ${
                  part.matchIndex! % 2 === 0
                    ? "bg-accent/30 text-accent"
                    : "bg-warning/30 text-warning"
                }`}
              >
                {part.text}
              </mark>
            ) : (
              <span key={i} className="text-primary">
                {part.text}
              </span>
            )
          )}
        </div>

        {/* match details table */}
        {matches.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="grid grid-cols-12 border-b border-border bg-elevated text-sm font-semibold text-secondary">
              <div className="col-span-1 border-r border-border px-4 py-3 text-center">#</div>
              <div className="col-span-8 border-r border-border px-4 py-3">Match</div>
              <div className="col-span-3 px-4 py-3">Index</div>
            </div>
            <div className="max-h-[30rem] overflow-auto custom-scrollbar">
              {matches.map((match, i) => (
                <div key={i} className="grid grid-cols-12 border-b border-border last:border-b-0 text-sm">
                  <div className="col-span-1 border-r border-border px-4 py-3 text-center text-muted font-mono">
                    {i + 1}
                  </div>
                  <div className="col-span-8 border-r border-border px-4 py-3 space-y-2">
                    <div className="font-mono text-primary break-all">{match[0]}</div>
                    {match.length > 1 && (
                      <div className="pl-4 border-l-2 border-border/50 space-y-1 mt-2">
                        {Array.from(match).slice(1).map((group, groupIndex) => (
                          group !== undefined && (
                            <div key={groupIndex} className="flex gap-2 text-xs">
                              <span className="text-muted shrink-0">Group {groupIndex + 1}:</span>
                              <span className="font-mono text-secondary break-all">{group}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 px-4 py-3 font-mono text-muted flex items-start">
                    {match.index} - {match.index + match[0].length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
