import { rmSync } from "node:fs";
import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import { propertyFormatNames } from "style-dictionary/enums";
import { createPropertyFormatter, fileHeader } from "style-dictionary/utils";

register(StyleDictionary, { excludeParentKeys: true });

// 색상 토큰 개수를 밖에서 검증할 수 있게 클로저로 기록해둠 (format 함수 밖에서는
// 변환된 dictionary에 접근할 방법이 없음).
let colorTokenCount = 0;

// 색상 토큰은 --color-* 네임스페이스로 @theme 안에 넣어서 Tailwind v4가
// bg-gray-500 같은 유틸리티 클래스를 자동 생성하게 함. 나머지(타이포그래피 등)는
// 아직 Tailwind에 매핑 안 했으니 참고용으로 :root에 그대로 둠.
StyleDictionary.registerFormat({
  name: "css/tailwind-theme",
  format: async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file });
    const formatProperty = createPropertyFormatter({
      dictionary,
      format: propertyFormatNames.css,
      outputReferences: options.outputReferences,
      usesDtcg: true,
    });

    const colorTokens = dictionary.allTokens.filter((t) => t.$type === "color");
    const restTokens = dictionary.allTokens.filter((t) => t.$type !== "color");
    colorTokenCount = colorTokens.length;

    const theme = colorTokens
      .map((t) => formatProperty({ ...t, name: `color-${t.name}` }))
      .join("\n");
    const root = restTokens.map(formatProperty).join("\n");

    return `${header}@theme {\n${theme}\n}\n\n:root {\n${root}\n}\n`;
  },
});

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
          format: "css/tailwind-theme",
        },
      ],
    },
  },
});

const outputPath = "src/styles/tokens.generated.css";
rmSync(outputPath, { force: true });

await sd.buildAllPlatforms();

if (colorTokenCount === 0) {
  console.error(
    `tokens.json에 색상($type: "color") 토큰이 하나도 없습니다. Figma push 내용을 확인하세요.`,
  );
  process.exit(1);
}
