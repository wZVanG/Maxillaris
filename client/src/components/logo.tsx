import { useTheme } from "@/hooks/use-theme";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <img
      src={isDarkMode ? "/m_logo_dark.png" : "/m_logo_light.png"}
      alt="Maxillaris Logo"
      className={`h-8 md:h-10 w-auto ${className}`}
    />
  );
}
