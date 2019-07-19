import {
  Component,
  OnInit,
  NgZone,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  readdir,
  mkdir,
  rmdirSync,
  unlinkSync,
  writeFileSync,
  watch,
  readFileSync
} from 'fs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Folder } from './folder';
import { Picture } from './picture';
import { PictureWorkplaceComponent } from '../picture-workplace/picture-workplace.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  private folderExist: boolean;
  private folderForm: FormGroup;
  private path: string = process.cwd() + '/src/assets/user-data/folders';
  private folders: Object = {};
  private currentPicture: string;

  constructor(
    private fb: FormBuilder,
    private _ngZone: NgZone,
    private _domSanitizer: DomSanitizer,
    private elRef: ElementRef
  ) {
    this.getUserData();
  }

  ngOnInit() {
    this.folderExist = false;
    this.folderForm = this.fb.group({
      folderName: [
        '',
        [
          Validators.required,
          Validators.pattern(RegExp('^([a-zA-Z_0-9]+.?)*[a-zA-Z_0-9]+$'))
        ]
      ]
    });

    console.log(this);
  }

  private checkFolderExist(newFolder: string) {
    this.folderExist = this.folders[newFolder] === undefined ? false : true;
  }

  get formControls() {
    return this.folderForm.controls;
  }

  private createFolder() {
    this.checkFolderExist(this.folderForm.value['folderName']);
    if (this.folderForm.valid && !this.folderExist) {
      mkdir(
        this.path + '/' + this.folderForm.value['folderName'],
        (err: Error) => {
          if (err) {
            console.error(err);
          } else {
            this.getUserData();
          }
        }
      );
    }
  }

  private getUserData() {
    readdir(this.path, (err: Error, folders: [string]) => {
      if (err) {
        console.error(err);
      }
      this._ngZone.run(() => {
        for (let i = 0; i < folders.length; i++) {
          readdir(
            this.path + '/' + folders[i],
            (error: Error, files: [string]) => {
              if (error) {
                console.error(error);
              }
              this._ngZone.run(() => {
                this.folders[folders[i]] = new Folder(folders[i], files, null);
              });
            }
          );
        }
      });
    });
  }

  private deleteFolder(folder: string) {
    const files: string[] = [];
    this.folders[folder].files.forEach(file => {
      unlinkSync(this.path + '/' + folder + '/' + file);
      files.push(file);
    });

    const pictures: [Picture] = JSON.parse(
      readFileSync(
        process.cwd() + '/src/assets/user-data/interest-points.json',
        'utf-8'
      )
    );

    pictures.forEach(picture => {
      files.forEach(file => {
        if (
          picture.file.toLowerCase() ===
          (this.path + '/' + folder + '/' + file).toLowerCase()
        ) {
          pictures.splice(pictures.findIndex(value => value === picture));
        }
      });
    });

    const json = JSON.stringify(pictures);

    writeFileSync(
      process.cwd() + '/src/assets/user-data/interest-points.json',
      json,
      'utf8'
    );

    rmdirSync(this.path + '/' + folder);
    delete this.folders[folder];
  }

  private pictureVerificator(file) {
    const errorMessages: string[] = [];

    if (
      !(
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg'
      )
    ) {
      errorMessages.push('Le fichier n\'est pas un .png / .jpg');
    }
    if (file.size < 10000) {
      errorMessages.push('L\'image fait moins de 10ko');
    }
    if (file.size > 20000000) {
      errorMessages.push('L\'image fait plus de 20Mo');
    }

    return errorMessages.length === 0 ? null : errorMessages;
  }

  private addPicture(event, folder: string) {
    const file = event.target.files[0];

    this.folders[folder].pictureErrorMessages = this.pictureVerificator(file);

    if (this.folders[folder].pictureErrorMessages == null) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this._ngZone.run(() => {
        reader.onload = function() {
          const img = String(reader.result);
          const data = img.split(',');
          const buffer = Buffer.from(data[1], 'base64');

          writeFileSync(
            process.cwd() +
              '/src/assets/user-data/folders' +
              '/' +
              folder +
              '/' +
              file.name,
            buffer
          );
        };

        watch(
          this.path + '/',
          { encoding: 'buffer' },
          (eventType, filename) => {
            if (filename) {
              // console.log(filename);
              this.getUserData();
            }
          }
        );
      });
      reader.onerror = function(error) {
        console.log('Error: ', error);
      };

      // Create Picture in JSON

      const pictures: [Picture] = JSON.parse(
        readFileSync(
          process.cwd() + '/src/assets/user-data/interest-points.json',
          'utf-8'
        )
      );
      const picture: Picture = {
        file: this.path + '/' + folder + '/' + file.name,
        interestPoints: []
      };

      pictures.push(picture);

      const json = JSON.stringify(pictures);

      writeFileSync(
        process.cwd() + '/src/assets/user-data/interest-points.json',
        json,
        'utf8'
      );
    }
  }

  private async openPictureInWorkplace(file: string) {
    this.currentPicture = file;
  }
}
