export interface Tool {
  name: string;
  description: string;
  href: string;
  icon: string;
}

export const tools: Tool[] = [
  {
    name: "JSON Formatter",
    description: "Beautify and validate your JSON data with custom indentation.",
    href: "/tools/json-formatter",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6c-2 0-2 3-2 6s0 6 2 6"/><path d="M16 6c2 0 2 3 2 6s0 6-2 6"/><path d="M12 8v8"/></svg>`,
  },
  {
    name: "Base64 Encoder & Decoder",
    description: "Encode and decode Base64 strings easily.",
    href: "/tools/base64-converter",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h10M4 17h6"/><path d="M18 12l3 3-3 3"/></svg>`,
  },
  {
    name: "URL Encoder & Decoder",
    description: "Encode and decode URL-safe text and query strings.",
    href: "/tools/url-converter",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.14 1.14"/><path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.14-1.14"/></svg>`,
  },
  {
    name: "Diff Checker",
    description: "Compare text side by side and highlight added, removed, and changed lines.",
    href: "/tools/diff-checker",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M9 8h4"/><path d="M11 12h4"/><path d="M9 16h6"/></svg>`,
  },
  {
    name: "UUID Generator",
    description: "Generate UUID v4 values instantly",
    href: "/tools/uuid-generator",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  },
  {
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens locally.",
    href: "/tools/jwt-decoder",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  },
  {
    name: "Unix Timestamp Converter",
    description: "Convert timestamps to readable dates and back.",
    href: "/tools/timestamp-converter",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
  {
    name: "Hash Generator",
    description: "Generate SHA-1, SHA-256, and SHA-512 hashes securely.",
    href: "/tools/hash-generator",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  },
  {
    name: "Regex Sandbox",
    description: "Test and debug regular expressions visually with real-time highlighting and capture groups.",
    href: "/tools/regex-sandbox",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4a10 10 0 0 0 0 16"/><path d="M16 4a10 10 0 0 1 0 16"/><path d="M9 15h.01"/><path d="M14.5 9v6"/><path d="m12 10.5 5 3"/><path d="m17 10.5-5 3"/></svg>`,
  },
];
