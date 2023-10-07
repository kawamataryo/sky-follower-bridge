# Contribution Guide

This is a guide on how to contribute to Sky Follower Bridge.  
Contributions are welcome 🎉

## Issues

The following issues are accepted:

- Questions about features
- Reports of errors or problems
- Proposals for new additions or improvements to features

Please click [here](https://github.com/kawamataryo/sky-follower-bridge/issues/new) to create an issue.

## Pull Requests

Pull requests are always welcome.

The following types of pull requests are accepted. For basic pull requests (especially minor ones), you may send a pull request without creating an issue.

- Bug fixes
- New functionality
- Performance fixes
- Typo fixes

"How about this kind of fix/improvement?" - If you have a question, please create an issue and discuss it with me.

## How to create a Pull Request

Please follow these steps to create a pull request:

1. Fork the repository
2. Create a new branch
3. Implement your changes
4. Run e2e and unit tests
5. Check the feature in your browser
6. Commit changes
7. Push branch
8. Create a Pull Request

Additionally, when creating a pull request, please keep the following in mind:

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.
- **Add tests!** - If you add a feature, it would be great if you could write a test for it.
- **Keep the same code style** - ESLint will automatically be run before committing.
- **Document any change in behavior** - Make sure the `README.md` and any other relevant documentation is kept up-to-date.
- **Send coherent history** - Make sure your commit messages are meaningful and self-explanatory.

## How to set up a local development environment

First, clone the forked repository locally:

```bash
$ git clone https://github.com/kawamataryo/sky-follower-bridge.git
```

Install dependencies with npm:

```bash
$ npm i
```

The dev command starts the development server:

```bash
$ npm run dev
```

When the development server starts, the extension build results are output to the `extension` directory.

You can use the built extension in your browser by loading the contents of the extensions folder in Chrome:

<img width="600" alt="image" src="https://github.com/kawamataryo/sky-follower-bridge/assets/11070996/ac90d0de-8957-41d4-bb53-571583106040">

When you modify the code, the change is automatically reflected.

## Release

When the version file of [changesets](https://github.com/changesets/changesets) is merged into master, a new version is released to each extension store with a [GitHub Actions job](https://github.com/kawamataryo/sky-follower-bridge/blob/main/.github/workflows/publish.yml).

1. add version file

```bash
npx changeset add
```

2. git push

```bash
git add .changesets
git commit -m "🛠️ add changesets"
git push origin master
```
