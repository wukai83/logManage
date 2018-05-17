import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Const } from './shared/core/Const';

@Component({
  selector: 'log-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'log';

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    // this.router.navigate([Const.PATH_URI.Main]);
  }
}
