[![License: MIT](https://img.shields.io/github/license/AtidaTech/contentful-cli-export)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/contentful-cli-export)](https://npmjs.com/package/contentful-cli-export)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/AtidaTech/contentful-cli-export)
![Downloads](https://img.shields.io/npm/dw/contentful-cli-export)
![Forks](https://img.shields.io/github/forks/AtidaTech/contentful-cli-export)
[![Bun.sh](https://img.shields.io/badge/bun.sh-compatible-orange)](https://bun.sh)

# Contentful Export Tool

This tool simplifies exporting data from Contentful to a local json file. It's easier to use than the actual Contentful CLI export and can also be easily integrated into a CI/CD pipeline such as GitLab or GitHub.

> Note: This is NOT the official Contentful CLI Export tool. That can be found on [GitHub 🔗](https://github.com/contentful/contentful-cli) or [NpmJS 🔗](https://www.npmjs.com/package/contentful-cli)

<h3>Sponsored by <a href="https://github.com/AtidaTech"><b>Atida</b> <img src="https://avatars.githubusercontent.com/u/127305035?s=200&v=4" width="14px;" alt="Atida" /></a></h3>

<hr />

[✨ Features](#-features) · [💡 Installation](#-installation) · [📟 Example](#-example) · [🎹 Usage](#-usage) · [📅 ToDo](#-todo) · [👾 Contributors](#-contributors) · [🎩 Acknowledgments](#-acknowledgements)· [📚 Collection](#-other-scripts-in-the-same-collection)  · [📄 License](#-license)

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

> Similarly, if you are using [Bun 🔗](https://bun.sh), just run<br />`bun add contentful-cli-export`

### Requirements

* `node` >= 16.0.0
* `npm` >= 8.19.4
* `contentful-management` >= 7.50.0 
* `contentful-export` >= 7.18.7
* [contentful-lib-helpers](https://www.npmjs.com/package/contentful-lib-helpers) >= 0.1.10

### Set-up

* To better use the Contentful CLI Export, it is recommended to put the following values in your `.env`/`.env.local` file:

    ```shell
    CMS_MANAGEMENT_TOKEN=<management-token>
    CMS_SPACE_ID=<space-id>
    CMS_MAX_ALLOWED_LIMIT=100
    CMS_EXPORT_DIR=export/
    ```

    However, these values could also be passed as parameters during execution.

* You will need to create the `CMS_EXPORT_DIR` folder, that will contain all the exports. This folder should stay preferably in the root of your project. 
If no folder is specified, a folder `export/` will be created automatically if missing.

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
* `--export-dir`: To specify a custom directory for the exported data (default is sub-directory `CMS_EXPORT_DIR` or `export/` in your project root). The script will exit if this custom folder doesn't exist.
* `--max-allowed-limit`: Number of entries to fetch at each iteration. Max: `1000` - Recommended: `100` (lower values fire more API calls, but avoid 'Response too big' error).

## 📅 Todo

* Add compatibility with official Contentful Export env/settings.
* Improve Logging (+ Colors).
* Add Tests.

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

## 📚 Other Scripts in the same collection

We produce a bunch of interesting packages for Contentful. You might want to check them out:

* **Contentful Lib Helpers** ([GitHub](https://github.com/AtidaTech/contentful-lib-helpers/) and [NpmJS](https://www.npmjs.com/package/contentful-lib-helpers)): Utility Library for Contentful CMS.
* **Contentful CLI Export** ([GitHub](https://github.com/AtidaTech/contentful-cli-export/) and [NpmJS](https://www.npmjs.com/package/contentful-cli-export)): Simplifies making Backup of your Environment.
* **Contentful CLI Migrations** ([GitHub](https://github.com/AtidaTech/contentful-cli-migrations/) and [NpmJS](https://www.npmjs.com/package/contentful-cli-migrations)): Automating Contentful Migrations.

[//]: # (* **Contentful CLI Release** &#40;[GitHub]&#40;https://github.com/AtidaTech/contentful-cli-release/&#41; and [NpmJS]&#40;https://www.npmjs.com/package/contentful-cli-release&#41;&#41;: Easy Environments sync at deployment.)

[//]: # (* **Contentful CLI Sync** &#40;[GitHub]&#40;https://github.com/AtidaTech/contentful-cli-sync/&#41; and [NpmJS]&#40;https://www.npmjs.com/package/contentful-cli-sync&#41;&#41;: Contentful tool to sync data across Spaces and Environments.)

## 📄 License
This project is licensed under the [MIT License](LICENSE)
