import { useEffect } from "react";
import logo from "../../assets/logo/mqicma-logo.png";

interface Props {
  compact?: boolean;
  light?: boolean;
}

export default function MqiLogo({ compact = false, light = false }: Props) {
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = logo;
    if (!favicon.parentNode) document.head.appendChild(favicon);
  }, []);

  return (
    <div className={`flex items-center ${compact ? "justify-center" : "gap-3"}`}>
      <img src={logo} alt="Mingəçevir Qadın İcması" className={compact ? "h-16 w-16 object-contain" : "h-12 w-12 object-contain"} />
    </div>
  );
}
