"use client";

/**
 * ComboBox — ported from rapkids-frontend `components/ui/combo-box.tsx` (same props),
 * restyled with the Preggy Mom Aid design system and hardened for WCAG 2.2 AA:
 * real option ids for aria-activedescendant, label association via `id`,
 * full keyboard support on the trigger, focus return, type-ahead, and an
 * optional hidden input so it works inside plain <form method="get">.
 */

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type Option = { value: string | undefined; label: string };

export type ComboBoxProps = {
  options: Option[];
  value?: string;
  /** Uncontrolled initial value (e.g. inside a server-rendered GET form). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  /** Defaults to showing search only for longer lists (more than 7 options). */
  showSearch?: boolean;
  allowEmpty?: boolean;
  ariaLabel?: string;
  renderOption?: (option: Option) => ReactNode;
  /** Lets a <label htmlFor> name the control. */
  id?: string;
  /** Submits the value with a plain HTML form. */
  name?: string;
  describedBy?: string;
};

export function ComboBox({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No options found.",
  className = "",
  disabled,
  showSearch,
  allowEmpty = false,
  ariaLabel,
  renderOption,
  id,
  name,
  describedBy,
}: ComboBoxProps) {
  const autoId = useId();
  const triggerId = id ?? `combo-${autoId}`;
  const listId = `${triggerId}-list`;
  const optionId = (index: number) => `${triggerId}-option-${index}`;
  const searchable = showSearch ?? options.length > 7;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = controlledValue ?? innerValue;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openUp, setOpenUp] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});
  const popupRef = useRef<HTMLDivElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", at: 0 });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? options.filter(option => option.label.toLowerCase().includes(needle)) : options;
  }, [options, query]);
  const allOptions: Option[] = allowEmpty ? [{ label: placeholder, value: "" }, ...filtered] : filtered;
  const selected = options.find(option => option.value === value);
  const selectedLabel = selected && !(allowEmpty && value === "") ? selected.label : placeholder;

  function openList() {
    if (disabled) return;
    const current = allOptions.findIndex(option => option.value === value);
    setActiveIndex(current >= 0 ? current : 0);
    setOpen(true);
    if (searchable) setTimeout(() => searchRef.current?.focus(), 0);
  }

  function closeList(returnFocus = true) {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }

  function selectAt(index: number) {
    const option = allOptions[index];
    if (!option) return;
    setInnerValue(option.value ?? "");
    onValueChange?.(option.value ?? "");
    closeList();
  }

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) closeList(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  });

  // Float the list in a portal positioned against the trigger, so it is never
  // clipped by scrolling containers and never pushes surrounding content.
  useLayoutEffect(() => {
    if (!open) { setPopupStyle({}); return; }
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom;
      const up = below < 280 && rect.top > below;
      setOpenUp(up);
      const width = Math.max(rect.width, 220);
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
      setPopupStyle(up
        ? { position: "fixed", left, width, bottom: window.innerHeight - rect.top + 6, maxHeight: Math.min(320, rect.top - 16) }
        : { position: "fixed", left, width, top: rect.bottom + 6, maxHeight: Math.min(320, below - 16) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);

  // Keep the active option visible and in range.
  useEffect(() => {
    if (!open) return;
    if (activeIndex >= allOptions.length) setActiveIndex(allOptions.length - 1);
    // Scroll inside the list only; never scroll the page.
    const option = document.getElementById(optionId(activeIndex));
    const list = listRef.current;
    if (option && list) {
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  });

  function onKeyDown(event: KeyboardEvent) {
    const count = allOptions.length;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); openList(); }
      return;
    }
    switch (event.key) {
      case "ArrowDown": event.preventDefault(); setActiveIndex(i => (count ? (i + 1) % count : -1)); break;
      case "ArrowUp": event.preventDefault(); setActiveIndex(i => (count ? (i <= 0 ? count - 1 : i - 1) : -1)); break;
      case "Home": event.preventDefault(); setActiveIndex(count ? 0 : -1); break;
      case "End": event.preventDefault(); setActiveIndex(count - 1); break;
      case "Enter": event.preventDefault(); selectAt(activeIndex === -1 && count === 1 ? 0 : activeIndex); break;
      case "Escape": event.preventDefault(); closeList(); break;
      case "Tab": closeList(false); break;
      case " ": if (!searchable) { event.preventDefault(); selectAt(activeIndex); } break;
      default:
        // Type-ahead for lists without a search box.
        if (!searchable && event.key.length === 1) {
          const now = Date.now();
          typeahead.current = { text: (now - typeahead.current.at > 700 ? "" : typeahead.current.text) + event.key.toLowerCase(), at: now };
          const match = allOptions.findIndex(option => option.label.toLowerCase().startsWith(typeahead.current.text));
          if (match >= 0) setActiveIndex(match);
        }
    }
  }

  const activeDescendant = open && activeIndex >= 0 && activeIndex < allOptions.length ? optionId(activeIndex) : undefined;

  return (
    <div ref={rootRef} className={`ds-combo ${className}`}>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        className="ds-combo-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={searchable ? undefined : activeDescendant}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={selected && !(allowEmpty && value === "") ? "ds-combo-value" : "ds-combo-value is-placeholder"}>{selectedLabel}</span>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div ref={popupRef} className={openUp ? "ds-combo-popup is-up" : "ds-combo-popup"} style={{ ...popupStyle, visibility: popupStyle.position ? "visible" : "hidden" }}>
          {searchable && (
            <div className="ds-combo-search">
              <Search size={16} aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                role="searchbox"
                aria-label={searchPlaceholder}
                aria-controls={listId}
                aria-activedescendant={activeDescendant}
                placeholder={searchPlaceholder}
                value={query}
                onChange={event => { setQuery(event.target.value); setActiveIndex(0); }}
                onKeyDown={onKeyDown}
              />
            </div>
          )}
          {allOptions.length === 0
            ? <p className="ds-combo-empty" role="status">{emptyMessage}</p>
            : <ul ref={listRef} id={listId} role="listbox" aria-labelledby={triggerId} className="ds-combo-list">
                {allOptions.map((option, index) => {
                  const isSelected = (option.value ?? "") === (value ?? "") && (option.value !== "" || allowEmpty);
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      className={index === activeIndex ? "ds-combo-option is-active" : "ds-combo-option"}
                      onPointerEnter={() => setActiveIndex(index)}
                      onPointerDown={event => event.preventDefault()}
                      onClick={() => selectAt(index)}
                    >
                      <span>{renderOption ? renderOption(option) : option.label}</span>
                      {isSelected && <Check size={16} aria-hidden="true" />}
                    </li>
                  );
                })}
              </ul>}
        </div>,
        // Inside a modal <dialog> the list must live in the dialog's top layer.
        triggerRef.current?.closest("dialog") ?? document.body
      )}
    </div>
  );
}

/** Compact non-searchable combobox for short option lists (rapkids ComboBox2). */
export const ComboBox2 = (props: ComboBoxProps) => <ComboBox showSearch={false} {...props} />;

export default ComboBox;
