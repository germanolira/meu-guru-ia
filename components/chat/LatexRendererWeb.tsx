"use dom";

import { useDOMImperativeHandle, type DOMImperativeFactory } from "expo/dom";
import React, { Ref, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    MathJax: any;
  }
}

export interface LatexDOMRef extends DOMImperativeFactory {
  updateContent: (...args: any[]) => void;
}

interface LatexDOMComponentProps {
  content: string;
  isUser?: boolean;
  isBlock?: boolean;
  ref: Ref<LatexDOMRef>;
  dom?: import("expo/dom").DOMProps;
}

const sanitizeLatex = (content: string): string => {
  if (!content) return "";

  return content
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/<[^>]*>/g, "")
    .replace(/\\\\\\\\/g, "\\\\")
    .trim();
};

export default function LatexWebComponent({
  content,
  isUser = false,
  isBlock = false,
  ref,
}: LatexDOMComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mathJaxReady, setMathJaxReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = isUser ? "#FFFFFF" : "#1F2937";
  const backgroundColor = isUser ? "#8b5cf6" : "transparent";

  const renderMath = async (mathContent: string) => {
    if (!contentRef.current || !mathJaxReady) {
      if (contentRef.current) {
        contentRef.current.textContent = mathContent;
      }
      return;
    }

    try {
      const sanitizedContent = sanitizeLatex(mathContent);

      if (!sanitizedContent) {
        if (contentRef.current) {
          contentRef.current.textContent = mathContent;
        }
        return;
      }

      const formattedContent = isBlock
        ? `\\[${sanitizedContent}\\]`
        : `\\(${sanitizedContent}\\)`;

      contentRef.current.innerHTML = formattedContent;

      if (window.MathJax?.typesetPromise) {
        await window.MathJax.typesetPromise([contentRef.current]);
        setError(null);
      } else if (window.MathJax?.startup?.promise) {
        await window.MathJax.startup.promise;
        if (window.MathJax.typesetPromise) {
          await window.MathJax.typesetPromise([contentRef.current]);
          setError(null);
        }
      }
    } catch (err) {
      console.error("MathJax render error:", err);
      setError("LaTeX Error");
      if (contentRef.current) {
        contentRef.current.textContent = mathContent;
      }
    }
  };

  useDOMImperativeHandle(
    ref,
    () => ({
      updateContent: (...args: any[]) => {
        const newContent = args[0] as string;
        if (typeof newContent === "string") {
          renderMath(newContent);
        }
      },
    }),
    [mathJaxReady, isBlock]
  );

  useEffect(() => {
    let mounted = true;

    const loadMathJax = async () => {
      try {
        if (window.MathJax) {
          if (window.MathJax.startup?.promise) {
            await window.MathJax.startup.promise;
          }
          if (mounted) {
            setMathJaxReady(true);
          }
          return;
        }

        window.MathJax = {
          tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [["\\[", "\\]"]],
            processEscapes: true,
            processEnvironments: true,
            packages: { "[+]": ["ams", "newcommand", "configmacros"] },
            formatError: (jax: any, err: any) => {
              console.error("MathJax formatting error:", err);
              return jax.formatError(err);
            },
          },
          options: {
            skipHtmlTags: [
              "script",
              "noscript",
              "style",
              "textarea",
              "pre",
              "code",
            ],
            ignoreHtmlClass: "tex2jax_ignore",
            processHtmlClass: "tex2jax_process",
            renderActions: {
              addMenu: [0, "", ""],
            },
          },
          loader: {
            load: ["[tex]/ams", "[tex]/newcommand", "[tex]/configmacros"],
          },
          startup: {
            ready: () => {
              console.log("MathJax startup ready");
              window.MathJax.startup.defaultReady();
              if (mounted) {
                setMathJaxReady(true);
              }
            },
            failed: (err: any) => {
              console.error("MathJax startup failed:", err);
              if (mounted) {
                setError("MathJax failed to start");
              }
            },
          },
        };

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
        script.async = true;

        script.onload = () => {
          console.log("MathJax script loaded successfully");
        };

        script.onerror = () => {
          console.error("Failed to load MathJax script");
          if (mounted) {
            setError("Failed to load MathJax");
          }
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error("Error loading MathJax:", err);
        if (mounted) {
          setError("Error loading MathJax");
        }
      }
    };

    loadMathJax();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (mathJaxReady && content) {
      renderMath(content);
    }
  }, [content, isBlock, mathJaxReady]);

  return (
    <div
      ref={containerRef}
      style={{
        margin: "0",
        padding: "8px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "16px",
        color: textColor,
        backgroundColor: backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40px",
        overflow: "hidden",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        style={{
          textAlign: isBlock ? "center" : "left",
          width: "100%",
          color: textColor,
          minHeight: "20px",
        }}
        className="math-container"
      >
        {!mathJaxReady && content}
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            fontSize: "10px",
            color: "#ff6b6b",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2px 4px",
            borderRadius: "4px",
            cursor: "help",
          }}
          title={error}
        >
          ⚠️
        </div>
      )}

      <style>{`
        .math-container {
          display: flex;
          align-items: center;
          justify-content: ${isBlock ? "center" : "flex-start"};
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .math-container .MathJax {
          color: ${textColor} !important;
        }
        
        .math-container .MathJax_Display {
          margin: 4px 0 !important;
        }
        
        .math-container mjx-container {
          color: ${textColor} !important;
        }
        
        .math-container mjx-container[display="true"] {
          margin: 4px 0 !important;
        }
        
        .math-container .MathJax_Error {
          color: #ff6b6b !important;
          font-size: 12px !important;
        }
      `}</style>
    </div>
  );
}
