/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-less', 'stylelint-config-recommended-vue'],
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**',
    '**/.vitepress/cache/**',
    '**/.vitepress/dist/**',
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
    {
      files: ['packages/ui/src/components/**/style/*.less'],
      rules: {
        'color-no-hex': true,
        'custom-property-pattern': '^omg-[a-z0-9-]+$',
        'selector-class-pattern':
          '^(?:o-[a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?|is-[a-z0-9-]+)$',
      },
    },
  ],
  rules: {
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
  },
}
