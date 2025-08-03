"use client";

import { useEffect } from "react";

const PageStyleManager = () => {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Store original styles
    const originalBodyBackground = body.style.background;
    const originalBodyBackgroundColor = body.style.backgroundColor;
    const originalBodyBackgroundImage = body.style.backgroundImage;

    // Add a class to body instead of directly manipulating styles
    body.classList.add("session-page");

    // Create a style element for this specific page
    const styleElement = document.createElement("style");
    styleElement.id = "session-page-styles";
    styleElement.textContent = `
      body.session-page {
        background: none !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      
      /* Ensure navigation text remains visible */
      body.session-page nav,
      body.session-page header,
      body.session-page h1,
      body.session-page .nav-text {
        color: black !important;
      }
      
      /* If you have specific navigation selectors, add them here */
      body.session-page [data-nav="true"],
      body.session-page .navigation,
      body.session-page .navbar {
        color: var(--text-primary, #000) !important;
      }
    `;

    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      body.classList.remove("session-page");
      const styleEl = document.getElementById("session-page-styles");
      if (styleEl) {
        styleEl.remove();
      }

      // Restore original styles
      body.style.background = originalBodyBackground;
      body.style.backgroundColor = originalBodyBackgroundColor;
      body.style.backgroundImage = originalBodyBackgroundImage;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PageStyleManager;
