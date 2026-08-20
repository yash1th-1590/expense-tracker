/* =========================================================
   transactions.js
   Transaction creation, editing, deletion, filtering,
   calculations and transaction rendering.
   ========================================================= */

const Transactions = (() => {


  function categoryById(id) {

    return AppState.data.categories.find(
      category => category.id === id
    );
  }


  function accountById(id) {

    return AppState.data.accounts.find(
      account => account.id === id
    );
  }


  function populateCategorySelect(
    selectElement,
    type
  ) {

    if (!selectElement) return;


    const categories =
      AppState.data.categories.filter(
        category =>
          !type ||
          category.type === type
      );


    selectElement.innerHTML =
      categories.map(
        category => `

          <option value="${category.id}">
            ${Utils.escapeHTML(category.name)}
          </option>

        `
      ).join('');
  }


  function populateAccountSelect(
    selectElement
  ) {

    if (!selectElement) return;


    selectElement.innerHTML =
      AppState.data.accounts.map(
        account => `

          <option value="${account.id}">
            ${Utils.escapeHTML(account.name)}
          </option>

        `
      ).join('');
  }


  function populateFilterCategory(
    selectElement
  ) {

    if (!selectElement) return;


    const currentValue =
      selectElement.value;


    selectElement.innerHTML = `

      <option value="">
        All categories
      </option>

      ${AppState.data.categories.map(
        category => `

          <option value="${category.id}">
            ${Utils.escapeHTML(category.name)}
          </option>

        `
      ).join('')}

    `;


    selectElement.value =
      currentValue;
  }


  function accountBalance(accountId) {

    return AppState.data.transactions
      .filter(
        transaction =>
          transaction.accountId === accountId
      )
      .reduce(
        (sum, transaction) => {

          return (
            sum +
            (
              transaction.type === 'income'
                ? Number(transaction.amount)
                : -Number(transaction.amount)
            )
          );

        },
        0
      );
  }


  function totalBalance() {

    return AppState.data.accounts.reduce(
      (sum, account) =>
        sum +
        accountBalance(account.id),
      0
    );
  }


  function monthTotals(
    referenceDate = new Date()
  ) {

    let income = 0;

    let expense = 0;


    AppState.data.transactions.forEach(
      transaction => {

        if (
          !Utils.isSameMonth(
            transaction.date,
            referenceDate
          )
        ) {
          return;
        }


        if (
          transaction.type === 'income'
        ) {

          income += Number(
            transaction.amount
          );

        } else {

          expense += Number(
            transaction.amount
          );
        }
      }
    );


    return {
      income,
      expense
    };
  }


  function addTransaction(
    transaction
  ) {

    const isNew =
      !transaction.id;


    transaction.id =
      transaction.id ||
      Utils.uid('tx');


    transaction.amount =
      Number(transaction.amount);


    if (
      !Number.isFinite(
        transaction.amount
      ) ||
      transaction.amount <= 0
    ) {
      return false;
    }


    const existingIndex =
      AppState.data.transactions.findIndex(
        item =>
          item.id === transaction.id
      );


    if (existingIndex >= 0) {

      /*
        Preserve properties that aren't
        part of the form.
      */

      AppState.data.transactions[
        existingIndex
      ] = {

        ...AppState.data.transactions[
          existingIndex
        ],

        ...transaction

      };

    } else {

      AppState.data.transactions.unshift(
        transaction
      );
    }


    /*
      Round-up should only happen for
      newly created expenses.

      This prevents editing a transaction
      from adding another round-up.
    */

    if (
      isNew &&
      transaction.type === 'expense' &&
      !transaction._skipRoundup
    ) {

      const rounded =
        Math.ceil(
          transaction.amount / 10
        ) * 10;


      const roundUp =
        Number(
          (
            rounded -
            transaction.amount
          ).toFixed(2)
        );


      if (roundUp > 0) {

        const goal =
          AppState.data.goals
            .filter(
              goal =>
                goal.roundUp &&
                goal.current <
                goal.target
            )
            .sort(
              (a, b) =>
                (a.priority || 0) -
                (b.priority || 0)
            )[0];


        if (goal) {

          goal.current =
            Number(
              (
                goal.current +
                roundUp
              ).toFixed(2)
            );
        }
      }
    }


    Store.save(
      AppState.data
    );


    return true;
  }


  function deleteTransaction(
    id
  ) {

    AppState.data.transactions =
      AppState.data.transactions.filter(
        transaction =>
          transaction.id !== id
      );


    Store.save(
      AppState.data
    );
  }


  function getFiltered() {

    const search =
      (
        document.getElementById(
          'filter-search'
        )?.value || ''
      )
        .trim()
        .toLowerCase();


    const categoryFilter =
      document.getElementById(
        'filter-category'
      )?.value || '';


    const typeFilter =
      document.getElementById(
        'filter-type'
      )?.value || '';


    return AppState.data.transactions.filter(
      transaction => {

        if (
          categoryFilter &&
          transaction.categoryId !==
            categoryFilter
        ) {
          return false;
        }


        if (
          typeFilter &&
          transaction.type !==
            typeFilter
        ) {
          return false;
        }


        if (search) {

          const category =
            categoryById(
              transaction.categoryId
            );


          const searchable =
            (
              (transaction.note || '') +
              ' ' +
              (category
                ? category.name
                : '') +
              ' ' +
              (
                accountById(
                  transaction.accountId
                )?.name || ''
              )
            ).toLowerCase();


          if (
            !searchable.includes(
              search
            )
          ) {
            return false;
          }
        }


        return true;
      }
    );
  }


  function renderTable() {

    const tbody =
      document.getElementById(
        'tx-table-body'
      );


    const empty =
      document.getElementById(
        'tx-empty'
      );


    if (!tbody || !empty) {
      return;
    }


    const rows =
      getFiltered()
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );


    if (!rows.length) {

      tbody.innerHTML = '';

      empty.style.display =
        'block';

      return;
    }


    empty.style.display =
      'none';


    tbody.innerHTML =
      rows.map(
        transaction => {

          const category =
            categoryById(
              transaction.categoryId
            );


          const account =
            accountById(
              transaction.accountId
            );


          const note =
            transaction.note
              ? Utils.escapeHTML(
                  transaction.note
                )
              : '<span class="muted">No note</span>';


          const amountClass =
            transaction.type === 'income'
              ? 'tx-income'
              : 'tx-expense';


          const sign =
            transaction.type === 'income'
              ? '+'
              : '−';


          return `

            <tr>

              <td>
                ${Utils.formatDate(transaction.date)}
              </td>

              <td>
                ${Utils.escapeHTML(
                  category
                    ? category.name
                    : 'Other'
                )}
              </td>

              <td>
                ${note}
              </td>

              <td>
                ${Utils.escapeHTML(
                  account
                    ? account.name
                    : 'Unknown'
                )}
              </td>

              <td
                class="right tx-amount ${amountClass}">
                ${sign}${Utils.formatCurrency(
                  transaction.amount
                )}
              </td>

              <td>

                <div class="table-actions">

                  <button
                    type="button"
                    class="table-action"
                    data-edit-tx="${transaction.id}">
                    Edit
                  </button>

                  <button
                    type="button"
                    class="table-action delete"
                    data-delete-tx="${transaction.id}">
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          `;
        }
      ).join('');


    tbody
      .querySelectorAll(
        '[data-edit-tx]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            App.openTxModal(
              button.dataset.editTx
            );
          }
        );
      });


    tbody
      .querySelectorAll(
        '[data-delete-tx]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            const confirmed =
              confirm(
                'Delete this transaction?'
              );


            if (!confirmed) {
              return;
            }


            deleteTransaction(
              button.dataset.deleteTx
            );


            App.refreshAll();


            Utils.showToast(
              'Transaction deleted'
            );
          }
        );
      });
  }


  function renderDashboardRecent() {

    const element =
      document.getElementById(
        'dashboard-recent'
      );


    if (!element) return;


    const rows =
      AppState.data.transactions
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .slice(0, 6);


    if (!rows.length) {

      element.innerHTML = `

        <div class="empty-state">

          <p>
            No transactions yet.
          </p>

          <span class="muted small">
            Add your first transaction to see activity here.
          </span>

        </div>

      `;

      return;
    }


    element.innerHTML =
      rows.map(
        transaction => {

          const category =
            categoryById(
              transaction.categoryId
            );


          const amountClass =
            transaction.type === 'income'
              ? 'amount-income'
              : 'amount-expense';


          const sign =
            transaction.type === 'income'
              ? '+'
              : '−';


          return `

            <div class="tx-row">

              <div class="tx-row-left">

                <strong>
                  ${Utils.escapeHTML(
                    transaction.note ||
                    (
                      category
                        ? category.name
                        : 'Transaction'
                    )
                  )}
                </strong>

                <span class="tx-row-meta">

                  ${Utils.escapeHTML(
                    category
                      ? category.name
                      : ''
                  )}

                  ${category ? ' · ' : ''}

                  ${Utils.formatDateShort(
                    transaction.date
                  )}

                </span>

              </div>

              <span class="${amountClass}">
                ${sign}${Utils.formatCurrency(
                  transaction.amount
                )}
              </span>

            </div>

          `;
        }
      ).join('');
  }


  function categoryBreakdownThisMonth() {

    const map = {};


    AppState.data.transactions.forEach(
      transaction => {

        if (
          transaction.type !==
          'expense'
        ) {
          return;
        }


        if (
          !Utils.isSameMonth(
            transaction.date
          )
        ) {
          return;
        }


        map[
          transaction.categoryId
        ] =
          (
            map[
              transaction.categoryId
            ] || 0
          ) +
          Number(
            transaction.amount
          );
      }
    );


    return Object.entries(map)

      .map(
        ([categoryId, value]) => {

          const category =
            categoryById(
              categoryId
            );


          return {

            label:
              category
                ? category.name
                : 'Other',

            value:
              Number(value)

          };
        }
      )

      .sort(
        (a, b) =>
          b.value - a.value
      );
  }


  function last6MonthsTotals() {

    const months = [];

    const now =
      new Date();


    for (
      let i = 5;
      i >= 0;
      i--
    ) {

      const date =
        new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );


      months.push({

        key:
          Utils.monthKey(date),

        label:
          date.toLocaleDateString(
            'en-IN',
            {
              month: 'short'
            }
          ),

        income: 0,

        expense: 0

      });
    }


    AppState.data.transactions.forEach(
      transaction => {

        const key =
          Utils.monthKey(
            transaction.date
          );


        const month =
          months.find(
            item =>
              item.key === key
          );


        if (!month) {
          return;
        }


        if (
          transaction.type ===
          'income'
        ) {

          month.income +=
            Number(
              transaction.amount
            );

        } else {

          month.expense +=
            Number(
              transaction.amount
            );
        }
      }
    );


    return months;
  }


  return {

    categoryById,

    accountById,

    populateCategorySelect,

    populateAccountSelect,

    populateFilterCategory,

    accountBalance,

    totalBalance,

    monthTotals,

    addTransaction,

    deleteTransaction,

    renderTable,

    renderDashboardRecent,

    categoryBreakdownThisMonth,

    last6MonthsTotals
  };

})();