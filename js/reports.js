const Reports = (() => {


  function buildNarrative() {

    const {
      income,
      expense
    } =
      Transactions.monthTotals();


    const net =
      income - expense;


    const breakdown =
      Transactions.categoryBreakdownThisMonth();


    const topCategory =
      breakdown[0];


    const monthName =
      new Date().toLocaleDateString(
        'en-IN',
        {
          month: 'long'
        }
      );


    const activeGoals =
      AppState.data.goals.filter(
        goal =>
          Number(goal.current) <
          Number(goal.target)
      );


    const savingsRate =
      income > 0
        ? Math.round(
            (net / income) *
            100
          )
        : 0;


    let text = `

      <div class="report-stat">

        <div class="report-stat-label">
          Income
        </div>

        <div class="report-stat-value amount-income">
          ${Utils.formatCurrency(
            income
          )}
        </div>

      </div>


      <div class="report-stat">

        <div class="report-stat-label">
          Expenses
        </div>

        <div class="report-stat-value amount-expense">
          ${Utils.formatCurrency(
            expense
          )}
        </div>

      </div>


      <div class="report-stat">

        <div class="report-stat-label">
          Net savings
        </div>

        <div
          class="report-stat-value"
          style="color:${
            net >= 0
              ? 'var(--success)'
              : 'var(--danger)'
          }">

          ${Utils.formatCurrency(
            net
          )}

        </div>

      </div>

    `;


    let narrative = `

      <div
        style="
          margin-top:16px;
          color:var(--text-secondary);
          line-height:1.7;
        ">

        In
        <strong>
          ${Utils.escapeHTML(monthName)}
        </strong>,
        you received
        <strong>
          ${Utils.formatCurrency(income)}
        </strong>
        and spent
        <strong>
          ${Utils.formatCurrency(expense)}
        </strong>,
        resulting in a net of
        <strong>
          ${Utils.formatCurrency(net)}
        </strong>.

      </div>

    `;


    if (topCategory) {

      narrative += `

        <div
          style="
            margin-top:10px;
            color:var(--text-secondary);
          ">

          Your highest spending category
          this month is

          <strong>
            ${Utils.escapeHTML(
              topCategory.label
            )}
          </strong>

          at

          <strong>
            ${Utils.formatCurrency(
              topCategory.value
            )}
          </strong>.

        </div>

      `;
    }


    if (income > 0) {

      if (net >= 0) {

        narrative += `

          <div
            style="
              margin-top:10px;
              color:var(--text-secondary);
            ">

            Your current savings rate is
            <strong>
              ${savingsRate}%
            </strong>.

          </div>

        `;

      } else {

        narrative += `

          <div
            style="
              margin-top:10px;
              color:var(--danger);
            ">

            Your expenses are currently
            higher than your income this
            month.

          </div>

        `;
      }
    }


    if (activeGoals.length) {

      const nearest =
        activeGoals
          .slice()
          .sort(
            (a, b) =>
              Utils.daysBetween(
                a.targetDate
              ) -
              Utils.daysBetween(
                b.targetDate
              )
          )[0];


      const percentage =
        nearest.target > 0
          ? Math.min(
              100,
              Math.round(
                (nearest.current /
                  nearest.target) *
                100
              )
            )
          : 0;


      narrative += `

        <div
          style="
            margin-top:10px;
            color:var(--text-secondary);
          ">

          Your nearest active goal,
          <strong>
            ${Utils.escapeHTML(
              nearest.name
            )}
          </strong>,
          is
          <strong>
            ${percentage}%
          </strong>
          funded with
          <strong>
            ${Utils.formatCurrency(
              Math.max(
                0,
                nearest.target -
                nearest.current
              )
            )}
          </strong>
          remaining.

        </div>

      `;
    }


    return text + narrative;
  }


  function renderMonthlyTable() {

    const tbody =
      document.getElementById(
        'report-table-body'
      );


    if (!tbody) return;


    const months =
      Transactions.last6MonthsTotals();


    tbody.innerHTML =
      months
        .slice()
        .reverse()
        .map(
          month => {

            const net =
              month.income -
              month.expense;


            return `

              <tr>

                <td>
                  ${Utils.escapeHTML(
                    Utils.monthLabel(
                      month.key
                    )
                  )}
                </td>

                <td class="right amount-income">
                  ${Utils.formatCurrency(
                    month.income
                  )}
                </td>

                <td class="right amount-expense">
                  ${Utils.formatCurrency(
                    month.expense
                  )}
                </td>

                <td
                  class="right"
                  style="
                    color:${
                      net >= 0
                        ? 'var(--success)'
                        : 'var(--danger)'
                    };
                    font-weight:700;
                  ">

                  ${Utils.formatCurrency(
                    net
                  )}

                </td>

              </tr>

            `;
          }
        )
        .join('');
  }


  function render() {

    const narrative =
      document.getElementById(
        'report-narrative'
      );


    if (narrative) {

      narrative.innerHTML =
        buildNarrative();
    }


    renderMonthlyTable();
  }


  function csvEscape(value) {

    const string =
      String(value ?? '');


    return (
      '"' +
      string.replace(
        /"/g,
        '""'
      ) +
      '"'
    );
  }


  function exportCSV() {

    const rows = [

      [
        'Date',
        'Type',
        'Category',
        'Account',
        'Note',
        'Amount'
      ]

    ];


    AppState.data.transactions
      .slice()
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .forEach(
        transaction => {

          const category =
            Transactions.categoryById(
              transaction.categoryId
            );


          const account =
            Transactions.accountById(
              transaction.accountId
            );


          rows.push([

            transaction.date,

            transaction.type,

            category
              ? category.name
              : '',

            account
              ? account.name
              : '',

            transaction.note || '',

            transaction.amount

          ]);
        }
      );


    const csv =
      rows
        .map(
          row =>
            row
              .map(csvEscape)
              .join(',')
        )
        .join('\r\n');


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    link.download =
      `ledger-export-${Utils.todayISO()}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      () =>
        URL.revokeObjectURL(
          url
        ),
      100
    );


    Utils.showToast(
      'CSV exported successfully'
    );
  }


  return {

    render,

    exportCSV

  };

})();