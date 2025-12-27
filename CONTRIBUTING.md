# Contributing to VaultDB Community

First off, thank you for considering contributing to VaultDB Community! It's people like you that make VaultDB such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (config files, commands, etc.)
- **Describe the behavior you observed and what you expected**
- **Include logs** if applicable
- **Specify your environment** (OS, Node.js version, database versions)

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this feature would be useful** to most users
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Add tests** if applicable
5. **Run the test suite**: `npm test`
6. **Run linting**: `npm run lint`
7. **Commit your changes** using conventional commits
8. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone git@github.com:YOUR_USERNAME/vaultdb-community.git
cd vaultdb-community

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## Project Structure

```
vaultdb-community/
├── packages/
│   ├── core/           # Core backup/restore logic
│   ├── cli/            # Command-line interface
│   └── server/         # API server and worker
├── docs/               # Documentation
├── examples/           # Example configurations
└── tests/              # Integration tests
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add support for SQLite backups
fix: handle connection timeout for slow databases
docs: update configuration examples
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Include both unit and integration tests when applicable

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "backup"

# Run with coverage
npm run test:coverage
```

## Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` before committing
- Use TypeScript for all new code
- Follow existing patterns in the codebase

## Questions?

Feel free to open an issue with the `question` label or reach out on our Discord community.

Thank you for contributing!
