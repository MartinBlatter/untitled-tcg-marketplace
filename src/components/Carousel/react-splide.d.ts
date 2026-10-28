// @splidejs/react-splide ships no types and has no React 19 support, so the
// package is shimmed as `any`. TypeScript 7 also requires a declaration for the
// bare CSS side-effect import (TS2882), which resolves to a real .css file in
// the package but has no type.
declare module "@splidejs/react-splide";
declare module "@splidejs/react-splide/css";
