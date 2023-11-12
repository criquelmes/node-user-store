import fs from "fs";
import path from "path";
import { UploadedFile } from "express-fileupload";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";

export class FileUploadService {
  constructor(private readonly uuid = Uuid.v4) {}

  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }

  public async uploadSingle(
    file: UploadedFile,
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif"]
  ) {
    try {
      const fileExtension = file.mimetype.split("/").at(1) ?? "";
      if (!validExtensions.includes(fileExtension))
        throw CustomError.badRequest(
          `Invalid file extension: ${fileExtension}, valid ones:  ${validExtensions}`
        );

      const destination = path.resolve(__dirname, "../../../", folder);
      this.checkFolder(destination);

      const filename = `${this.uuid()}.${fileExtension}`;

      file.mv(`${destination}/${filename}`);

      return { filename };
    } catch (error) {
      throw error;
    }
  }

  public async uploadMultiple(
    files: UploadedFile[],
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif"]
  ) {
    const fileNames = await Promise.all(
      files.map((file) => this.uploadSingle(file, folder, validExtensions))
    );

    return fileNames;
  }
}
