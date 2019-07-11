import { Component, OnInit, NgZone } from "@angular/core";
import { readdir, stat, mkdir } from "fs";
import { resolve } from "path";
import { shell } from "electron";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";

@Component({
  selector: "app-files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
  private folderForm: FormGroup;
  private path: string = process.cwd() + "/user-data";
  private entries: Array<string> = [];

  constructor(private fb: FormBuilder, private _ngZone: NgZone) {
    this.getUserData();
  }

  ngOnInit() {
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
    let result = true;
    const targetPath = resolve(this.path, newFolder);
    stat(targetPath, (err, stats) => {
      if (err) {
        console.error(err);
      }
      result = stats.isDirectory() ? true : false;
    });
    return result;
  }

  private async getUserData() {
    readdir(this.path, (err: Error, files: [string]) => {
      if (err) {
        console.error(err);
      }
      this._ngZone.run(() => {
        this.entries = files;
      });
    });
  }

  get formControls() {
    return this.folderForm.controls;
  }

  private createFolder() {
    if (
      this.folderForm.valid &&
      !this.checkFolderExist(this.folderForm.value["folderName"])
    ) {
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
    } else {
      console.log("le dossier existe déjà");
    }
  }
}
