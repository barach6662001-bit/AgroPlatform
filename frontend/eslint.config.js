import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const legacyAntdFiles = existsSync(resolve(__dirname, '.eslint-antd-allowlist.txt'))
  ? readFileSync(resolve(__dirname, '.eslint-antd-allowlist.txt'), 'utf8')
      .split('\n')
      .filter(Boolean)
  : [];

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'antd',
            message: 'Ant Design is deprecated — use @/components/ui/* (shadcn). See CONTRIBUTING.md §UI.',
          },
          {
            name: '@ant-design/icons',
            message: 'Use lucide-react for icons.',
          },
        ],
        patterns: [
          {
            group: ['antd/*'],
            message: 'AntD subpath imports are deprecated.',
          },
        ],
      }],
    },
  },
  // Allow legacy AntD imports in existing files — list shrinks monotonically as screens migrate
  {
    files: legacyAntdFiles,
    rules: {
      'no-restricted-imports': 'off',
    },
  },
);
