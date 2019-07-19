export class Folder {
  name: string;
  files: string[] | null;
  pictureErrorMessages: string[] | null;

  constructor(
    name: string,
    files: string[] | null,
    pictureErrorMessages: string[] | null
  ) {
    this.name = name;
    this.files = files;
    this.pictureErrorMessages = pictureErrorMessages;
  }
}
