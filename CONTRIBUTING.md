# Contributing to Mojo

First off, thank you for considering contributing to Mojo! It's people like you that make open source such a great community.

## How Can I Contribute?

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/bornebyte/mojo/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/bornebyte/mojo/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue and provide a clear description of the enhancement you'd like to see.
- Explain why this enhancement would be useful to other users.

### Pull Requests

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`pnpm test`).
4.  Make sure your code lints (`pnpm lint`).
5.  Issue that pull request!

## Styleguides

### Git Commit Messages

We follow the Conventional Commits specification. Please ensure your commit messages are in this format.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

Example:
```
feat: Add ability to filter students by name
```

### Code Style

We use Prettier and ESLint to maintain a consistent code style. Please run `pnpm lint` and `pnpm format` before committing your changes.

---

We look forward to your contributions!