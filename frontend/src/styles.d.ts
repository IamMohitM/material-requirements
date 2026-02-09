/**
 * CSS Module Type Declarations
 * Enables TypeScript to recognize CSS module imports
 */

declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.sass' {
  const content: Record<string, string>;
  export default content;
}
