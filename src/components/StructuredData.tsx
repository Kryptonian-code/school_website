import { useEffect } from "react";

interface StructuredDataProps {
  id: string;
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

const StructuredData = ({ id, data }: StructuredDataProps) => {
  useEffect(() => {
    const selector = `script[data-structured-data="${id}"]`;
    let element = document.head.querySelector<HTMLScriptElement>(selector);

    if (!element) {
      element = document.createElement("script");
      element.type = "application/ld+json";
      element.dataset.structuredData = id;
      document.head.appendChild(element);
    }

    element.textContent = JSON.stringify(data);

    return () => {
      element?.remove();
    };
  }, [data, id]);

  return null;
};

export default StructuredData;
