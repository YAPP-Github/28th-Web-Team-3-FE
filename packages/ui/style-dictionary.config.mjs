export default {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.generated.css",
          format: "css/variables",
          options: { selector: ":root" },
        },
      ],
    },
  },
};
