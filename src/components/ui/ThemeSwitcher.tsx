// src/components/atoms/ThemeSwitcher.jsx
import { useTheme } from "@/contexts/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeSwitcher = () => {
  // Consume the theme and toggleTheme function from the context.
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-2 flex flex-col items-center gap-1 font-sans">
      {/* Switch Background Container */}
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-12 shrink-0 cursor-pointer rounded-full border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          theme === "dark" ? "bg-blue-600" : "bg-[#98ff00]"
        }`}
        role="switch"
      >
        {/* Sliding Circle Indicator */}
        <div
          className={`pointer-events-none absolute h-8 w-8 transform rounded-full bg-white p-1 shadow ring-0 transition duration-200 ease-in-out ${
            theme === "dark" ? "translate-x-4" : "translate-x-0"
          }`}
        >
          {theme === "dark" ? (
            <MoonIcon className="h-full w-full fill-blue-700 text-blue-700" />
          ) : (
            <SunIcon className="h-full w-full text-blue-700" />
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
