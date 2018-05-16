import { Component, OnInit, ViewChild } from '@angular/core';
import { PostLoginInfoModel, LoadUserApiInfoModel, GetLoginErrorInfoModel } from '../shared/model/log.model';
import * as moment from 'moment';
import { ElementDef } from '@angular/core/src/view';

@Component({
  selector: 'log-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  // ローディング値
  progressValue = 0;
  progressText: string;
  progressBar: Element;

  constructor() { }

  ngOnInit() {
    // this.progressBar = document.querySelector('[role=progressbar]');
    // this.progressBar.setAttribute('style', this.getProgressWidth(0));
  }

  // tslint:disable-next-line:member-ordering
  pliList: PostLoginInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  luaiList: LoadUserApiInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  gleiList: GetLoginErrorInfoModel[] = [];

  logFileChnage(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.handleReader(file);
    }
  }

  private handleReader(file: File) {
    const reader = new FileReader();
    // アップロードファイルトータルサイズ
    const total = file.size;
    // ロードされたデータ
    let loaded = 0;

    reader.readAsText(file);
    reader.onload = (event) => {
      this.handleLogFlie(reader.result, file.name);
    };
    reader.onerror = (error) => console.dir(error);
    reader.onprogress = (e) => {
      loaded = e.loaded;
      this.progressValue = Math.round((loaded / total) * 100);
      this.progressBar.setAttribute('style', this.getProgressWidth(this.progressValue));
    };
  }

  private handleLogFlie(result: any, fileName: string) {
    console.log(fileName);
    const lines: Array<string> = result.match(/[^\r\n]+/g);
    for (const line of lines) {
      const items = line.split(' ');
      if (items.length > 0) {
        if (line.includes('POST /login HTTP/1.1')) {
          const data = new PostLoginInfoModel();
          data.url = items[10];

          data.time = moment(items[8].replace('[', '').replace(']', ''));

          const ipIndex = line.indexOf('x_forwarded_for');
          data.ip = line.substr(ipIndex + 17, 15).split(',')[0];
          const traceIndex = line.indexOf('x_b3_traceid');
          data.traceId = line.substr(traceIndex, 30).split(':')[1].replace(/["]/g, '');
          this.pliList.push(data);
        }
        if (line.includes('GET /login?error HTTP/1.1')) {
          // console.dir(items);
          const data = new GetLoginErrorInfoModel();
          data.url = items[10];
          data.time = moment(items[8].replace('[', '').replace(']', ''));
          const ipIndex = line.indexOf('x_forwarded_for');
          data.ip = line.substr(ipIndex + 17, 15).split(',')[0];
          const traceIndex = line.indexOf('x_b3_traceid');
          data.traceId = line.substr(traceIndex, 30).split(':')[1].replace(/["]/g, '');

          this.gleiList.push(data);
        }
        if (line.includes('loadUserByUsername') && line.includes('started')) {
          const data = new LoadUserApiInfoModel();
          // console.dir(items);
          data.time = moment(items[0]);
          const userIndex = line.indexOf('args=');
          const userId = line.substr(userIndex + 5).replace('(String)', '');
          const traceIndex = line.indexOf('[amc-member,');
          data.traceId = line.substr(traceIndex + 12, 16);
          if (userId !== '') {
            data.userId = userId;
            this.luaiList.push(data);
          }
        }
      }
    }

    for (const pli of this.pliList) {
      for (const luai of this.luaiList) {
        if (pli.traceId === luai.traceId) {
          pli.userId = luai.userId;
          break;
        }
      }
    }

    this.pliList = this.pliList.filter((val) => val.userId !== undefined && val.userId !== '');
    let count = 0;
    for (const gle of this.gleiList) {
      for (const pli of this.pliList) {
        if (gle.time.diff(pli.time) > 500 && gle.ip === pli.ip) {
          count++;
          console.log(`${gle.time.local().format('YYYY-MM-DD HH:mm:ss.SSS')}      ${gle.ip}      ${pli.userId}`);
          break;
        }
      }
    }
    console.log(count);
  }

  private getProgressWidth(val: number) {
    return `width:${val}%`;
  }
}
