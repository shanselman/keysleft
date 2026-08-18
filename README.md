# Keys Left

[Conserve your keystrokes](https://www.hanselman.com/blog/do-they-deserve-the-gift-of-your-keystrokes).

Keys Left is a dependency-free static web app that estimates how many
keystrokes you have left based on your age and typing speed.

## Development

Node.js 24 or later is used for syntax checks and the built-in test runner.
The production site itself uses only browser-native HTML, CSS, and JavaScript.

```shell
npm ci
npm test
```

Serve the `public` directory with any local static file server, then open the
site root. The app accepts `age`, `dob` (`YYYY-MM-DD`), and `wpm` query
parameters.

## Security

The site has no third-party runtime dependencies, analytics, cookies, or
remote scripts. Azure Static Web Apps applies a restrictive Content Security
Policy and other defensive response headers from
`public/staticwebapp.config.json`. Only the `public` directory is deployed.
GitHub Actions are pinned to commit SHAs and tracked by Dependabot.
