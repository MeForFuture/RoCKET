import { Component, OnInit } from '@angular/core';
import { DataService, DataDomain } from '../appdata/data.service';

@Component({
  selector: 'app-domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrls: ['./domain-selector.component.css']
})
export class DomainSelectorComponent implements OnInit {
  domains : DataDomain[];

  constructor(private dataservice: DataService) { }

  ngOnInit() {
    this.getDomains();
  }
  getDomains(): void {
    this.dataservice.getDataDomains()
    .subscribe(domains => this.domains = domains);
  }

}
