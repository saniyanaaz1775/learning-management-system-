'use client';

import React, { useMemo, useRef, useEffect } from 'react';

type Lang = 'python' | 'c' | 'cpp' | 'java' | 'javascript';

const KEYWORDS: Record<Lang, string[]> = {
  python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'pass', 'break', 'continue', 'raise', 'assert', 'global', 'nonlocal'],
  c: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'],
  cpp: ['alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'class', 'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'],
  java: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'],
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'super', 'import', 'export', 'default', 'async', 'await', 'true', 'false', 'null', 'undefined'],
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildKeywordRegex(lang: Lang): RegExp | null {
  const words = KEYWORDS[lang];
  if (!words.length) return null;
  const escaped = words.map(escapeRegex).join('|');
  return new RegExp(`\\b(${escaped})\\b`, 'g');
}

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'default';

interface Token {
  type: TokenType;
  value: string;
}

function tokenizeLine(line: string, lang: Lang): Token[] {
  const tokens: Token[] = [];
  let remaining = line;
  const keywordRegex = buildKeywordRegex(lang);

  while (remaining.length > 0) {
    let match: RegExpMatchArray | null = null;
    let type: TokenType = 'default';
    let index = remaining.length;

    // Strings (double, single). Skip if inside string.
    const strDouble = /^"(?:[^"\\]|\\.)*"/.exec(remaining);
    const strSingle = /^'(?:[^'\\]|\\.)*'/.exec(remaining);
    if (lang === 'python') {
      const strTriple = /^"""[^"]*"""|^'''[^']*'''/.exec(remaining);
      if (strTriple && strTriple.index === 0) {
        match = strTriple;
        type = 'string';
      }
    }
    if (!match && strDouble && strDouble.index === 0) {
      match = strDouble;
      type = 'string';
    }
    if (!match && strSingle && strSingle.index === 0) {
      match = strSingle;
      type = 'string';
    }

    // Single-line comments
    const slComment = lang === 'python' ? /^#.*/.exec(remaining) : /^\/\/.*/.exec(remaining);
    if (!match && slComment && slComment.index === 0) {
      match = slComment;
      type = 'comment';
    }

    // Multi-line start (we only highlight single line, so treat /* and */ as comment)
    const mlStart = /^\/\*.*/.exec(remaining);
    const mlEnd = /.*\*\//.exec(remaining);
    if (!match && mlStart && mlStart.index === 0) {
      match = mlStart;
      type = 'comment';
    }
    if (!match && mlEnd && remaining.startsWith('*')) {
      match = remaining.match(/^[^*]*\*\//) || remaining.match(/^\*\//);
      if (match) {
        type = 'comment';
      }
    }

    // Numbers
    const num = /^\d+\.?\d*([eE][+-]?\d+)?\b/.exec(remaining);
    if (!match && num && num.index === 0) {
      match = num;
      type = 'number';
    }

    // Keywords
    if (!match && keywordRegex) {
      keywordRegex.lastIndex = 0;
      const kw = keywordRegex.exec(remaining);
      if (kw && kw.index === 0) {
        match = kw;
        type = 'keyword';
      }
    }

    if (match && match[0]) {
      tokens.push({ type, value: match[0] });
      remaining = remaining.slice(match[0].length);
    } else {
      const next = remaining.search(/(?="|'|\/\/|\/\*|\d|\b)/);
      const chunk = next === -1 ? remaining : remaining.slice(0, next === 0 ? 1 : next);
      if (chunk) tokens.push({ type: 'default', value: chunk });
      remaining = next === -1 ? '' : next === 0 ? remaining.slice(1) : remaining.slice(next);
    }
  }

  return tokens;
}

const tokenClass: Record<TokenType, string> = {
  keyword: 'text-violet-500 dark:text-violet-400',
  string: 'text-emerald-600 dark:text-emerald-400',
  number: 'text-blue-600 dark:text-blue-400',
  comment: 'text-neutral-500 dark:text-neutral-400 italic',
  default: 'text-neutral-800 dark:text-neutral-200',
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Lang;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
}

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder = 'Enter your code...',
  disabled,
  className = '',
  minHeight = 320,
}: CodeEditorProps) {
  const highlighted = useMemo(() => {
    const lines = value.split('\n');
    if (lines.length === 0 && !value) lines.push('');
    return lines.map((line, i) => {
      const tokens = tokenizeLine(line, language);
      return (
        <div key={i} className="whitespace-pre">
          {tokens.map((t, j) => (
            <span key={j} className={tokenClass[t.type]}>
              {t.value}
            </span>
          ))}
        </div>
      );
    });
  }, [value, language]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    const ov = overlayRef.current;
    if (!ta || !ov) return;
    const sync = () => {
      ov.scrollTop = ta.scrollTop;
      ov.scrollLeft = ta.scrollLeft;
    };
    ta.addEventListener('scroll', sync);
    return () => ta.removeEventListener('scroll', sync);
  }, []);

  return (
    <div className={`relative rounded-xl border border-neutral-300 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 ${className}`}>
      <div
        ref={overlayRef}
        className="absolute inset-0 overflow-auto p-4 font-mono text-sm leading-relaxed pointer-events-none select-none"
        style={{ minHeight }}
        aria-hidden
      >
        <pre className="m-0">
          <code className="block">{highlighted}</code>
        </pre>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        className="relative w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-relaxed text-transparent caret-neutral-900 dark:caret-neutral-100 focus:outline-none z-10"
        style={{ minHeight }}
        data-gramm="false"
        data-enable-grammarly="false"
      />
    </div>
  );
}
