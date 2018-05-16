import { Component, OnInit } from '@angular/core';
import { PostLoginInfoModel, LoadUserApiInfoModel, GetLoginErrorInfoModel } from '../shared/model/log.model';
import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // tslint:disable-next-line:member-ordering
  pliList: PostLoginInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  luaiList: LoadUserApiInfoModel[] = [];
  // tslint:disable-next-line:member-ordering
  gleiList: GetLoginErrorInfoModel[] = [];

  // tslint:disable-next-line:member-ordering
  reader: FileReader;
  // tslint:disable-next-line:member-ordering
  total: number;
  // tslint:disable-next-line:member-ordering
  loaded = 0;
  // tslint:disable-next-line:member-ordering
  step = 1024 * 1024;
  // tslint:disable-next-line:member-ordering
  times = 0;
  // tslint:disable-next-line:member-ordering
  progressValue = 0;

  logFileChnage(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.handleLogFile(fileList[i]);
    }
  }

  private handleLogFile(file: File) {
    // console.dir(file);
    this.total = file.size;
    this.reader = new FileReader();
    // this.readBlob(file, 0);
    this.reader.readAsText(file);
    this.reader.onload = (event) => {
      const lines: Array<string> = this.reader.result.match(/[^\r\n]+/g);
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

      if (this.loaded < this.total) {
        // this.readBlob(file, this.loaded);
      } else {
        this.loaded = this.total;
        for (const pli of this.pliList) {
          for (const luai of this.luaiList) {
            if (pli.traceId === luai.traceId) {
              pli.userId = luai.userId;
              break;
            }
          }
        }

        this.pliList = this.pliList.filter((val) => val.userId !== undefined && val.userId !== '');
        console.dir(file.name);
        for (const gle of this.gleiList) {
          for (const pli of this.pliList) {
            if (gle.time.diff(pli.time) > 500 && gle.ip === pli.ip) {
              // console.dir(gle.time);
              console.log(`${gle.time.local().format('YYYY-MM-DD HH:mm:ss.SSS')}      ${gle.ip}      ${pli.userId}`);
              break;
            }
          }
        }
        // console.dir(this.pliList);
        // console.dir(this.luaiList);
        // console.dir(this.gleiList);
      }
    };
    this.reader.onerror = (error) => console.dir(error);
    this.reader.onprogress = (e) => {
      this.loaded = e.loaded;
      // console.log(e.loaded);
    };
  }

  // private readBlob(file: File, start: number) {
  //   this.times++;
  //   const blob = file.slice(start, start + this.step + 1);
  //   this.reader.readAsText(blob);
  // }

}
