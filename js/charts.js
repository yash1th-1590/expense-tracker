/* =========================================================
   charts.js
   Lightweight canvas charts.
   No external chart library required.
   ========================================================= */

const Charts = (() => {

  const COLORS = [

    '#2563eb',
    '#16a34a',
    '#dc2626',
    '#d97706',
    '#7c3aed',
    '#0891b2',
    '#db2777',
    '#64748b'

  ];


  function setupCanvas(canvas) {

    if (!canvas) {
      return null;
    }


    const rect =
      canvas.getBoundingClientRect();


    const width =
      Math.max(260, Math.floor(rect.width || canvas.width));


    const height =
      Math.max(220, Math.floor(rect.height || canvas.height));


    const dpr =
      window.devicePixelRatio || 1;


    canvas.width =
      width * dpr;

    canvas.height =
      height * dpr;


    const ctx =
      canvas.getContext('2d');


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    return {
      ctx,
      width,
      height
    };
  }


  function drawDonut(canvas, dataset) {

    const setup =
      setupCanvas(canvas);

    if (!setup) return;


    const {
      ctx,
      width,
      height
    } = setup;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    const total =
      dataset.reduce(
        (sum, item) =>
          sum + Number(item.value || 0),
        0
      );


    const cx =
      width / 2;

    const cy =
      height / 2;


    const outerRadius =
      Math.min(width, height) * 0.36;

    const innerRadius =
      outerRadius * 0.64;


    if (total <= 0) {

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        (outerRadius + innerRadius) / 2,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle =
        '#e5e7eb';

      ctx.lineWidth =
        outerRadius - innerRadius;

      ctx.stroke();


      ctx.fillStyle =
        '#64748b';

      ctx.font =
        '600 13px system-ui';

      ctx.textAlign =
        'center';

      ctx.fillText(
        'No data',
        cx,
        cy + 4
      );

      return;
    }


    let start =
      -Math.PI / 2;


    dataset.forEach(
      (item, index) => {

        const value =
          Number(item.value || 0);

        const angle =
          (value / total) *
          Math.PI *
          2;


        ctx.beginPath();

        ctx.arc(
          cx,
          cy,
          (outerRadius + innerRadius) / 2,
          start,
          start + angle
        );


        ctx.strokeStyle =
          COLORS[
            index % COLORS.length
          ];


        ctx.lineWidth =
          outerRadius -
          innerRadius;


        ctx.lineCap =
          'butt';

        ctx.stroke();


        start += angle;
      }
    );


    ctx.fillStyle =
      '#172033';

    ctx.font =
      '700 18px system-ui';

    ctx.textAlign =
      'center';

    ctx.fillText(
      Utils.formatCurrency(total),
      cx,
      cy
    );


    ctx.fillStyle =
      '#7a8495';

    ctx.font =
      '600 10px system-ui';

    ctx.fillText(
      'TOTAL SPENT',
      cx,
      cy + 20
    );
  }


  function renderDonutLegend(
    container,
    dataset
  ) {

    if (!container) return;


    const total =
      dataset.reduce(
        (sum, item) =>
          sum + Number(item.value || 0),
        0
      );


    if (!dataset.length) {

      container.innerHTML =
        '<span class="muted small">Nothing logged yet</span>';

      return;
    }


    container.innerHTML =
      dataset.map(
        (item, index) => {

          const percentage =
            total > 0
              ? Math.round(
                  (item.value / total) * 100
                )
              : 0;


          return `

            <div class="legend-row">

              <span
                class="legend-dot"
                style="background:${COLORS[index % COLORS.length]}">
              </span>

              <span class="legend-name">
                ${Utils.escapeHTML(item.label)}
              </span>

              <span class="legend-value">
                ${percentage}%
              </span>

            </div>

          `;
        }
      ).join('');
  }


  function drawTrendBar(
    canvas,
    dataset
  ) {

    const setup =
      setupCanvas(canvas);

    if (!setup) return;


    const {
      ctx,
      width,
      height
    } = setup;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    if (!dataset.length) {
      return;
    }


    const padding = {

      top: 20,

      right: 12,

      bottom: 34,

      left: 12
    };


    const chartWidth =
      width -
      padding.left -
      padding.right;


    const chartHeight =
      height -
      padding.top -
      padding.bottom;


    const maxValue =
      Math.max(
        1,
        ...dataset.map(
          item =>
            Math.max(
              Number(item.income || 0),
              Number(item.expense || 0)
            )
        )
      );


    const groupWidth =
      chartWidth /
      dataset.length;


    const barWidth =
      Math.min(
        18,
        groupWidth * 0.25
      );


    ctx.strokeStyle =
      '#e5e7eb';

    ctx.lineWidth =
      1;


    for (let i = 0; i <= 4; i++) {

      const y =
        padding.top +
        chartHeight -
        (chartHeight * i / 4);


      ctx.beginPath();

      ctx.moveTo(
        padding.left,
        y
      );

      ctx.lineTo(
        padding.left + chartWidth,
        y
      );

      ctx.stroke();
    }


    dataset.forEach(
      (item, index) => {

        const centerX =
          padding.left +
          index * groupWidth +
          groupWidth / 2;


        const income =
          Number(item.income || 0);

        const expense =
          Number(item.expense || 0);


        const incomeHeight =
          (income / maxValue) *
          chartHeight;


        const expenseHeight =
          (expense / maxValue) *
          chartHeight;


        ctx.fillStyle =
          '#2563eb';


        ctx.fillRect(

          centerX -
          barWidth -
          3,

          padding.top +
          chartHeight -
          incomeHeight,

          barWidth,

          incomeHeight

        );


        ctx.fillStyle =
          '#dc2626';


        ctx.fillRect(

          centerX + 3,

          padding.top +
          chartHeight -
          expenseHeight,

          barWidth,

          expenseHeight

        );


        ctx.fillStyle =
          '#7a8495';


        ctx.font =
          '11px system-ui';

        ctx.textAlign =
          'center';


        ctx.fillText(

          Utils.escapeHTML
            ? item.label
            : item.label,

          centerX,

          height - 10

        );
      }
    );
  }


  return {

    COLORS,

    drawDonut,

    renderDonutLegend,

    drawTrendBar
  };

})();