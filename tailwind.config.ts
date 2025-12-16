import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f0f4ff",
                    100: "#e0e9ff",
                    200: "#c7d6fe",
                    300: "#a4b9fc",
                    400: "#7c92f8",
                    500: "#5a6bf2",
                    600: "#4549e6",
                    700: "#3939cb",
                    800: "#3131a4",
                    900: "#2d2f82",
                    950: "#1d1d4c",
                },
                accent: {
                    50: "#fef3f2",
                    100: "#fee4e2",
                    200: "#ffcdc9",
                    300: "#fdaaa4",
                    400: "#f97970",
                    500: "#f04e43",
                    600: "#dd3125",
                    700: "#ba251b",
                    800: "#9a231a",
                    900: "#80231c",
                    950: "#450d09",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-soft": "pulseSoft 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseSoft: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
