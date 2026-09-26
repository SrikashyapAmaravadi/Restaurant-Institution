import { isValidElement, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CursorPointer01Icon,
  Download04Icon,
  Layers01Icon,
  Notification03Icon,
  PaintBoardIcon,
  Rocket01Icon,
  Settings02Icon,
  TextFontIcon
} from '@hugeicons/core-free-icons';
import './BranchedMenu.css';

const DEFAULT_ITEMS = [
  {
    label: 'Getting started',
    children: [
      { value: 'install', label: 'Installation', icon: Download04Icon },
      { value: 'quick', label: 'Quick start', icon: Rocket01Icon },
      { value: 'config', label: 'Configuration', icon: Settings02Icon },
      { value: 'theming', label: 'Theming', icon: PaintBoardIcon }
    ]
  },
  {
    label: 'Components',
    children: [
      { value: 'buttons', label: 'Buttons', icon: CursorPointer01Icon },
      { value: 'typography', label: 'Typography', icon: TextFontIcon },
      { value: 'overlays', label: 'Overlays', icon: Layers01Icon },
      { value: 'toasts', label: 'Toasts', icon: Notification03Icon }
    ]
  }
];
const PAD = 6;
const MARK = 16;

const renderIcon = icon => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  return <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />;
};

const toSet = open => new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);

export default function BranchedMenu({
  items = DEFAULT_ITEMS,
  defaultOpen = 0,
  defaultActive = '',
  activeValue,
  onSelect,
  onSelectSection,
  onToggle,
  color = '#11120D',
  accentColor = '#11120D',
  lineColor = '#D8CFBC',
  width = 240,
  rowHeight = 34,
  indent = 38,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 13.5,
  drawDuration = 400,
  foldDuration = 300,
  className = '',
  style = {}
}) {
  const [open, setOpen] = useState(() => toSet(defaultOpen));
  const [internalActive, setInternalActive] = useState(() => {
    if (activeValue !== undefined) return activeValue;
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? '';
  });

  const active = activeValue !== undefined ? activeValue : internalActive;

  const isItemActive = (val) => {
    if (val === undefined || val === null) return false;
    if (Array.isArray(active)) return active.includes(val);
    if (active instanceof Set) return active.has(val);
    return active === val;
  };

  useEffect(() => {
    if (activeValue !== undefined) {
      setInternalActive(activeValue);
      // Auto-open section if activeValue is in a closed section
      const activeIdx = items.findIndex(it =>
        it.children?.some(kid => isItemActive(kid.value))
      );
      if (activeIdx >= 0) {
        setOpen(prev => {
          if (prev.has(activeIdx)) return prev;
          const next = new Set(prev);
          next.add(activeIdx);
          return next;
        });
      }
    }
  }, [activeValue, items]);

  const navRef = useRef(null);
  const heads = useRef([]);
  const markerRef = useRef(null);
  const latest = useRef({});
  latest.current = { onSelect, onSelectSection, onToggle };

  const activeSection = items.findIndex(it =>
    it.children?.some(kid => isItemActive(kid.value)) || isItemActive(it.value ?? item?.label)
  );
  const markerShown = activeSection >= 0 && open.has(activeSection);

  useLayoutEffect(() => {
    const place = glide => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = 'none';
      if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute('data-on', Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = '';
      }
    };
    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value, item) => {
    setInternalActive(value);
    latest.current.onSelect?.(value, item);
  };

  const toggle = i => {
    setOpen(prev => {
      const next = new Set(prev);
      const isOpen = !next.has(i);
      if (isOpen) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, isOpen);
      return next;
    });
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = k => PAD + k * rowHeight + rowHeight / 2;
  const branch = k => `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = k => `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = k => rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ''}`}
      style={{
        '--bm-w': typeof width === 'number' ? `${width}px` : width,
        '--bm-ink': color,
        '--bm-accent': accentColor,
        '--bm-line': lineColor,
        '--bm-font': `${fontSize}px`,
        '--bm-row': `${rowHeight}px`,
        '--bm-indent': `${indent}px`,
        '--bm-line-w': lineWidth,
        '--bm-draw': `${drawDuration}ms`,
        '--bm-fold': `${foldDuration}ms`,
        ...style
      }}
    >
      <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && isItemActive(leafValue);
        const sectionActive = isItemActive(leafValue);
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;
        return (
          <div key={item.value ?? item.label} className="branched-menu__section" data-open={isOpen ? '' : undefined}>
            <button
              ref={el => {
                heads.current[i] = el;
              }}
              type="button"
              className="branched-menu__head"
              aria-expanded={kids ? isOpen : undefined}
              aria-current={(leafActive || sectionActive) ? 'true' : undefined}
              data-active={(leafActive || sectionActive) ? '' : undefined}
              onClick={() => {
                if (kids) {
                  toggle(i);
                  latest.current.onSelectSection?.(item.value ?? item.label, item, i);
                } else {
                  select(leafValue, item);
                }
              }}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="branched-menu__badge">{item.count}</span>
              )}
            </button>
            {kids ? (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div className="branched-menu__tree" style={{ height: bodyH }}>
                    <svg className="branched-menu__lines" width={indent} height={bodyH} aria-hidden="true">
                      <path className="branched-menu__base" d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`} />
                      {kids.map((kid, k) => (
                        <path key={kid.value} className="branched-menu__base" d={branch(k)} />
                      ))}
                      {kids.map((kid, k) => {
                        const kidActive = isItemActive(kid.value);
                        return (
                          <path
                            key={kid.value}
                            className="branched-menu__reach"
                            d={reach(k)}
                            style={{
                              strokeDasharray: length(k),
                              strokeDashoffset: kidActive ? 0 : length(k)
                            }}
                          />
                        );
                      })}
                    </svg>
                    {kids.map(kid => {
                      const kidActive = isItemActive(kid.value);
                      return (
                        <button
                          key={kid.value}
                          type="button"
                          className="branched-menu__item"
                          aria-current={kidActive ? 'true' : undefined}
                          data-active={kidActive ? '' : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => select(kid.value, kid)}
                        >
                          {kid.icon ? (
                            <span className="branched-menu__icon" aria-hidden="true">
                              {renderIcon(kid.icon)}
                            </span>
                          ) : null}
                          <span className="branched-menu__label">{kid.label}</span>
                          {kid.badge !== undefined && (
                            <span className="branched-menu__badge">{kid.badge}</span>
                          )}
                          {kid.checked !== undefined && (
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', opacity: kid.checked ? 1 : 0.35, fontSize: 11, fontWeight: 700 }}>
                              {kid.checked ? '✓' : ''}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
