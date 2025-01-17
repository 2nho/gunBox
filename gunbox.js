// 차트 생성 함수 개선
// function createDoughnutChart(elementId, color) {
//     return new Chart(document.getElementById(elementId), {
//         type: 'doughnut',
//         data: {
//             datasets: [{
//                 data: [67.5, 32.5],
//                 backgroundColor: [color, '#232832'],
//                 borderWidth: 0,
//                 circumference: 360,
//                 rotation: 270
//             }]
//         },
//         options: {
//             cutout: '85%',
//             responsive: true,
//             plugins: {
//                 legend: { display: false },
//                 tooltip: { enabled: false }
//             }
//         }
//     });
// }

// 생산 카드 동적 생성
// const productionGrid = document.querySelector('.production-grid');
// for (let i = 1; i <= 8; i++) {
//     productionGrid.innerHTML += `
//         <div class="machine-card">
//             <div class="machine-header">
//                 <h3>${i}호기</h3>
//                 <div>67.5%</div>
//             </div>
//             <div class="progress-container">
//                 <div class="progress-bar"></div>
//             </div>
//             <div class="machine-info">
//                 <p>생산제품: AL000112</p>
//                 <p>목표량: 2000</p>
//                 <p>생산량: 1600</p>
//                 <p>BPM: 500</p>
//             </div>
//             <button class="status-button running">잠김</button>
//         </div>
//     `;
// }

// 차트 초기화
// createDoughnutChart('chart1', '#3498db');
// createDoughnutChart('chart2', '#3498db');
// createDoughnutChart('chart3', '#3498db');
// 추가 차트 초기화... 

// 시계
const time = document.querySelector(".time");
const date = document.querySelector(".date");

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
});

const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function updateTime() {
    const cd = new Date();
    time.textContent = zeroPadding(cd.getHours(), 2) + ':' +
        zeroPadding(cd.getMinutes(), 2) + ':' +
        zeroPadding(cd.getSeconds(), 2);
    date.textContent = zeroPadding(cd.getFullYear(), 4) + '-' +
        zeroPadding(cd.getMonth() + 1, 2) + '-' +
        zeroPadding(cd.getDate(), 2) + ' ' +
        week[cd.getDay()];
}

function zeroPadding(num, digit) {
    let zero = '';
    for (let i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

function showCircle(element, total, portion, color) {
    const width = 200;
    const height = 200;

    const svg = d3.select(element)
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    const radius = Math.min(width, height) / 2;

    const format = d3.format(".1%");

    const group = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const arc = d3.arc()
        .innerRadius(radius * 0.75)
        .outerRadius(radius);
    const pieGenerator = d3.pie().sort(null)
    const background = group.append("path")
        .data(pieGenerator([100]))
        .attr("fill", "#545f73")
        .attr("d", arc)

    let foreground = group.append("path")
        .data(pieGenerator([0, 100]))
        .attr("fill", color)
        .attr("d", arc)

    const textDOM = group.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "1.5rem")
        /* .attr("font-weight","lighter") */
        .attr("dy", ".3em");

    function arcTween(pie) {
        return function (d) {
            const interpolate = d3.interpolate(pie[0].startAngle, pie[0].endAngle);
            const interpolateText = d3.interpolate(0, pie[0].value);
            return function (t) {
                d.endAngle = interpolate(t);
                if (isNaN(interpolateText(t) / total)) {
                    textDOM.text("0%");
                } else {
                    textDOM.text(format(interpolateText(t) / total));
                }

                return arc(d);
            }
        }
    }
    foreground.transition().duration(1500).attrTween("d", arcTween(pieGenerator([portion, total - portion]))) // [퍼센트 차지할 비율 , 나머지]
}
function PieChart(element, data, {
    name = d => d.name,
    value = d => d.value,
    title,
    width = 150,
    height = 150,
    innerRadius = 0,
    outerRadius = Math.min(width, height) / 2 - 2,
    labelRadius = (innerRadius * 0.2 + outerRadius * 0.6),
    format = ",",
    names,
    colors = ['#bb3e03', '#ca6702'],
    stroke = innerRadius > 0 ? "none" : "white",
    strokeWidth = 1,
    strokeLinejoin = "round",
    padAngle = stroke === "none" ? 1 / outerRadius : 0,
} = {}) {

    $(element).empty();
    // Compute values.
    const N = d3.map(data, name);
    const V = d3.map(data, value);
    const I = d3.range(N.length).filter(i => !isNaN(V[i]));

    // Unique the names.
    names = N;

    // Chose a default color scheme based on cardinality.
    if (colors === undefined) colors = d3.schemeSpectral[2];
    if (colors === undefined) colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), 2);

    // Construct scales.
    const color = d3.scaleOrdinal(names, colors);
    // Compute titles.
    if (title === undefined) {
        const formatValue = d3.format(format);
        title = i => `${N[i]}\n${formatValue(V[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title; // d=> d.name
        title = i => T(O[i], i, data);
    }

    // Construct arcs.
    const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
    const svg = d3.select(element).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    if (d3.sum(V) === 0) {
        const half = d3.pie().padAngle(padAngle).sort(null).value(() => 0.5)([0, 0]);
        svg.append("g")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-linejoin", strokeLinejoin)
            .selectAll("path")
            .data(half)
            .join("path")
            .attr("fill", (_, i) => colors[i])
            .attr("d", arc);

        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(arcs)
            .join("text")
            .attr("transform", (d, i) => `translate(${(i === 0 ? 1 : -1) * (width / 4)}, 0)`)
            .selectAll("tspan")
            .data(d => {
                const lines = `${title(d.data)}`.split(/\n/);
                return lines;
            })
            .join("tspan")
            .attr("x", 0)
            .attr("y", (_, i) => `${i * 1.1}em`)
            .attr("font-weight", (_, i) => i ? null : "bold")
            .attr("font-size", 13)
            .text(d => d);
        return Object.assign(svg.node(), { scales: { color } });
    }

    svg.append("g")
        .attr("stroke", stroke)
        .attr("stroke-width", 0) // 없애는게 깔끔
        .attr("stroke-linejoin", strokeLinejoin)
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("fill", d => color(N[d.data]))
        .attr("d", arc)
        .append("title")
     /* .text(d => title(d.data))*/;

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .selectAll("tspan")
        .data(d => {
            const lines = `${title(d.data)}`.split(/\n/);
            /*return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);*/
            return lines;
        })
        .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.1}em`)
        .attr("font-weight", (_, i) => i ? null : "bold")
        .attr("font-size", 13)
        .text(d => d);
    //return ;
    $(element).append(Object.assign(svg.node(), { scales: { color } }));
};

function gaugeChart(score, totalMmeber) {
    const svg = d3.select("#gaugeChart").append("svg");

    var arcMin = -Math.PI / 2,
        arcMax = Math.PI / 2,
        innerRadius = 70,
        outerRadius = 100,
        dataDomain = [0, 50, 100],
        labelPad = 20,
        colorScale = d3.scaleLinear(),
        arcScale = d3.scaleLinear(),
        colorOptions = ['#00b894', '#fdcb6e', '#d63031'],
        width = 200,
        height = 200,
        margin = { top: 0, bottom: 0, left: 0, right: 0 },
        arc = d3.arc();

    arcScale = d3.scaleLinear().domain(dataDomain).range([arcMin, 0, arcMax]);
    colorScale = d3.scaleLinear().domain(dataDomain).range(colorOptions);
    arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(arcMin);

    //Create the chart.
    const gArc = svg.append("g")
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "arc");

    gArc.append("path").attr("class", "bg-arc");
    gArc.append("path").attr("class", "data-arc")
        .datum({ endAngle: arcMin, startAngle: arcMin, score: dataDomain[0] })
        .attr("d", arc)
        .style("fill", colorScale(dataDomain[0]))
        .each(function (d) { this._current = d; });
    //TODO: Add back label?
    gArc.append("text").attr("class", "arc-label");

    gArc.selectAll(".lines").data(arcScale.ticks(5).map(score => ({ score })))
        .enter()
        .append("path")
        .attr("class", "lines");

    gArc.selectAll(".ticks").data(arcScale.ticks(5))
        .enter().append("text")
        .attr("class", "ticks")
        .style("font-size", "16px")
        .style("text-anchor", "middle");

    // Update the outer dimensions.
    svg.attr("width", width).attr("height", height);

    // Update the inner dimensions.
    const arcG = svg.select("g.arc")
        .attr("transform", "translate(" +
            ((width ) / 2) + "," +
            ((height *(70/100)) + ")"));

    svg.select("g.arc .bg-arc")
        .datum({ endAngle: arcMax })
        .style("fill", "#ddd")
        .attr("d", arc);

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return t => arc(i(t));
    }

    const dataArc = svg.select("g.arc .data-arc")
        .datum({ score: score, startAngle: arcMin, endAngle: arcScale(score) })
        .transition()
        .duration(750)
        .style("fill", d => colorScale(d.score))
        .style("opacity", d => d.score < dataDomain[0] ? 0 : 1)
        .attrTween("d", arcTween);

    const arcCentroid = arc.centroid({ endAngle: arcMax, startAngle: arcMin, score: 0 });
    svg.select("text.arc-label")
        .datum({ score: score })
        .attr("x", arcCentroid[0])
        .attr("y", -15)
        .style("alignment-baseline", "central")
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text(d => d3.format(".0f")(d.score) + "명");

    const markerLine = d3.radialLine()
        .angle(d => arcScale(d))
        .radius((d, i) => {
            return innerRadius + ((i % 2) * ((outerRadius - innerRadius)));
        });
    return svg.node();
}

// 파이차트
// let result = { chart: [{ name: '불출', value: 75 }, { name: '미불출', value: 25 }] };
// let chart = PieChart('#piechart', result.chart, {
//     name: d => d.name,
//     value: d => d.value
// });
//document.querySelector("#piechart").append(chart);
// 게이지차트 
gaugeChart(30, 100);
// 원형차트
showCircle("#circle1", 100, 30, "#f6511d");
showCircle("#circle2", 100, 60, "orange");
showCircle("#circle3", 100, 50, "#00a6ed");
$(document).ready(function () {
    $('#myTable').DataTable({
        "autoWidth": true,
        destroy: true,
        "lengthChange": false,
        info: false,
        paging: false,
        ordering: false, // 헤더바 정렬
        "processing": true,
        scrollY: 300, // 테이블 높이
        scrollCollapse: true, // 지정높이 이하 row갯수 시 높이고정
        "pageLength": 100,
        "dom": '<"row"<"col-sm-6"><"col-sm-6 text-right">><"row"<"col-sm-12 table-wrapper"t>><"row"<"col-sm-6 d-flex align-items-center justify-content-center justify-content-md-start"li><"col-sm-6"p>>',
        data: [
            [
                1,
                '이중사',
                '522123',
                '대대총기함',
                '당직근무',
                '2025-01-15 15:00:09'
            ],
            [
                2,
                '권소위',
                '8422122',
                '대대총기함',
                '당직근무',
                '2025-01-15 15:03:13'
            ],
            [
                3,
                '김일병',
                '94112344',
                '본부중대 1생활관',
                '근무',
                '2025-01-15 18:00:05'
            ],
            [
                4,
                '박상병',
                '1422112',
                '본부중대 2생활관',
                '근무',
                '2025-01-15 18:01:10'
            ],
            
            [
                5,
                '석이병',
                '1122541',
                '3중대 1생활관',
                '근무',
                '2025-01-15 18:05:55'
            ],
            [
                6,
                '한병장',
                '56997',
                '2중대 2생활관',
                '근무',
                '2025-01-15 18:06:01'
            ],
            [
                7,
                '마일병',
                '1122541',
                '3중대 1생활관',
                '근무',
                '2025-01-15 18:06:05'
            ],
            [
                8,
                '황병장',
                '56997',
                '2중대 2생활관',
                '근무',
                '2025-01-15 18:06:20'
            ],
            [
                9,
                '권이병병',
                '1122541',
                '3중대 1생활관',
                '근무',
                '2025-01-15 18:06:35'
            ],
            [
                10,
                '박일병병',
                '555102',
                '2중대 2생활관',
                '근무',
                '2025-01-15 18:06:55'
            ]       
        ]
    });
});

const ctx = document.getElementById('myChart').getContext('2d');

// 데이터와 설정 정의
const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'], // X축 라벨
  datasets: [
    {
      label: '전년도', // 데이터셋 이름
      data: [10, 5, 15, 25, 30, 35, 40], // Y축 값
      borderColor: 'rgb(75, 192, 192)', // 선 색상
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // 배경 색상 (투명도 포함)
      fill: true, // 선 아래 영역 채우기 비활성화
    },
    {
      label: '금년도',
      data: [5, 15, 10, 20, 25, 30, 55],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true,
    },
  ],
};

// 차트 설정
const config = {
  type: 'line', // 차트 유형
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // 범례 위치
        labels: {
            color: 'white' // 범례 텍스트 색상 설정
        }
      },
      title: {
        display: true,
        text: '총기 분출 추이', // 제목
        color: 'white' 
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months', // X축 제목
          color: 'white' 
        },
        ticks: {
            color: 'white' // x축 눈금 텍스트 색상
        }
      },
      y: {
        title: {
          display: true,
          text: 'Values', // Y축 제목
          color: 'white' 
        },
        ticks: {
            color: 'white' // x축 눈금 텍스트 색상
        },
        beginAtZero: true,
      },
    },
  },
};

// 차트 생성
new Chart(ctx, config);