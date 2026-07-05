import { rmSync } from "node:fs";
import { expandTypesMap, register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import { propertyFormatNames } from "style-dictionary/enums";
import { createPropertyFormatter, fileHeader } from "style-dictionary/utils";

register(StyleDictionary, { excludeParentKeys: true });

// Figma의 lineHeight 값은 퍼센트가 아니라 고정 px(예: fontSize 28에 lineHeight 38)로
// 작성돼 있음. sd-transforms는 퍼센트 문자열만 단위 없는 배수로 변환하고 순수 숫자는
// 그대로 두는데, 그러면 CSS font 속성에서 "font-size의 배수"로 잘못 해석되어 버림.
// 이 프로젝트의 lineHeight는 항상 px 절대값이라고 가정하고 단위를 붙인다.
StyleDictionary.registerTransform({
  name: "ts/lineheight/px",
  type: "value",
  transitive: true,
  filter: (token) => token.$type === "lineHeight" && typeof token.$value === "number",
  transform: (token) => `${token.$value}px`,
});

// typography 복합 토큰의 하위 속성 → CSS 속성 매핑. paragraphSpacing/paragraphIndent는
// 값이 항상 0이고 레이아웃(margin/indent)에 관여하는 속성이라 텍스트 스타일
// 유틸리티에서는 제외.
const TYPOGRAPHY_CSS_PROP = {
  fontFamily: "font-family",
  fontWeight: "font-weight",
  fontSize: "font-size",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing",
  textCase: "text-transform",
  textDecoration: "text-decoration-line",
};

// 색상 토큰 개수를 밖에서 검증할 수 있게 클로저로 기록해둠 (format 함수 밖에서는
// 변환된 dictionary에 접근할 방법이 없음).
let colorTokenCount = 0;

// 색상 토큰은 --color-* 네임스페이스로 @theme 안에 넣어서 Tailwind v4가
// bg-gray-500 같은 유틸리티 클래스를 자동 생성하게 함. typography 복합 토큰은
// @utility text-{name}으로 풀어서 실제 CSS 속성별로 출력 (font 축약형은
// letterSpacing/textCase가 누락되고 lineHeight 단위도 깨져서 사용 안 함).
// 나머지 원시 토큰(폰트 크기·굵기 등 개별 스케일)은 참고용으로 :root에 그대로 둠.
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
    colorTokenCount = colorTokens.length;

    const typographyTokens = dictionary.allTokens.filter(
      (t) => t.path.length === 3 && TYPOGRAPHY_CSS_PROP[t.path[2]],
    );
    const restTokens = dictionary.allTokens.filter(
      (t) => !colorTokens.includes(t) && t.path.length !== 3,
    );

    const theme = colorTokens
      .map((t) => formatProperty({ ...t, name: `color-${t.name}` }))
      .join("\n");
    const root = restTokens.map(formatProperty).join("\n");

    const typographyGroups = new Map();
    for (const t of typographyTokens) {
      const groupName = t.path.slice(0, -1).join("-").toLowerCase();
      const cssProp = TYPOGRAPHY_CSS_PROP[t.path[2]];
      if (!typographyGroups.has(groupName)) {
        typographyGroups.set(groupName, []);
      }
      typographyGroups.get(groupName).push(`  ${cssProp}: ${t.$value};`);
    }
    const utilities = [...typographyGroups.entries()]
      .map(([name, decls]) => `@utility text-${name} {\n${decls.join("\n")}\n}`)
      .join("\n\n");

    return `${header}@theme {\n${theme}\n}\n\n:root {\n${root}\n}\n\n${utilities}\n`;
  },
});

const sd = new StyleDictionary({
  source: ["tokens.json"],
  preprocessors: ["tokens-studio"],
  expand: { typesMap: expandTypesMap },
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab", "ts/lineheight/px"],
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
