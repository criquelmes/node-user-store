import fs from "fs";
import path from "path";
import { UploadedFile } from "express-fileupload";

export class FileUploadService {
  constructor() {}

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
      const fileExtension = file.mimetype.split("/").at(1);
      const destination = path.resolve(__dirname, "../../../", folder);
      this.checkFolder(destination);

      file.mv(destination + `/mi-imagen.${fileExtension}`);
    } catch (error) {
      console.log({ error });
    }
  }

  public uploadMultiple(
    file: any[],
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif"]
  ) {}
}
