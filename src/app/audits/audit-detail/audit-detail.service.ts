import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuditShort, AuditDetail, CheckItem, ChartData } from '../audits.model';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuditDetailService {

  constructor(private http: HttpClient) { }

  getCheckItemByPhase(phase: string, checkItemList: CheckItem[]) {
      return [...checkItemList.filter(checkItem => {
          return checkItem.auditPhase === phase;
      })];
  }

  getAudit = (auditId: string) => {
    return this.http.get<AuditDetail>(`http://192.168.0.20:8080/fliq/v3/audits/${auditId}`)
            .pipe(tap(Data => {
              return Data;
            }));
 }

}
