import { useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

export default function Base64Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const hasInput = input.trim().length > 0;
  const canUseOutput = output && output !== "Invalid Base64 string";

  function encodeBase64() {
    try {
      setOutput(btoa(input));
    } catch {
      setOutput("unable to encode text");
    }
  }

  function decodeBase64() {
    try {
      setOutput(atob(input));
    } catch {
      setOutput("Invalid Base64 string");
    }
  }

  function loadSample() {
    const sampleText = "DevToolsHub";

    setInput(sampleText);
    setOutput(btoa(sampleText));
  }

  function clear() {
    setInput("");
    setOutput("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">

        <ToolTextarea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Enter text or Base64 here"
          rows={15}
          rightLabel={
            <SampleButton onClick={loadSample} />
          }
        />

        <ToolTextarea
          label="Output"
          value={output}
          readOnly
          rows={15}
          textColor="accent"
        >
          {canUseOutput && (
            <CopyButton
              value={output}
              className="absolute right-4 top-4"
            />
          )}
        </ToolTextarea>
      </div>

      <ToolActions>
        <Button
          isDisabled={!hasInput}
          onClick={encodeBase64}
          variant="primary"
        >
          Encode
        </Button>

        <Button
          isDisabled={!hasInput}
          onClick={decodeBase64}
          variant="primary"
        >
          Decode
        </Button>

        {output && (
          <Button
            onClick={clear}
            variant="secondary"
          >
            Clear
          </Button>
        )}
      </ToolActions>
    </div>
  );
}
