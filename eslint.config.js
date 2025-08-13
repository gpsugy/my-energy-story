import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-plugin-prettier'
import airbnb from 'eslint-config-airbnb'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier: prettier
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
      'import/no-unresolved': 'off',
      'no-console': 'warn',
      'prettier/prettier': 'error',
      ...airbnb.rules,
      ...reactPlugin.configs.recommended.rules,
      ...prettier.configs.recommended.rules
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
])
