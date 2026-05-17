import { useState, useEffect, useRef } from "react";
import { tools, type Tool } from "../../constants/tools";

export default function Search() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Tool[]>([]);
  const [isMac, setIsMac] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // load recent searches from local storage
  useEffect(() => {
    const saved = localStorage.getItem("recent_tools");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // filter tools based on query
  const filteredTools = query.trim()
    ? tools.filter((tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // default tools if no search query (recent or most useful)
  const defaultTools = recentSearches.length > 0 
    ? recentSearches 
    : tools.slice(0, 3); // fallback to first 3 tools as "most useful"

  const displayTools = query.trim() ? filteredTools : defaultTools;

  const handleSelect = (tool: Tool) => {
    // save to recent searches -keep last 3
    const updatedRecent = [
      tool,
      ...recentSearches.filter((t) => t.href !== tool.href),
    ].slice(0, 3);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem("recent_tools", JSON.stringify(updatedRecent));
    
    window.location.href = tool.href;
    setIsOpen(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  // handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recent_tools");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tools..."
          className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-xl py-2.5 pl-10 pr-12 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-neutral-500"
        />
        
        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
              title="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-950 text-[10px] font-medium text-neutral-500 pointer-events-none">
              <span className="text-[12px]">{isMac ? "⌘" : "Ctrl"}</span>K
            </div>
          )}
        </div>
      </div>

      {/* dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-2">
              {query.trim() ? "Search Results" : recentSearches.length > 0 ? "Recent Tools" : "Suggested Tools"}
            </span>
            {!query.trim() && recentSearches.length > 0 && (
              <button 
                onClick={clearRecent}
                className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-red-400 px-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {displayTools.length > 0 ? (
              displayTools.map((tool) => (
                <button
                  key={tool.href}
                  onClick={() => handleSelect(tool)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-neutral-800 transition-colors group"
                >
                  <div 
                    className="size-8 rounded-lg bg-neutral-800 text-neutral-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                    dangerouslySetInnerHTML={{ __html: tool.icon }} 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{tool.name}</div>
                    <div className="text-xs text-neutral-500 line-clamp-1 truncate">{tool.description}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500 text-sm">
                No tools found for "{query}"
              </div>
            )}
          </div>

          <div className="p-2 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center px-4">
            <span className="text-[10px] text-neutral-600">Press Esc to close</span>
            <span className="text-[10px] text-neutral-600 font-mono">CMD+K</span>
          </div>
        </div>
      )}
    </div>
  );
}
