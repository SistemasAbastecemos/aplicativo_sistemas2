import { useState, useEffect, useRef } from "react";

export function useSidebar() {
  const [visible, setVisible] = useState(false);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Bloquea scroll del body cuando el sidebar/bottom-sheet está abierto en móvil
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const originalOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    const handleClickOutside = (event) => {
      const insideSidebar = sidebarRef.current?.contains(event.target);
      const insideToggle = toggleRef.current?.contains(event.target);
      if (!insideSidebar && !insideToggle) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  return {
    visible,
    setVisible,
    sidebarRef,
    toggleRef,
    toggle: () => setVisible((v) => !v),
    close: () => setVisible(false),
  };
}
