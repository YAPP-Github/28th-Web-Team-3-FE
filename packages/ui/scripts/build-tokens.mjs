import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

register(StyleDictionary, { excludeParentKeys: true });

const sd = new StyleDictionary({
  source: ["tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.generated.css",
          format: "css/variables",
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
