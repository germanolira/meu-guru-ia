"use dom";

import { useDOMImperativeHandle, type DOMImperativeFactory } from "expo/dom";
import React, { Ref, useEffect, useRef } from "react";

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

export default function LatexDOMComponent({
  content,
  isUser = false,
  isBlock = false,
  ref,
}: LatexDOMComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mathJaxLoadedRef = useRef(false);

  const textColor = isUser ? "#FFFFFF" : "#1F2937";
  const backgroundColor = isUser ? "#8b5cf6" : "transparent";

  const renderMath = async (mathContent: string) => {
    if (!contentRef.current) return;

    try {
      const sanitizedContent = sanitizeLatex(mathContent);

      if (!sanitizedContent) {
        if (contentRef.current) {
          contentRef.current.textContent = mathContent;
        }
        return;
      }

      contentRef.current.innerHTML = isBlock
        ? `$$${sanitizedContent}$$`
        : `$${sanitizedContent}$`;

      if (window.MathJax && window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise([contentRef.current]);
      } else if (window.MathJax && window.MathJax.Hub) {
        window.MathJax.Hub.Queue([
          "Typeset",
          window.MathJax.Hub,
          contentRef.current,
        ]);
      } else if (window.MathJax && window.MathJax.startup) {
        await window.MathJax.startup.promise;
        if (window.MathJax.typesetPromise) {
          await window.MathJax.typesetPromise([contentRef.current]);
        }
      }
    } catch (error) {
      console.error("MathJax render error:", error);
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
    []
  );

  useEffect(() => {
    const initializeMathJax = () => {
      if (mathJaxLoadedRef.current) return;

      if (!window.MathJax) {
        window.MathJax = {
          tex: {
            inlineMath: [["$", "$"]],
            displayMath: [["$$", "$$"]],
            processEscapes: true,
            processEnvironments: true,
            formatError: (jax: any, err: any) => {
              console.error("MathJax formatting error:", err);
              return jax.formatError(err);
            },
          },
          options: {
            skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
            ignoreHtmlClass: "tex2jax_ignore",
            processHtmlClass: "tex2jax_process",
          },
          startup: {
            ready: () => {
              console.log("MathJax is ready");
              window.MathJax.startup.defaultReady();
              mathJaxLoadedRef.current = true;
              renderMath(content);
            },
            failed: (err: any) => {
              console.error("MathJax startup failed:", err);
            },
          },
        };

        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
        script.async = true;
        script.onload = () => {
          console.log("MathJax script loaded");
        };
        script.onerror = () => {
          console.error("Failed to load MathJax");
          if (contentRef.current) {
            contentRef.current.textContent = content;
          }
        };
        document.head.appendChild(script);
      } else {
        if (window.MathJax.startup && window.MathJax.startup.promise) {
          window.MathJax.startup.promise.then(() => {
            mathJaxLoadedRef.current = true;
            renderMath(content);
          });
        } else if (window.MathJax.typesetPromise) {
          mathJaxLoadedRef.current = true;
          renderMath(content);
        } else {
          setTimeout(() => {
            mathJaxLoadedRef.current = true;
            renderMath(content);
          }, 1000);
        }
      }
    };

    initializeMathJax();
  }, []);

  useEffect(() => {
    if (mathJaxLoadedRef.current) {
      renderMath(content);
    }
  }, [content, isBlock]);

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
      }}
    >
      <div
        ref={contentRef}
        style={{
          textAlign: isBlock ? "center" : "left",
          width: "100%",
          color: textColor,
        }}
        className="math-container"
      >
        {content}
      </div>

      <style>{`
        .MathJax {
          color: ${textColor} !important;
        }
        .MathJax_Display {
          margin: 4px 0 !important;
        }
        .math-container .MathJax {
          color: ${textColor} !important;
        }
        .math-container {
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: ${isBlock ? "center" : "flex-start"};
        }
        .math-container .MathJax_Error {
          color: #ff6b6b !important;
          font-size: 12px !important;
        }
      `}</style>
    </div>
  );
}
