[![License: MIT](https://img.shields.io/github/license/AtidaTech/contentful-cli-export)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/contentful-cli-export)](https://npmjs.com/package/contentful-cli-export)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/AtidaTech/contentful-cli-export)
![Downloads](https://img.shields.io/npm/dw/contentful-cli-export)
![Forks](https://img.shields.io/github/forks/AtidaTech/contentful-cli-export)

# Contentful Export Tool

This tool simplifies exporting data from Contentful to a local json file. It's easier to use than the actual Contentful CLI export and can also be easily integrated into a CI/CD pipeline such as GitLab or GitHub.

> Note: This is NOT the official Contentful CLI Export tool. That can be found on [GitHub 🔗](https://github.com/contentful/contentful-cli) or [NpmJS 🔗](https://www.npmjs.com/package/contentful-cli)

<h3>Sponsored by <a href="https://github.com/AtidaTech"><b>Atida</b> <img src="https://avatars.githubusercontent.com/u/127305035?s=200&v=4" width="14px;" alt="Atida" /></a></h3>

<hr />

[✨ Features](#-features) · [💡 Installation](#-installation) · [📟 Example](#-example) · [🎹 Usage](#-usage) · [📅ToDo](#-todo) · [👾Contributors](#-contributors) · [🎩Acknowledgments](#-acknowledgements) · [📄License](#-license)

<hr />

## ✨ Features

- **Ease of Use:** Compared to the actual Contentful CLI, this tool requires less manual configuration and is more straightforward to use.
- **CI/CD Pipeline Integration:** It is designed to be used as part of a CI/CD pipeline, like GitLab or GitHub. Differently from the official Contentful CLI, it doesn't require a global installation, making it portable and easy to run in various environments.
- **Command Line Parameters:** All necessary parameters can be passed via command line arguments, making it flexible for different use cases. These include management-token, space-id and environment-id, making it even more suitable for being integrated into a release pipeline.
- **ZIP Compression:** This tool provides an option to compress the result into a ZIP file. This is particularly useful when exporting large amounts of data or assets, helping to save storage space.
- **Consistent Naming:** The naming of the output files (.json, .zip, and .log) are consistent and predictable, making it easier to manage the exported data (current date + space-id + environment-id).

## 💡 Installation

To use this cli script, you must have [NodeJS 🔗](https://nodejs.org/) and [npm 🔗](http://npmjs.org) installed.

To install it, simply run:

```shell
npm install contentful-cli-export --save
```

Or, if using [yarn 🔗](https://yarnpkg.com/lang/en/):

```shell
yarn add contentful-cli-export
```

### Requirements

* `node` >= 14.0.0
* `npm` >= 8.5.5
* `contentful-management` >= 7.50.0 
* `contentful-export` >= 7.18.7
* [contentful-lib-helpers](https://www.npmjs.com/package/contentful-lib-helpers) >= 1.8.0

### Set-up

* To better use the Contentful CLI Export, it is recommended to put the following values in your `.env`/`.env.local` file:

    ```shell
    CMS_MANAGEMENT_TOKEN=<management-token>
    CMS_SPACE_ID=<space-id>
    CMS_MAX_ALLOWED_LIMIT=100
    ```

    However, these values could also be passed as parameters during execution.

* Also, it is needed that you create an `export/` folder in the root of your project. It will contain all the exports.

## 📟 Example

The basic command should contain the `from` environment we want to export from:

```shell
npx contentful-cli-export --from "<environment-id>"
```

A more complex export command could be

```shell
npx contentful-cli-export --from "<environment-id>" --space-id"<space-id>" --management-token "<management-token>" --compress
```

This will export data from the specified environment-id, space-id, and management token, and compress the result into a ZIP file.

## 🎹 Usage

This script can be used from the command line and accepts various arguments for customization:

* `--from` or `--environment-id` [MANDATORY]: The environment id from which data will be exported.
* `--space-id`: The Contentful space id.
* `--management-token` or `--mt`: The Contentful Management Token.
* `--only-published`: To include only published data.
* `--download-assets`: To include assets in the exported data.
* `--verbose`: Display the progress in new lines, instead of animated UI (useful in CI).
* `--compress`: To compress the result into a ZIP file.
* `--export-dir`: To specify a custom directory for the exported data (default is sub-directory `export/` in your project root).
* `--max-allowed-limit`: Number of entries to fetch at each iteration. Max: `1000` - Recommended: `100` (lower values fire more API calls, but avoid 'Response too big' error).

## 📅 Todo

* Add compatibility with official Contentful Export env/settings.

## 👾 Contributors

<table>
  <tr>
    <td align="center"><a href="https://github.com/fciacchi"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/58506?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Fabrizio Ciacchi" /><br /><sub><b>@fciacchi</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/psyvic"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/29251597?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Victor Hugo Aizpuruo" /><br /><sub><b>@psyvic</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/aalduz"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/11409770?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Aldo Fernández" /><br /><sub><b>@aalduz</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/leslyto"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/4264812?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Stefan Stoev" /><br /><sub><b>@leslyto</b></sub></a><br /></td>
  </tr>
</table>

### Contributions
Feel free to open issues or pull requests in our GitHub Repository if you have suggestions or improvements to propose.

## 🎩 Acknowledgements

I would like to express my gratitude to the following parties:

- [Atida 🔗](https://www.atida.com/), the company that has allowed these scripts to be open sourced. Atida is an e-commerce platform that sells beauty and medical products. Their support for open source is greatly appreciated. A special thank to <a href="https://github.com/shoopi"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/1385372?v=4&h=16&w=16&fit=cover&mask=circle&maxage=7d" width="16px;" alt="Shaya Pourmirza" /> Shaya Pourmirza</a> that has been a great promoter and supporter of this initiative inside the company.
- [Contentful 🔗](https://www.contentful.com/), for creating their excellent content management platform and the JavaScript CMA SDK that this library is built on. Without their work, this project would not be possible.

Thank you to everyone involved!

## 📄 License
This project is licensed under the [MIT License](LICENSE)
