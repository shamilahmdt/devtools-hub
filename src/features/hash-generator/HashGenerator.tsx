import { useState, useEffect } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [isLive, setIsLive] = useState(true);
  const [isHmac, setIsHmac] = useState(false);
  const [secretKey, setSecretKey] = useState("");

  const algorithms: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  async function generateHash(text: string, algo: Algorithm, hmacMode: boolean, key: string) {
    if (!text) {
      setOutput("");
      return;
    }

    try {
      const msgUint8 = new TextEncoder().encode(text);
      let hashBuffer: ArrayBuffer;

      if (hmacMode) {
        if (!key) {
          setOutput("Secret key required for HMAC");
          return;
        }
        const keyUint8 = new TextEncoder().encode(key);
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyUint8,
          { name: "HMAC", hash: { name: algo } },
          false,
          ["sign"]
        );
        hashBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgUint8);
      } else {
        hashBuffer = await crypto.subtle.digest(algo, msgUint8);
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setOutput(hashHex);
    } catch (err) {
      console.error("Hashing failed:", err);
      setOutput("Error generating hash");
    }
  }

  useEffect(() => {
    if (isLive) {
      generateHash(input, algorithm, isHmac, secretKey);
    }
  }, [input, algorithm, isLive, isHmac, secretKey]);

  function handleHashClick() {
    generateHash(input, algorithm, isHmac, secretKey);
  }

  function loadSample() {
    setInput("DevToolsHub is awesome!");
    if (isHmac) setSecretKey("my-secret-key");
  }

  function clear() {
    setInput("");
    setOutput("");
    setSecretKey("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-surface/50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-secondary">Algorithm:</span>
          <div className="flex flex-wrap gap-2">
            {algorithms.map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  algorithm === algo
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "bg-elevated text-secondary hover:bg-border hover:text-primary"
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isHmac}
              onChange={(e) => setIsHmac(e.target.checked)}
              className="size-4 rounded border-border bg-elevated text-accent focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-secondary group-hover:text-primary">HMAC Mode</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="size-4 rounded border-border bg-elevated text-accent focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-secondary group-hover:text-primary">Live Mode</span>
          </label>
        </div>
      </div>

      {isHmac && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <label className="text-sm text-secondary">Secret Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key..."
              className="w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm text-primary outline-none focus:border-accent/50"
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ToolTextarea
          label="Input Text"
          value={input}
          onChange={setInput}
          placeholder="Paste your text here..."
          rows={12}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label={`${isHmac ? "HMAC-" : ""}${algorithm} result`}
          value={output}
          readOnly
          rows={12}
          textColor="accent"
        >
          {output && !output.startsWith("Error") && !output.includes("required") && (
            <CopyButton
              value={output}
              className="absolute right-4 top-4"
            />
          )}
        </ToolTextarea>
      </div>

      <ToolActions>
        {!isLive && (
          <Button onClick={handleHashClick} variant="primary" isDisabled={!input || (isHmac && !secretKey)}>
            Generate Hash
          </Button>
        )}
        <Button onClick={clear} variant="secondary" isDisabled={!input && !output && !secretKey}>
          Clear
        </Button>
      </ToolActions>

      <div className="rounded-xl border border-border bg-surface/50 p-4 text-sm text-secondary">
        <p>
          <strong>Security Note:</strong> {isHmac 
            ? "HMAC (Hash-based Message Authentication Code) uses a secret key to verify both the data integrity and the authenticity of a message."
            : "All hashing is performed locally in your browser using the Web Crypto API. Your data never leaves your device."}
        </p>
      </div>
    </div>
  );
}
