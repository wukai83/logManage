import { Component, OnInit } from '@angular/core';
import { CommonUtils } from '../shared/core/common.utils';

@Component({
  selector: 'log-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
    const test1 = CommonUtils.padLeft('12345', 10, 'x');
    const test2 = CommonUtils.padRight('12345', 10, 'x');
    console.log(test1);
    console.log(test2);
  }
}
