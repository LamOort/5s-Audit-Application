import { Component, OnInit } from '@angular/core';
import { ChartData, AuditShort } from '../audits.model';
import { AuditsGraphService } from './audits-graph.service';
import * as regression from 'regression';

@Component({
  selector: 'app-audits-graph',
  templateUrl: './audits-graph.page.html',
  styleUrls: ['./audits-graph.page.scss'],
})
export class AuditsGraphPage implements OnInit {
  isLoading: boolean;
  selectedPhase: number;
  auditsAverageChart: ChartData[];
  lineChart: any[];
  phaseChart: any[];
  value: number;
  multi: any[];
  data: any[];

  view: any[] = [800, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  legendPosition = 'right';
  showXAxisLabel = true;
  xAxisLabel = 'Audits';
  showYAxisLabel = true;
  yAxisLabel = 'Score';
  showGridLines = true;
  innerPadding = '5%';
  animations: boolean = true;
  lineChartScheme = {
    name: 'audits stats',
    selectable: true,
    group: 'Ordinal',
    domain: ['#FF0000', "#FF9A00"]
  };

  comboBarScheme = {
    name: 'audits score',
    selectable: true,
    group: 'Ordinal',
    domain: ['#3880ff']
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string = '';

  constructor(private auditsGraphService: AuditsGraphService) {
    this.view = [innerWidth / 1.35, 350];
  }

  ngOnInit() {
    this.value = 10;
    this.isLoading = true;
    this.lineChart = [];
    this.auditsGraphService.barChartData.subscribe(data => {
      this.auditsAverageChart = data;
      this.lineChart = this.createTrendChart(this.auditsAverageChart);
      this.phaseChart = this.auditsGraphService.getAuditsLineGraphData(this.auditsAverageChart); 
      this.isLoading = false;
    });

  };

  ionViewWillEnter() {
    this.auditsGraphService.getAuditsBarGraphData(0, this.value).subscribe();
  }

  onChangeHandler(event) {
    this.value = +event.target.value;
    this.auditsGraphService.getAuditsBarGraphData(0, this.value).subscribe();  
  }

  onPhaseSelected(event) {  
    this.selectedPhase = +event.target.value;
    let selectedPhaseData = this.phaseChart[this.selectedPhase];
    if (this.lineChart.length === 2) {  
      this.lineChart.pop();
      this.lineChart.push(this.createPhaseTrendChart(selectedPhaseData));  
    } 
  }

  onSelect(event) {
    console.log(event);
  }

  onResize(event) {
    this.view = [event.target.innerWidth / 1.35, 350];
  }

  createTrendChart(barChart: ChartData[]) {
    let lineChartTemplates = [
      {
        name: "Average Score Trend",
        series: []
      },
      {
        name: "Phase Trend",
        series: [
          {
            value: 4,
            name: ""
          }
        ]
      }
    ];
    let barChartData = new Array;

    for (let i = 0; i < barChart.length; i++) {
      barChartData.push([i, barChart[i].value]);
    };

    let result = regression.linear(barChartData);
    for (let i = 0; i < barChartData.length; i++) {
      lineChartTemplates[0].series.push({ 'value': result.points[i][1], 'name': barChart[i].name });
    }

    return lineChartTemplates;
  }

  createPhaseTrendChart(phaseLine: any) {

    let phaseLineTemplates = {
        name: `Phase Trend`,
        series: []
    };
    let phaseLineData = new Array;
    for (let i = 0; i < phaseLine.series.length; i++) {
      phaseLineData.push([i, phaseLine.series[i].value]);
    };
    let result = regression.linear(phaseLineData);
    for (let j = 0; j < result.points.length; j++) {
      phaseLineTemplates.series.push({ 'value': result.points[j][1], 'name': phaseLine.series[j].name });
    }
    
    return phaseLineTemplates;
  }

}
