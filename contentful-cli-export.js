#! /usr/bin/env node

const DELETE_FOLDER_DELAY = 5000

;(async function main() {
  try {
    const localeWorkingDir = process.cwd()
    const envValues = await getEnvValues(
      localeWorkingDir,
      await getDirNamePath()
    )

    const cmsSpaceId = envValues?.CMS_SPACE_ID ?? 'placeholder-space-id'
    const cmsManagementToken =
      envValues?.CMS_MANAGEMENT_TOKEN ?? 'placeholder-management-token'

    const initialSettings = await parseArguments(
      localeWorkingDir,
      cmsSpaceId,
      cmsManagementToken
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
 * @param {string} localWorkingDir - The directory path where the .env files are located.
 * @param {string} scriptDirectory - The directory path where the library is installed
 * @return {Promise<object>} The environment values.
 */
async function getEnvValues(localWorkingDir, scriptDirectory) {
  const fileSystem = await import('fs')
  const dotenv = await import('dotenv')

  // Trying to find out where the user's '.env' and '.env.local' files are
  const rootBasicExists = fileSystem.existsSync(scriptDirectory + '/../../.env')
  const rootLocalExists = fileSystem.existsSync(
    scriptDirectory + '/../../.env.local'
  )
  const activeBasicExists = fileSystem.existsSync(localWorkingDir + '/.env')
  const activeLocalExists = fileSystem.existsSync(
    localWorkingDir + '/.env.local'
  )

  // Get the data from DotEnv
  const rootBasicEnv = rootBasicExists
    ? dotenv.config({ path: scriptDirectory + '/../../.env' }).parsed
    : {}
  const rootLocalEnv = rootLocalExists
    ? dotenv.config({ path: scriptDirectory + '/../../.env.local' }).parsed
    : {}
  const activeBasicEnv = activeBasicExists
    ? dotenv.config({ path: '.env' }).parsed
    : {}
  const activeLocalEnv = activeLocalExists
    ? dotenv.config({ path: '.env.local' }).parsed
    : {}

  return {
    ...rootBasicEnv,
    ...rootLocalEnv,
    ...activeBasicEnv,
    ...activeLocalEnv
  }
}

/**
 * Parses command line arguments and sets default values.
 *
 * @param {string} dirNamePath - The directory path where the .env files are located.
 * @param {string} cmsSpaceId - The CMS Space ID.
 * @param {string} cmsManagementToken - The CMS Management Token.
 * @return {Promise<object>} The initial settings.
 */
async function parseArguments(dirNamePath, cmsSpaceId, cmsManagementToken) {
  const minimist = (await import('minimist')).default
  const fileSystem = await import('fs')
  const dateFormat = (await import('dateformat')).default

  // Some default variables
  let environmentId = 'placeholder-environment-id'
  let shouldIncludeDrafts = true
  let shouldIncludeAssets = false
  let isVerbose = false
  let shouldCompressFolder = false
  let spaceId = cmsSpaceId
  let managementToken = cmsManagementToken

  let parsedArgs = minimist(process.argv.slice(2))
  if (
    parsedArgs.hasOwnProperty('from') &&
    parsedArgs.hasOwnProperty('environment-id')
  ) {
    console.error(
      "@@/ERROR: Only one of the two options '--environment-id' or '--from' can be specified"
    )
    process.exit(1)
  }

  if (
    parsedArgs.hasOwnProperty('from') ||
    parsedArgs.hasOwnProperty('environment-id')
  ) {
    environmentId = parsedArgs.from ?? parsedArgs['environment-id']
  } else {
    console.error('@@/ERROR: An environment-id should be specified')
    process.exit(1)
  }

  if (parsedArgs.hasOwnProperty('space-id')) {
    spaceId = parsedArgs['space-id']
  }

  if (
    parsedArgs.hasOwnProperty('management-token') &&
    parsedArgs.hasOwnProperty('mt')
  ) {
    console.error(
      "@@/ERROR: Only one of the two options '--management-token' or '--mt' can be specified"
    )
    process.exit(1)
  }

  if (
    parsedArgs.hasOwnProperty('management-token') ||
    parsedArgs.hasOwnProperty('mt')
  ) {
    managementToken = parsedArgs['management-token'] ?? parsedArgs['mt']
  }

  if (parsedArgs.hasOwnProperty('only-published')) {
    shouldIncludeDrafts = false
  }

  if (parsedArgs.hasOwnProperty('download-assets')) {
    shouldIncludeAssets = true
  }

  if (parsedArgs.hasOwnProperty('verbose')) {
    isVerbose = true
  }

  if (parsedArgs.hasOwnProperty('compress')) {
    shouldCompressFolder = true
  }

  let destinationFolder = dirNamePath + '/export/'
  let isDestinationFolderCustom = false

  if (parsedArgs.hasOwnProperty('export-dir')) {
    destinationFolder = parsedArgs['export-dir']
    isDestinationFolderCustom = true
  }

  if (!destinationFolder.endsWith('/')) {
    destinationFolder += '/'
  }

  // Create destination folder if not present
  let destinationFolderExists = fileSystem.existsSync(destinationFolder)
  if (!isDestinationFolderCustom && !destinationFolderExists) {
    fileSystem.mkdirSync(destinationFolder)
  }

  destinationFolderExists = fileSystem.existsSync(destinationFolder)
  if (!destinationFolderExists || destinationFolder === '/') {
    console.error(
      '@@/ERROR: Destination folder does not exist or not accessible!'
    )
    process.exit(1)
  }

  const now = new Date()
  const currentDate = dateFormat(now, 'yyyy-mm-dd-HH-MM-ss')
  const defaultExportName = currentDate + '-' + spaceId + '-' + environmentId

  return {
    spaceId: spaceId,
    environmentId: environmentId,
    managementToken: managementToken,
    includeDrafts: shouldIncludeDrafts,
    includeAssets: shouldIncludeAssets,
    isVerbose: isVerbose,
    shouldCompressFolder: shouldCompressFolder,
    rootDestinationFolder: destinationFolder,
    defaultExportName: defaultExportName
  }
}

/**
 * Extracts Contentful exporter options from the initial settings.
 *
 * @param {object} initialSettings - The initial settings obtained from command line arguments and .env files.
 * @return {Promise<object>} The options for performing the export.
 */
async function extractOptions(initialSettings) {
  const contentfulManagement = (await import('contentful-management')).default
  const lib = await import('contentful-lib-helpers')
  const fileSystem = await import('fs')

  // Set up filename for export file and log
  const defaultExportName = initialSettings?.defaultExportName
  const exportDirname =
    initialSettings.rootDestinationFolder + defaultExportName + '/'

  fileSystem.mkdirSync(exportDirname)

  let contentFile = defaultExportName + '.json'
  let logFilePath =
    (initialSettings?.shouldCompressFolder
      ? initialSettings.rootDestinationFolder
      : exportDirname) +
    defaultExportName +
    '.log'

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
      "@@/ERROR: Unable to retrieve Destination environment '" +
        initialSettings?.environmentId +
        "'!"
    )
    console.error(
      '@@/ERROR: Could also be that the management token or space-id are invalid.'
    )
    process.exit(1)
  }

  console.log(
    '##/INFO: Export of space-id "' +
      initialSettings?.spaceId +
      '" and environment-id "' +
      initialSettings?.environmentId +
      '" started...'
  )
  console.log('##/INFO: Using destination folder: ' + exportDirname)

  return {
    spaceId: initialSettings.spaceId,
    managementToken: initialSettings.managementToken,
    environmentId: initialSettings.environmentId,
    exportDir: exportDirname,
    contentFile: contentFile,
    saveFile: true,
    includeDrafts: initialSettings.includeDrafts,
    includeArchived: initialSettings.includeDrafts,
    downloadAssets: initialSettings.includeAssets,
    errorLogFile: logFilePath,
    useVerboseRenderer: initialSettings.isVerbose,
    maxAllowedLimit: 100
  }
}

/**
 * Performs the export based on the provided options.
 *
 * @param {object} options - The options for performing the export.
 * @param {object} initialSettings - The initial settings obtained from command line arguments and .env files.
 */
async function performExport(options, initialSettings) {
  const contentfulExport = (await import('contentful-export')).default
  const admZip = (await import('adm-zip')).default
  const fileSystem = await import('fs')

  contentfulExport(options).then(() => {
    const rootExportFolder = initialSettings?.rootDestinationFolder
    const defaultExportName = initialSettings?.defaultExportName
    const destinationFolder = rootExportFolder + defaultExportName + '/'
    const contentFile = destinationFolder + defaultExportName + '.json'
    let logFile = destinationFolder + defaultExportName + '.log'

    if (initialSettings?.shouldCompressFolder) {
      // Zip both the folder and json file
      if (fileSystem.existsSync(destinationFolder)) {
        console.log('##/INFO: Assets exported. Creating the ZIP File')
        let zipFile = rootExportFolder + defaultExportName + '.zip'
        logFile = rootExportFolder + defaultExportName + '.log'

        const zip = new admZip()
        zip.addLocalFolder(destinationFolder)
        zip.writeZip(zipFile, deleteFolderAfterZip(destinationFolder))

        console.log('##/INFO: Export completed')
        console.log('##/INFO: File Saved at:')
        console.log('##/INFO: ' + zipFile)
        console.log('##/INFO: Log file (if present) at:')
        console.log('##/INFO: ' + logFile)
      } else {
        console.error('@@/ERROR: Error happens during ZIP file compression')
      }
    } else {
      console.log('##/INFO: Export completed')
      console.log('##/INFO: File Saved at:')
      console.log('##/INFO: ' + contentFile)
      console.log('##/INFO: Log file (if present) at:')
      console.log('##/INFO: ' + logFile)
    }
  })
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
 * Deletes the temporary destination folder after the ZIP file has been created.
 *
 * @param {string} destinationFolder - The folder to delete.
 * @return {Promise<boolean>} The result of the deletion operation.
 */
async function deleteFolderAfterZip(destinationFolder) {
  const fileSystem = await import('fs')

  console.log('Deleting Temporary Destination Folder.... ')
  setTimeout(() => {
    // Delete folder and json (leave only the zip file)
    fileSystem.rmdirSync(destinationFolder, { recursive: true })
  }, DELETE_FOLDER_DELAY)

  return true
}
