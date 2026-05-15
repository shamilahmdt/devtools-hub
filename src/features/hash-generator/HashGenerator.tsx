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
      {/* Settings Row */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        {/* Algorithm Selection */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-neutral-400">Algorithm:</span>
          <div className="flex flex-wrap gap-2">
            {algorithms.map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  algorithm === algo
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

        {/* Modes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isHmac}
              onChange={(e) => setIsHmac(e.target.checked)}
              className="size-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300">HMAC Mode</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="size-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300">Live Mode</span>
          </label>
        </div>
      </div>

      {/* Secret Key Input (Only in HMAC Mode) */}
      {isHmac && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Secret Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <ToolTextarea
          label="Input Text"
          value={input}
          onChange={setInput}
          placeholder="Paste your text here..."
          rows={12}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        {/* Output */}
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

      {/* Info Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
        <p>
          <strong>Security Note:</strong> {isHmac 
            ? "HMAC (Hash-based Message Authentication Code) uses a secret key to verify both the data integrity and the authenticity of a message."
            : "All hashing is performed locally in your browser using the Web Crypto API. Your data never leaves your device."}
        </p>
      </div>
    </div>
  );
}
