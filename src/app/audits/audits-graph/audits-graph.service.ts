import { Injectable } from '@angular/core';
import { ChartData, AuditShort, AuditStat } from '../audits.model';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuditsGraphService {
  private _barChartData = new BehaviorSubject<ChartData[]>([]);
  private _lineChartData = new BehaviorSubject<any[]>([]);
  private lineChart = [{
    name: "SORT",
    series: []
  },
  {
    name: "SHINE",
    series: []
  },
  {
    name: "ORDER",
    series: []
  },
  {
    name: "SUSTAIN",
    series: []
  },
  {
    name: "STANDARDIZE",
    series: []
  }];

  constructor(private http: HttpClient) { }

  get barChartData() {
    return this._barChartData.asObservable();
  }
  get lineChartData() {
    return this._lineChartData.asObservable();
  }

  getAuditsBarGraphData(pageNumber: number, pageSize: number) {
    return this.http.get<AuditShort[]>(`http://13.48.203.158:8080/fliq/v3/shortaudits?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      .pipe(map(newAuditShorts => {
        let newData = [];
        newAuditShorts.map((audit) => {
          newData.push({ key: audit.key, name: audit.assessedDate/*this.convertDate(audit.assessedDate)*/, value: audit.averageScore });
        })

        let finalData = [];
        for (let i = newData.length - 1; i >= 0; i--) {
          finalData.push(newData[i]);
        }
        return finalData;
      }), tap(newData => {
        this._barChartData.next(newData);
      }));
    //https://anypoint.mulesoft.com/mocking/api/v1/links/e84a2be7-f46c-440b-ba8e-b80130e3bb38/fliq/v3/shortaudits
    //http://10.15.10.214:8080/fliq/v3/shortaudits
  };

    convertDate(date: string) {
     let newDate = new Date(Date.parse(date)).toLocaleDateString("en-US");
     return newDate;
   } 

   getAuditsLineGraphData(ChartData: ChartData[]) {
    this.lineChart = [
      {
        name: "SORT",
        series: []
      },
      {
        name: "SHINE",
        series: []
      },
      {
        name: "ORDER",
        series: []
      },
      {
        name: "SUSTAIN",
        series: []
      },
      {
        name: "STANDARDIZE",
        series: []
      }
    ];
    _.map(ChartData, (audit) => {
      this.fetchLineGraphData(audit).subscribe();
    });
    return this.lineChart;
  }; 

   fetchLineGraphData(audit: ChartData) {
    return this.http.get<AuditStat>(`http://ec2-13-48-203-158.eu-north-1.compute.amazonaws.com:8080/fliq/v3/stat/${audit.key}`)
      .pipe(map(newAuditStat => {
        newAuditStat.phaseScores.map((phaseScore) => {
          let foundPhase = _.find(this.lineChart, (phase) => {
            return phase.name == phaseScore.auditPhase;
          });

          if (_.findIndex(foundPhase.series, (i) => {
            return i.name == audit.name;
          }) == -1) {
            foundPhase.series.push({ name: audit.name, value: phaseScore.score });
          } else {
            _.remove(foundPhase.series, (i) => {
              return i.name == audit.name;
            });
            foundPhase.series.push({ name: audit.name, value: phaseScore.score });
          };

          let index = _.findIndex(this.lineChart, (data) => {
            return data.name == phaseScore.auditPhase;
          });
          this.lineChart[index] = foundPhase;
          
        });
        return this.lineChart;
      }));
  } 
}


//https://anypoint.mulesoft.com/mocking/api/v1/links/e84a2be7-f46c-440b-ba8e-b80130e3bb38/fliq/v3/stat/
//http://192.168.100.10:8080/fliq/v3/stat/