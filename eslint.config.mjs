import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
export default ts.config(
  { ignores: ['dist/**', 'node_modules/**', 'assets/**', 'public/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: ts.parser } },
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  { files: ['**/*.ts', '**/*.vue'], rules: { 'no-undef': 'off' } },
  prettier,
  { languageOptions: { globals: { window: 'readonly', document: 'readonly', console: 'readonly', AbortController: 'readonly', navigator: 'readonly' } } },
);
