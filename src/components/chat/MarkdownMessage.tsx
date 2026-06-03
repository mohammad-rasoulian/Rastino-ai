"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

type MarkdownMessageProps = {
  content: string;
};

type CodeBlockProps = {
  code: string;
  language: string;
  children: React.ReactNode;
};

function getLanguageLabel(language: string) {
  if (!language) return "Code";

  const labels: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    mjs: "JavaScript",
    cjs: "JavaScript",
    bash: "Bash",
    sh: "Shell",
    zsh: "Zsh",
    powershell: "PowerShell",
    ps1: "PowerShell",
    css: "CSS",
    scss: "SCSS",
    html: "HTML",
    xml: "XML",
    json: "JSON",
    jsonc: "JSONC",
    prisma: "Prisma",
    sql: "SQL",
    python: "Python",
    py: "Python",
    php: "PHP",
    go: "Go",
    rust: "Rust",
    rs: "Rust",
    java: "Java",
    c: "C",
    cpp: "C++",
    cs: "C#",
    yaml: "YAML",
    yml: "YAML",
    markdown: "Markdown",
    md: "Markdown",
    env: "ENV",
    dockerfile: "Dockerfile",
  };

  return labels[language.toLowerCase()] || language;
}

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join("");
  }

  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    node.props &&
    typeof node.props === "object" &&
    "children" in node.props
  ) {
    return extractTextFromNode(node.props.children as React.ReactNode);
  }

  return "";
}

function CodeBlock({ code, language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const label = getLanguageLabel(language);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="markdown-code-shell" dir="ltr">
      <div className="markdown-code-header" dir="rtl">
        <div className="markdown-code-language">
          <span className="markdown-code-icon">⌘</span>
          <span>{label}</span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="markdown-code-copy"
        >
          {copied ? "کپی شد" : "کپی"}
        </button>
      </div>

      <pre className="markdown-pre">
        {children}
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,

          p: ({ children }) => <p className="markdown-p">{children}</p>,

          ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-li">{children}</li>,

          strong: ({ children }) => (
            <strong className="markdown-strong">{children}</strong>
          ),

          em: ({ children }) => <em className="markdown-em">{children}</em>,

          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="markdown-link"
            >
              {children}
            </a>
          ),

          pre: ({ children }) => {
            const codeNode = Array.isArray(children) ? children[0] : children;
            const rawCode = extractTextFromNode(codeNode).replace(/\n$/, "");

            let language = "";

            if (
              codeNode &&
              typeof codeNode === "object" &&
              "props" in codeNode &&
              codeNode.props &&
              typeof codeNode.props === "object" &&
              "className" in codeNode.props &&
              typeof codeNode.props.className === "string"
            ) {
              const match = /language-([\w-]+)/.exec(codeNode.props.className);
              language = match?.[1] || "";
            }

            return (
              <CodeBlock code={rawCode} language={language}>
                {children}
              </CodeBlock>
            );
          },

          code: ({ children, className }) => {
            const isBlockCode = className?.includes("language-");

            if (isBlockCode) {
              return (
                <code className={`markdown-code-block ${className || ""}`}>
                  {children}
                </code>
              );
            }

            return <code className="markdown-code-inline">{children}</code>;
          },

          table: ({ children }) => (
            <div className="markdown-table-wrap">
              <table className="markdown-table">{children}</table>
            </div>
          ),

          th: ({ children }) => <th className="markdown-th">{children}</th>,
          td: ({ children }) => <td className="markdown-td">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
