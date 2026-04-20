"use client";

import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { ITALIAN_CITIES } from "@/lib/cities";

const fuse = new Fuse(ITALIAN_CITIES, {
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
});

type Props = {
  value: string;
  onChange: (city: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
};

export function CityAutocomplete({
  value,
  onChange,
  required,
  placeholder = "Es. Milano",
  className,
  name,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. when parent resets)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Search on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const hits = fuse.search(query, { limit: 5 }).map((r) => r.item);
    setResults(hits);
    setShowDropdown(hits.length > 0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(city: string) {
    setQuery(city);
    onChange(city);
    setShowDropdown(false);
    setResults([]);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    // Clear the confirmed value only when the field is fully cleared
    if (v === "") onChange("");
  }

  const inputCls =
    className ??
    "h-12 w-full rounded-2xl border border-[#232340] bg-[#16162a] px-4 text-sm text-white placeholder:text-[#5c5f7a] outline-none transition focus:border-[#0D9488]";

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input carries the validated city value for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      <input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        className={inputCls}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
      />

      {showDropdown && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-[#232340] bg-[#111111] shadow-2xl">
          {results.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(city); }}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition hover:bg-[#16162a]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mr-2.5 h-4 w-4 shrink-0 text-[#5c5f7a]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {city}
            </button>
          ))}
          <div className="border-t border-[#232340] px-4 py-2.5">
            <p className="text-[11px] text-[#5c5f7a]">
              Non trovi la tua città?{" "}
              <a
                href="mailto:supporto@filo.network"
                className="text-[#0D9488] hover:underline"
                onMouseDown={(e) => e.stopPropagation()}
              >
                Scrivi a supporto@filo.network
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
