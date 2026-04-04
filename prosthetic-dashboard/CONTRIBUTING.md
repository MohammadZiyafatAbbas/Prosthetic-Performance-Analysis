# Contributing to Prosthetic Performance Analysis

First off, thank you for considering contributing to Prosthetic Performance Analysis! It's people like you that make it such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check if there's already an issue open for it. If not, go ahead and open a new issue!

## Fork & create a branch

If this is something you think you can fix, then [fork Prosthetic Performance Analysis](https://help.github.com/articles/fork-a-repo) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-chart
```

## Setup & Implementation

1. Install dependencies:
    ```sh
    npm install
    cd client && npm install
    cd ../server && npm install
    ```
2. Make your code changes.
3. Start the dev servers to test:
    ```sh
    npm run dev
    ```

## Commit and Push

Please make sure your commit messages are clear and descriptive.

Once you are ready, push your branch to your forked repository and open a Pull Request.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
