import { Component, OnInit } from '@angular/core';
import { PostLoginInfoModel, LoadUserApiInfoModel, GetLoginErrorInfoModel, ResultInfoModel } from '../shared/model/log.model';
import * as moment from 'moment';
import { ElementDef } from '@angular/core/src/view';
import { BaseComponent } from '../shared/component/base.component';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'log-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent extends BaseComponent implements OnInit {
  // ローディング値
  progressValue = 0;
  progressText: string;
  progressBar: Element;
  outputTxt: string;
  fileName: string;

  constructor() {
    super();
  }

  ngOnInit() {
    this.progressBar = document.querySelector('[role=progressbar]');
    this.progressBar.setAttribute('style', this.getProgressWidth(0));
    this.outputTxt = '';
  }

  // tslint:disable-next-line:member-ordering
  pliList: PostLoginInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  luaiList: LoadUserApiInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  gleiList: GetLoginErrorInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  riList: ResultInfoModel[] = [];

  logFileChnage(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.handleReader(file);
    }
  }

  downloadFile() {
    if (this.outputTxt) {
      const blob = new Blob([this.outputTxt], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(blob, `${this.fileName}.txt`);
    }
  }

  private handleReader(file: File) {
    const reader = new FileReader();
    // アップロードファイルトータルサイズ
    const total = file.size;
    // ロードされたデータ
    let loaded = 0;
    this.fileName = file.name;

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
          data.time = moment(`${items[6]} ${items[7]}`);
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

    // console.dir(this.pliList);
    // console.dir(this.gleiList);
    // console.dir(this.luaiList);

    for (const pli of this.pliList) {
      for (const luai of this.luaiList) {
        if (pli.traceId === luai.traceId) {
          pli.userId = luai.userId;
          pli.time = luai.time;
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
          const res = new ResultInfoModel();
          res.time = pli.time.local().format('YYYY-MM-DD HH:mm:ss.SSS');
          res.ip = gle.ip;
          res.userId = pli.userId;

          const index = this.riList.findIndex((item) => {
            return item.time === res.time && item.ip === res.ip && item.userId === res.userId;
          });
          if (index === -1) {
            this.riList.push(res);
          }
          // console.log(`${pli.time.local().format('YYYY-MM-DD HH:mm:ss.SSS')}      ${gle.ip}      ${pli.userId}`);
          break;
        }
      }
    }
    this.riList.sort((a, b) => {
      const atime = moment(a.time);
      const btime = moment(b.time);
      if (atime.isBefore(btime)) {
        return -1;
      } else if (atime.isAfter(btime)) {
        return 1;
      } else {
        return 0;
      }
    })
      .forEach(item => {
        this.outputTxt += `${item.time}\t\t\t\t\t\t${item.ip}\t\t\t\t\t\t${item.userId}\r\n`;
      });
    console.log(this.outputTxt);
    console.log(this.riList.length);
  }

  private getProgressWidth(val: number) {
    return `width:${val}%`;
  }
}
