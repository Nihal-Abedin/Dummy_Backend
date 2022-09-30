const configuration = require("../configuration");
const express = require('express');
const path = require('path');
const ApiError = require('../common/api-error');
const FileUtilities = require('../common/file-utilities');
const router = express.Router();

router.post('/', async (request, response, next) => {
  try {
    const file = request.files?.file;

    if (!file) { throw new ApiError(400, 'No file provided.'); }

    // generates new file name...
    const fileName = FileUtilities.generateFileName(configuration.uploads.directoryPath,
      file.name, configuration.uploads.fileNameLength);
    const filePath = path.join(configuration.uploads.directoryPath, fileName);
    const isFileMoved = await FileUtilities.moveFileAsync(filePath, file);

    if (!isFileMoved) {
      throw new Error('An error occurred during file upload.');
    }

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'File uploaded successfully.',
      data: {
        fileName: fileName,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:fileName', async (request, response, next) => {
  try {
    const fileName = request.params.fileName;
    const filePath = path.join(configuration.uploads.directoryPath, fileName);

    if (!FileUtilities.exists(filePath)) {
      throw new ApiError(404, 'Requested file was not found.');
    }

    const file = request.files?.file;

    if (!file) { throw new ApiError(400, 'No file provided.'); }

    const isFileMoved = await FileUtilities.moveFileAsync(filePath, file);

    if (!isFileMoved) {
      throw new Error('An error occurred during file upload.');
    }

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'File updated successfully.',
      data: {
        fileName: fileName,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:fileName', async (request, response, next) => {
  try {
    const fileName = request.params.fileName;
    const filePath = path.join(configuration.uploads.directoryPath, fileName);

    if (!FileUtilities.exists(filePath)) {
      throw new ApiError(404, 'Requested file was not found.');
    }

    // deletes existing file...
    const isFileDeleted = await FileUtilities.deleteFileAsync(filePath);

    if (!isFileDeleted) {
      throw new Error('An error occurred while deleting the requested file.');
    }

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'File deleted successfully.',
      data: {
        fileName: fileName,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
