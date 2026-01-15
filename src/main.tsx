import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dark Mode Initialization
// Check localStorage first. If nothing, default to 'dark'.
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    // Default to dark if no preference (and save it so it persists)
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
}

createRoot(document.getElementById("root")!).render(<App />);
