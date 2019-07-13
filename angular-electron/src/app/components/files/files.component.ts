import { Component, OnInit, NgZone } from "@angular/core";
import {
  readdir,
  mkdir,
  rmdirSync,
  rmdir,
  unlinkSync,
  writeFileSync,
  writeFile,
  watch
} from "fs";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
  private folderExist: boolean;
  private folderForm: FormGroup;
  private path: string = process.cwd() + "/src/assets/user-data";
  private folders: [string, [string]][] = [];
  constructor(private fb: FormBuilder, private _ngZone: NgZone) {
    this.getUserData();
  }

  ngOnInit() {
    this.folderExist = false;
    this.folderForm = this.fb.group({
      folderName: [
        "",
        [
          Validators.required,
          Validators.pattern(RegExp("^([a-zA-Z_0-9]+.?)*[a-zA-Z_0-9]+$"))
        ]
      ]
    });

    console.log(this);
  }

  private checkFolderExist(newFolder: string) {
    let exist = false;
    for (let i = 0; i < this.folders.length; i++) {
      if (newFolder == this.folders[i][0]) {
        exist = true;
        break;
      }
    }
    this.folderExist = exist;
  }

  private getUserData() {
    watch(this.path);
    readdir(this.path, (err: Error, folders: [string]) => {
      if (err) {
        console.error(err);
      }
      this._ngZone.run(() => {
        for (let i = 0; i < folders.length; i++) {
          readdir(
            this.path + "/" + folders[i],
            (err: Error, files: [string]) => {
              if (err) {
                console.error(err);
              }
              this._ngZone.run(() => {
                this.folders[i] = [folders[i], files];
              });
            }
          );
        }
      });
    });
  }

  get formControls() {
    return this.folderForm.controls;
  }

  private createFolder() {
    this.checkFolderExist(this.folderForm.value["folderName"]);
    if (this.folderForm.valid && !this.folderExist) {
      mkdir(
        this.path + "/" + this.folderForm.value["folderName"],
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

  private deleteFolder(folder: string) {
    let folderIndex = this.folders.findIndex(value => value[0] == folder);
    for (let i = 0; i < this.folders[folderIndex][1].length; i++) {
      unlinkSync(
        this.path + "/" + folder + "/" + this.folders[folderIndex][1][i]
      );
    }

    rmdirSync(this.path + "/" + folder);
    this.folders.splice(folderIndex, 1);
  }

  private addPicture(event, folder: string) {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.readAsDataURL(file);
    this._ngZone.run(() => {
      reader.onload = function() {
        console.log(reader.result);
        let img = String(reader.result);
        let data = img.split(",");
        let buffer = Buffer.from(data[1], "base64");
        console.log(buffer);

        writeFileSync(
          process.cwd() +
            "/src/assets/user-data" +
            "/" +
            folder +
            "/" +
            file.name,
          buffer
        );
      };
      this.getUserData();
    });
    reader.onerror = function(error) {
      console.log("Error: ", error);
    };
  }
}
