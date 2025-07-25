import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['tests/setup.ts'],
        coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
            'node_modules/',
            'dist/',
            'coverage/',
            '**/*.d.ts',
            'tests/**/*.ts',
          'vitest.config.ts',
          'src/types.d.ts',
          'migrations/',
          'eslint.config.mjs',
        ],
        thresholds: {
            branches: 25,
            functions: 10,
            lines: 25,
            statements: 25,
        },
        },
    },
}); 