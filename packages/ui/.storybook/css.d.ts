// Storybook 10부터 side-effect CSS import(`import "../src/styles/globals.css"` 같은)용
// ambient 선언을 안 준다. 여기서 직접 선언한다.
declare module "*.css";
