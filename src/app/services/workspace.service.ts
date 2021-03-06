import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IShared, IWorkspace } from '../shared/models/workspace';
import { environment } from '../../environments/environment';

@Injectable()
export class WorkspaceService {
  constructor(private http: HttpClient) { }

  get(): Observable<IWorkspace[]> {
    return this.http.get<IWorkspace[]>(`${environment.api}/workspaces`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${environment.api}/workspaces/count`);
  }

  add(workspace: IWorkspace): Observable<IWorkspace> {
    return this.http.post<IWorkspace>(`${environment.api}/workspaces`, workspace);
  }

  getById(id: string): Observable<IWorkspace> {
    return this.http.get<IWorkspace>(`${environment.api}/workspaces/${id}`);
  }

  getUserWpById(id: string): Observable<IWorkspace> {
    return this.http.get<IWorkspace>(`${environment.api}/userworkspaces/${id}`);
  }

  edit(workspace: IWorkspace): Observable<IWorkspace> {
    return this.http.put<IWorkspace>(`${environment.api}/workspaces/${workspace._id}`, workspace);
  }

  delete(workspace: IWorkspace): Observable<IWorkspace> {
    return this.http.delete<IWorkspace>(`${environment.api}/workspaces/${workspace._id}`);
  }

  getShare(id: string): Observable<IWorkspace> {
    return this.http.get<IWorkspace>(`${environment.api}/workspaces/share/${id}`);
  }

  addShare(id: string, shareData: IShared): Observable<IWorkspace> {
    return this.http.post<IWorkspace>(`${environment.api}/workspaces/share/${id}`, shareData);
  }

  addRequest(requestData: any): Observable<IWorkspace> {
    return this.http.post<IWorkspace>(`${environment.api}/workspaces/request`, requestData);
  }

  deleteShare(id: string, email: string): Observable<IWorkspace> {
    return this.http.delete<IWorkspace>(`${environment.api}/workspaces/share/${id}/${email}`);
  }

  toggleLink(id: string): Observable<IWorkspace> {
    return this.http.post<IWorkspace>(`${environment.api}/workspaces/share/${id}/link`, '');
  }

  getTemplates(): Observable<any> {
    return this.http.get<IWorkspace>(`${environment.api}/workspaces/templates`);
  }

  applyTemplate(id, wpName): Observable<any> {
    return this.http.post<IWorkspace>(`${environment.api}/workspaces/templates/${id}`, wpName);
  }
}
