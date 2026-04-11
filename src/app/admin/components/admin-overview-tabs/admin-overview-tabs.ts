import { Component, input, output } from '@angular/core';
import { AdminOverviewTab } from '../../models/admin-overview-tab.model';

@Component({
  selector: 'app-admin-overview-tabs',
  imports: [],
  templateUrl: './admin-overview-tabs.html',
  styleUrl: './admin-overview-tabs.scss',
})
export class AdminOverviewTabs {
  readonly activeOverview = input.required<AdminOverviewTab>();
  readonly overviewChange = output<AdminOverviewTab>();

  selectOverview(overview: AdminOverviewTab): void {
    if (this.activeOverview() === overview) {
      return;
    }

    this.overviewChange.emit(overview);
  }
}
