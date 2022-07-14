import { Component, OnInit } from '@angular/core';
import { FluidService } from './core/fluid.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  
  constructor(private fluidService: FluidService) {}

  ngOnInit(): void {}
}
