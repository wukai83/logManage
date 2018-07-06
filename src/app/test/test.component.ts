import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'log-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  files: FileList;
  btnFile: Element;
  step = 1024 * 1024 * 10;
  // linecount = 0;

  constructor() { }

  ngOnInit() {
  }

  logFileChnage(fileList: FileList) {
    this.files = fileList;
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      this.handleReader(file, i);
    }
  }

  private handleReader(file: File, idx: number) {
    const reader = new FileReader();
    // アップロードファイルトータルサイズ
    const total = file.size;
    // ロードされたデータ
    let loaded = 0;
    let start = 0;
    let records: string[] = [];

    reader.onloadend = (event) => {
      const lines: string[] = reader.result.match(/[^\r\n]+/g);
      const temp = start;
      start += new Blob([reader.result]).size;
      if (start < total) {
        const end = reader.result[reader.result.length - 1] === '\n' ? '' : lines.pop();
        start -= new Blob([end]).size;
        records = records.concat(lines);
        console.log(`${file.name}\t\t\t${Math.round(start / total * 100)}`);
        // this.linecount += lines.length;
        this.readBlob(reader, file, start);
      } else {
        console.log(`${file.name}\t\t\t${Math.round(start / total * 100)}`);
        records = records.concat(lines);
        // console.dir(records);
      }
    };
    reader.onerror = (error) => console.dir(error);
    reader.onprogress = (e) => {
      loaded = e.loaded;
      const value = Math.round((loaded / total) * 100);
    };
    this.readBlob(reader, file, start);
  }

  readBlob(reader: FileReader, file: File, start: number) {
    const blob = file.slice(start, start + this.step, 'UTF-8');
    reader.readAsText(blob);
  }
}
