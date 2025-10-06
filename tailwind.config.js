import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: theme("colors.slate.700"),
            a: {
              color: theme("colors.cyan.600"),
              fontWeight: theme("fontWeight.semibold"),
              textDecoration: "none",
              '&:hover': {
                color: theme("colors.cyan.500"),
                textDecoration: "underline",
              },
            },
            h1: {
              fontWeight: theme("fontWeight.extrabold"),
              color: theme("colors.slate.900"),
            },
            h2: {
              fontWeight: theme("fontWeight.bold"),
              color: theme("colors.slate.900"),
            },
            h3: {
              fontWeight: theme("fontWeight.semibold"),
              color: theme("colors.slate.900"),
            },
            strong: {
              color: theme("colors.slate.900"),
            },
            code: {
              color: theme("colors.cyan.700"),
              fontWeight: theme("fontWeight.medium"),
            },
            'blockquote p:first-of-type::before': { display: "none" },
            'blockquote p:last-of-type::after': { display: "none" },
          },
        },
        invert: {
          css: {
            color: theme("colors.slate.200"),
            a: {
              color: theme("colors.cyan.300"),
              '&:hover': {
                color: theme("colors.cyan.200"),
              },
            },
            h1: {
              color: theme("colors.white"),
            },
            h2: {
              color: theme("colors.white"),
            },
            h3: {
              color: theme("colors.white"),
            },
            strong: {
              color: theme("colors.white"),
            },
            code: {
              color: theme("colors.cyan.200"),
            },
            blockquote: {
              borderLeftColor: theme("colors.cyan.500"),
              color: theme("colors.slate.100"),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}

