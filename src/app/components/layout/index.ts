import { FocusService } from '../../services/focus.service';
import { FullscreenLockService } from '../../services/fullscreen-lock.service';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { delay, withLatestFrom, takeWhile } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { TemplateApplyComponent } from '../../workspace/template-apply/template-apply.component';

import {
  NbDialogService,
  NbMediaBreakpoint,
  NbMediaBreakpointsService,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from '@nebular/theme';
import { NgxSearchService } from '../search/ngx.search.service';
import { IWp } from '../../shared/models/workspace';
import hotkeysJs from 'hotkeys-js';

@Component({
  selector: 'ngx-layout',
  styleUrls: ['./layout.scss'],
  template: `
    <nb-layout class="mobile-layout fix-chrome" windowMode>
      <nb-layout-header fixed *ngIf="!focusService.isFocus()">
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar"
      *ngIf="!focusService.isFocus()"
                   tag="menu-sidebar"
                   responsive
                   state="compacted"
                   [end]="sidebar.id === 'end'">
      <nb-sidebar-header *ngIf="workspace" class="d-sm-none" href="#">
          <h6 class="text-capitalize mt-3">{{ workspace.name }}</h6>
        </nb-sidebar-header>
      <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-sidebar class="theme-sidebar"
                   tag="theme-sidebar"
                   responsive
                   state="compacted"
                   [end]="true">
            <div *ngIf="themeSidebar">
            <div (click)="toggleThemebar()">
                <h6>Templates
                  <em class="fas fa-times" style="float:right;"></em>
                </h6>
                <hr/>
            </div>

            <div *ngFor="let template of templatelist">
            <nb-card (click)="chooseTheme(template._id)">
              <nb-card-body class="theme-card">
                <div class="theme-preview" style="background:url('assets/templates/{{template.template_preview}}')">
                </div>
                <h6 class="theme-name">{{template.name}}</h6>
              </nb-card-body>
            </nb-card>
            </div>
      </div>
      </nb-sidebar>

      <nb-layout-column [class]="getClass()">
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>
    </nb-layout>
    <ngx-floating-button label="Bob overlay" img="/assets/images/cashstory_icon_white.png" *ngIf="focusService.isFocus() && !fullscreenLockService.isLock()">
      <ngx-floating-button-item (click)="unFocusAndSearch()" icon="search" color="#5de191" label="Open search"></ngx-floating-button-item>
      <ngx-floating-button-item (click)="unFocus()" icon="compress-alt" status="basic" label="Back to bob" color="white"></ngx-floating-button-item>
      <!--Here We can Configure N number of Floating buttons-->
    </ngx-floating-button>
    <div class="theme-holder" (click)="toggleThemebar()" *ngIf="!themeSidebar">
    <em class="fas fa-angle-left" style="font-size: large;"></em>
  </div>
  `,
})
export class LayoutComponent implements OnDestroy, OnInit {
  templatelist;
  currentWs: IWp;
  ngOnInit() {
    this.auth.currentWpObs.subscribe((workspaceCurrent) => {
      this.currentWs = workspaceCurrent;
    });
    this.wss.getTemplates().subscribe((templates) => {
      this.templatelist = templates;
    });
    hotkeysJs('escape', (event) => {
      this.unFocus();
      event.preventDefault();
    });
  }
  subMenu: NbMenuItem[] = [
    {
      title: 'PAGE LEVEL MENU',
    },
  ];
  layout: any = {};
  sidebar: any = {};
  themeSidebar: boolean = false;

  private alive = true;

  // @HostListener('window:beforeunload')
  // onBeforeUnload() {
  //   this.auth.eventBeacon({}, {}, { event: 'unload', date: new Date() });
  //   return false;
  // }
  @HostListener('window:blur')
  onBlur() {
    this.auth.event({}, {}, { event: 'blur', date: new Date(), url: window.location.href });
    return false;
  }
  @HostListener('window:focus')
  onFocus() {
    this.auth.event({}, {}, { event: 'focus', date: new Date(), url: window.location.href });
    return false;
  }
  constructor(
    protected menuService: NbMenuService,
    protected themeService: NbThemeService,
    protected bpService: NbMediaBreakpointsService,
    protected sidebarService: NbSidebarService,
    public searchService: NgxSearchService,
    public focusService: FocusService,
    public fullscreenLockService: FullscreenLockService,
    private auth: AuthService,
    private dialogService: NbDialogService,
    private wss: WorkspaceService) {
    const isBp = this.bpService.getByName('is');
    this.menuService.onItemSelect()
      .pipe(
        takeWhile(() => this.alive),
        withLatestFrom(this.themeService.onMediaQueryChange()),
        delay(20),
      )
      .subscribe(([item, [bpFrom, bpTo]]: [any, [NbMediaBreakpoint, NbMediaBreakpoint]]) => {
        if (bpTo.width <= isBp.width) {
          this.sidebarService.collapse('menu-sidebar');
        }
      });

  }

  chooseTheme(id) {
    this.dialogService.open(TemplateApplyComponent, {
      hasScroll: true,
      context: {
        templateId: id,
      },
    });
  }

  toggleThemebar() {
    this.sidebarService.toggle(true, 'theme-sidebar');
    this.themeSidebar = !this.themeSidebar;
  }

  async unFocusAndSearch() {
    this.focusService.unFocus();
    this.auth.event({}, {}, { event: 'un_fullscreen', date: new Date(), url: window.location.href });
    setTimeout(() => {
      this.searchService.activateSearch('rotate-layout');
    }, 100);
  }
  async unFocus() {
    this.focusService.unFocus();
    this.auth.event({}, {}, { event: 'un_fullscreen', date: new Date(), url: window.location.href });
  }
  getClass() {
    if (this.focusService.isFocus()) {
      return 'bg-logo main-content overflow-hidden p-0';
    }
    return 'bg-logo main-content overflow-hidden p-0 p-md-4';
  }
  ngOnDestroy() {
    this.alive = false;
  }
}
