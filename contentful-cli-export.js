#! /usr/bin/env node

const DELETE_FOLDER_DELAY = 5000
const PLACEHOLDER_MANAGEMENT_TOKEN = 'placeholder-management-token'
const PLACEHOLDER_SPACE_ID = 'placeholder-space-id'
const DEFAULT_ALLOWED_LIMIT = 100
const DEFAULT_EXPORT_DIR = 'export/'

;(async function main() {
  try {
    const localWorkingDir = process.cwd()
    const scriptDirectory = await getDirNamePath()

    const envValues = await getEnvValues(localWorkingDir, scriptDirectory)

    const cmsManagementToken =
      envValues?.CMS_MANAGEMENT_TOKEN ?? PLACEHOLDER_MANAGEMENT_TOKEN
    const cmsSpaceId = envValues?.CMS_SPACE_ID ?? PLACEHOLDER_SPACE_ID
    const cmsMaxEntries =
      parseInt(envValues?.CMS_MAX_ALLOWED_LIMIT, 10) ?? DEFAULT_ALLOWED_LIMIT
    const cmsExportDir = envValues?.CMS_EXPORT_DIR ?? DEFAULT_EXPORT_DIR

    const initialSettings = await parseArguments(
      localWorkingDir,
      cmsExportDir,
      cmsManagementToken,
      cmsSpaceId,
      cmsMaxEntries
    )

    const options = await extractOptions(initialSettings)
    await performExport(options, initialSettings)
  } catch (error) {
    console.error('@@/ERROR:', error)
  }
})()

/**
 * Reads environment values from .env files.
 *
 * @param {string} localWorkingDir - The directory path where the library is located.
 * @param {string} scriptDirectory - The directory path where the script is running.
 * @return {Promise<object>} The environment values.
 * @property {string} CMS_MANAGEMENT_TOKEN - The CMA token for Contentful.
 * @property {string} CMS_SPACE_ID - The Space ID.
 * @property {string|number} CMS_MAX_ALLOWED_LIMIT - The maximum number of entries per query.
 * @property {string} CMS_EXPORT_DIR - The default export dir from the working directory.
 *
 */
async function getEnvValues(localWorkingDir, scriptDirectory) {
  const { existsSync } = await import('fs')
  const { config } = await import('dotenv')

  const envDataFromPath = path =>
    existsSync(path) ? config({ path }).parsed : {}

  const paths = [
    `${scriptDirectory}/../../.env`,
    `${scriptDirectory}/../../.env.local`,
    `${localWorkingDir}/.env`,
    `${localWorkingDir}/.env.local`
  ]

  const envValues = paths.map(envDataFromPath)

  return Object.assign({}, ...envValues)
}

/**
 * Parses command line arguments and sets default values.
 *
 * @param {string} rootFolder - The directory path where the .env files are located.
 * @param {string} cmsExportDir - The CMS Default Export Directory.
 * @param {string} cmsManagementToken - The CMS Management Token.
 * @param {string} cmsSpaceId - The CMS Space ID.
 * @param {number} [cmsMaxEntries=100] - The CMS Max Entries to fetch at each iteration.
 * @returns {Promise<object>} The initial settings.
 * @property {string} spaceId - The CMS Space ID.
 * @property {string} environmentId - The CMS Environment ID.
 * @property {string} managementToken - The CMS Management Token.
 * @property {number} maxEntries - The maximum entries to be fetched in each iteration.
 * @property {string} rootDestinationFolder - The root destination folder for exports.
 * @property {string} defaultExportName - The default name for the export.
 * @property {boolean} includeDrafts - Boolean indicating whether to include drafts.
 * @property {boolean} includeAssets - Boolean indicating whether to include assets.
 * @property {boolean} isVerbose - Boolean indicating verbose mode.
 * @property {boolean} shouldCompressFolder - Boolean indicating whether to compress folder.
 *
 * @throws {Error} If '--environment-id' or '--from' are not provided or if '--management-token' or '--mt' are duplicated.
 */
async function parseArguments(
  rootFolder,
  cmsExportDir,
  cmsManagementToken,
  cmsSpaceId,
  cmsMaxEntries = DEFAULT_ALLOWED_LIMIT
) {
  const minimist = (await import('minimist')).default
  const dateFormat = (await import('dateformat')).default

  const parsedArgs = minimist(process.argv.slice(2))
  await checkArgs(parsedArgs)

  const {
    'space-id': spaceId = cmsSpaceId,
    'management-token': managementToken = parsedArgs['mt'] ??
      cmsManagementToken,
    'max-allowed-limit': maxEntries = cmsMaxEntries
  } = parsedArgs

  const rootDestinationFolder = await getDestinationFolder(
    rootFolder,
    cmsExportDir,
    parsedArgs
  )

  const environmentId = parsedArgs.from || parsedArgs['environment-id']
  if (!environmentId) {
    console.error('@@/ERROR: An environment-id should be specified')
    process.exit(1)
  }

  const now = new Date()
  const currentDate = dateFormat(now, 'yyyy-mm-dd-HH-MM-ss')
  const defaultExportName = currentDate + '-' + spaceId + '-' + environmentId

  return {
    managementToken,
    spaceId,
    environmentId,
    maxEntries,
    rootDestinationFolder,
    defaultExportName,
    includeDrafts: !parsedArgs.hasOwnProperty('only-published'),
    includeAssets: parsedArgs.hasOwnProperty('download-assets'),
    isVerbose: parsedArgs.hasOwnProperty('verbose'),
    shouldCompressFolder: parsedArgs.hasOwnProperty('compress')
  }
}

/**
 * This function checks the arguments passed in the command line.
 *
 * @param {Object} parsedArgs - The object that contains the parsed command line arguments.
 * @property {string} parsedArgs.from - The FROM environment
 * @property {string} parsedArgs.environment-id - The FROM environment
 * @property {string} parsedArgs.mt - The Contentful Management Token
 * @property {string} parsedArgs.management-token - The Contentful Management Token
 * @returns {Promise<void>} If it pass through, the arguments are validated.
 *
 * @throws {Error} If both 'from' and 'environment-id' options are specified or if neither is specified.
 * @throws {Error} If both 'management-token' and 'mt' options are specified.
 */
async function checkArgs(parsedArgs) {
  if (!(Boolean(parsedArgs.from) ^ Boolean(parsedArgs['environment-id']))) {
    console.error(
      "@@/ERROR: Only one of the two options '--environment-id' or '--from' should be specified"
    )
    process.exit(1)
  }

  if (Boolean(parsedArgs['management-token']) && Boolean(parsedArgs.mt)) {
    console.error(
      "@@/ERROR: Only one of the two options '--management-token' or '--mt' can be specified"
    )
    process.exit(1)
  }
}

/**
 * This function gets the destination folder based on whether a custom folder is provided or not.
 *
 * @param {string} rootFolder - The directory path where the script is being executed.
 * @param {string} cmsExportDir - The CMS Default Export Directory.
 * @param {Object} parsedArgs - The object that contains the parsed command line arguments.
 *
 * @returns {Promise<string>} The path of the evaluated destination folder.
 * @property {string} destinationFolder - The destination folder for the export.
 *
 * @throws {Error} If the destination folder does not exist or is not accessible.
 */
async function getDestinationFolder(rootFolder, cmsExportDir, parsedArgs) {
  const fileSystem = await import('fs')

  const defaultExportDirectory = cmsExportDir.startsWith('/')
    ? cmsExportDir
    : `${rootFolder}/${cmsExportDir}`

  let destinationFolder = parsedArgs['export-dir'] || defaultExportDirectory
  destinationFolder = destinationFolder.replace(/\/$/, '') + '/'

  // Create destination folder if not present
  const destinationFolderExists = fileSystem.existsSync(destinationFolder)
  if (!parsedArgs['export-dir'] && !destinationFolderExists) {
    fileSystem.mkdirSync(destinationFolder)
  }

  if (!fileSystem.existsSync(destinationFolder) || destinationFolder === '/') {
    console.error(
      '@@/ERROR: Destination folder does not exist or is not accessible!'
    )
    process.exit(1)
  }

  return destinationFolder
}

/**
 * Extracts Contentful exporter options from the initial settings.
 *
 * @param {object} initialSettings - The initial settings obtained from command line arguments and .env files.
 * @property {string} initialSettings.spaceId - The CMS Space ID.
 * @property {string} initialSettings.environmentId - The CMS Environment ID.
 * @property {string} initialSettings.managementToken - The CMS Management Token.
 * @property {number} initialSettings.maxEntries - The maximum entries to be fetched in each iteration.
 * @property {string} initialSettings.rootDestinationFolder - The root destination folder for exports.
 * @property {string} initialSettings.defaultExportName - The default name for the export.
 * @property {boolean} initialSettings.includeDrafts - Boolean indicating whether to include drafts.
 * @property {boolean} initialSettings.includeAssets - Boolean indicating whether to include assets.
 * @property {boolean} initialSettings.isVerbose - Boolean indicating verbose mode.
 * @property {boolean} initialSettings.shouldCompressFolder - Boolean indicating whether to compress folder.
 * @return {Promise<import("contentful-export/types.js").Options>} The options for performing the export.
 */
async function extractOptions(initialSettings) {
  const contentfulManagement = (await import('contentful-management')).default
  const lib = await import('contentful-lib-helpers')
  const fileSystem = await import('fs')

  // Set up filename for export file and log
  const isCompressed = initialSettings?.shouldCompressFolder
  const rootFolder = initialSettings.rootDestinationFolder
  const defaultExportName = initialSettings?.defaultExportName
  const exportDirname = rootFolder + defaultExportName + '/'
  const mainFolder = isCompressed ? rootFolder : exportDirname

  let contentFile = defaultExportName + '.json'
  let logFilePath = mainFolder + defaultExportName + '.log'

  if (
    !(await lib.getEnvironment(
      contentfulManagement,
      initialSettings.managementToken,
      initialSettings.spaceId,
      initialSettings.environmentId,
      0
    ))
  ) {
    console.error(
      "@@/ERROR: Unable to retrieve Destination environment-id '" +
        initialSettings?.environmentId +
        "' for space-id '" +
        initialSettings?.spaceId +
        "'!"
    )
    console.error(
      '@@/ERROR: Could also be that the management token or space-id are invalid.'
    )
    process.exit(1)
  }

  fileSystem.mkdirSync(exportDirname)

  console.log(
    '##/INFO: Export of space-id "' +
      initialSettings?.spaceId +
      '" and environment-id "' +
      initialSettings?.environmentId +
      '" started...'
  )
  console.log(
    '##/INFO: Using destination: ' +
      (isCompressed ? mainFolder + defaultExportName + '.zip' : mainFolder)
  )

  return {
    managementToken: initialSettings?.managementToken,
    spaceId: initialSettings?.spaceId,
    environmentId: initialSettings?.environmentId,
    exportDir: exportDirname,
    contentFile: contentFile,
    saveFile: true,
    includeDrafts: initialSettings?.includeDrafts,
    includeArchived: initialSettings?.includeDrafts,
    downloadAssets: initialSettings?.includeAssets,
    errorLogFile: logFilePath,
    useVerboseRenderer: initialSettings?.isVerbose,
    maxAllowedLimit: initialSettings?.maxEntries
  }
}

/**
 * Performs the export based on the provided options.
 *
 * @param {import("contentful-export/types.js").Options} options - The options for performing the export.
 * @param {object} initialSettings - The initial settings obtained from command line arguments and .env files.
 * @property {string} initialSettings.spaceId - The CMS Space ID.
 * @property {string} initialSettings.environmentId - The CMS Environment ID.
 * @property {string} initialSettings.managementToken - The CMS Management Token.
 * @property {number} initialSettings.maxEntries - The maximum entries to be fetched in each iteration.
 * @property {string} initialSettings.rootDestinationFolder - The root destination folder for exports.
 * @property {string} initialSettings.defaultExportName - The default name for the export.
 * @property {boolean} initialSettings.includeDrafts - Boolean indicating whether to include drafts.
 * @property {boolean} initialSettings.includeAssets - Boolean indicating whether to include assets.
 * @property {boolean} initialSettings.isVerbose - Boolean indicating verbose mode.
 * @property {boolean} initialSettings.shouldCompressFolder - Boolean indicating whether to compress folder.
 *
 * @throws {Error} If there is an error during the ZIP file compress
 */
async function performExport(options, initialSettings) {
  const contentfulExport = (await import('contentful-export')).default
  const admZip = (await import('adm-zip')).default
  const fileSystem = await import('fs')

  await contentfulExport(options)

  const rootExportFolder = initialSettings?.rootDestinationFolder
  const defaultExportName = initialSettings?.defaultExportName

  const destinationFolder = await buildFilePath(
    rootExportFolder,
    defaultExportName + '/'
  )
  const contentFile = await buildFilePath(
    destinationFolder,
    defaultExportName,
    'json'
  )
  let logFile = await buildFilePath(destinationFolder, defaultExportName, 'log')
  let zipFile = await buildFilePath(rootExportFolder, defaultExportName, 'zip')

  if (initialSettings?.shouldCompressFolder) {
    console.log('##/INFO: Assets exported. Creating the ZIP File')

    if (fileSystem.existsSync(destinationFolder)) {
      const zip = new admZip()
      logFile = await buildFilePath(rootExportFolder, defaultExportName, 'log')

      zip.addLocalFolder(destinationFolder, '', '', 0o644)
      zip.writeZip(zipFile, deleteFolderAfterZip(destinationFolder))
    } else {
      throw new Error('Error happened during ZIP file compression')
    }
  }

  console.log('##/INFO: Export completed')
  console.log('##/INFO: File Saved at:')
  console.log(
    '##/INFO: ' +
      (initialSettings?.shouldCompressFolder ? zipFile : contentFile)
  )
  console.log('##/INFO: Log file (if present) at:')
  console.log('##/INFO: ' + logFile)
}

/**
 * Gets the current directory's path.
 *
 * @return {Promise<string>} The path of the current directory.
 */
async function getDirNamePath() {
  const { fileURLToPath } = await import('url')
  const { dirname } = await import('path')

  const __filename = fileURLToPath(import.meta.url)
  return dirname(__filename)
}

/**
 * Constructs a file path based on the provided parameters.
 *
 * @param {string} rootFolder - The root folder for the file path.
 * @param {string} [fileName=''] - The name of the file or subdirectory. If only `fileName` is provided, it is treated as a subdirectory.
 * @param {string} [ext=''] - The file extension. If only `ext` is provided, `fileName` is treated as the extension.
 *
 * @returns {Promise<string>} - The constructed file path.
 *
 * @example
 * buildFilePath('/rootFolder', 'subdirectory');
 * // Returns: '/rootFolder/subdirectory'
 *
 * @example
 * buildFilePath('/rootFolder', 'file', 'json');
 * // Returns: '/rootFolder/file.json'
 *
 * @example
 * buildFilePath('/rootFolder', '', 'zip');
 * // Returns: '/rootFolder.zip'
 */
async function buildFilePath(rootFolder, fileName = '', ext = '') {
  let filePath = rootFolder

  filePath += fileName ? `${fileName}` : ''
  filePath += ext ? `.${ext}` : ''

  return filePath
}

/**
 * Deletes the temporary destination folder after the ZIP file has been created.
 *
 * @param {string} destinationFolder - The folder to delete.
 * @return {Promise<boolean>} The result of the deletion operation.
 */
async function deleteFolderAfterZip(destinationFolder) {
  const fileSystem = await import('fs')

  console.log('##/INFO: Deleting Temporary Destination Folder.... ')
  setTimeout(() => {
    // Delete folder and json (leave only the zip file)
    fileSystem.rmSync(destinationFolder, { recursive: true })
  }, DELETE_FOLDER_DELAY)

  return true
}
