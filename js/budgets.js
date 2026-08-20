/* =========================================================
   budgets.js
   Category-based monthly budget management.
   ========================================================= */

const Budgets = (() => {


  function spentThisMonth(
    categoryId
  ) {

    return AppState.data.transactions

      .filter(
        transaction =>

          transaction.categoryId ===
            categoryId &&

          transaction.type ===
            'expense' &&

          Utils.isSameMonth(
            transaction.date
          )
      )

      .reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.amount
          ),

        0
      );
  }


  function setBudget(
    categoryId,
    amount
  ) {

    amount =
      Number(amount) || 0;


    if (amount < 0) {
      amount = 0;
    }


    AppState.data.budgets[
      categoryId
    ] = amount;


    Store.save(
      AppState.data
    );
  }


  function renderBudgetList() {

    const container =
      document.getElementById(
        'budget-list'
      );


    if (!container) {
      return;
    }


    const expenseCategories =
      AppState.data.categories.filter(
        category =>
          category.type ===
          'expense'
      );


    if (!expenseCategories.length) {

      container.innerHTML = `

        <div class="empty-state">
          <p>No expense categories available.</p>
        </div>

      `;

      return;
    }


    container.innerHTML =
      expenseCategories.map(
        category => {

          const budget =
            Number(
              AppState.data.budgets[
                category.id
              ] || 0
            );


          const spent =
            spentThisMonth(
              category.id
            );


          const percentage =
            budget > 0
              ? Math.round(
                  (spent / budget) *
                  100
                )
              : 0;


          const width =
            Math.min(
              100,
              percentage
            );


          const isOver =
            budget > 0 &&
            spent > budget;


          const isWarning =
            budget > 0 &&
            percentage >= 75 &&
            !isOver;


          let status;


          if (isOver) {

            status =
              `${Utils.formatCurrency(
                spent - budget
              )} over budget`;

          } else if (
            budget > 0
          ) {

            status =
              `${Utils.formatCurrency(
                budget - spent
              )} remaining`;

          } else {

            status =
              'No limit set';
          }


          const barClass =
            isOver
              ? 'over'
              : '';


          return `

            <div class="budget-item">

              <div class="budget-head">

                <div>

                  <div class="budget-name">
                    ${Utils.escapeHTML(
                      category.name
                    )}
                  </div>

                  <div
                    class="budget-values">

                    ${Utils.formatCurrency(
                      spent
                    )}
                    spent

                    ${
                      budget > 0
                        ? ` of ${Utils.formatCurrency(
                            budget
                          )}`
                        : ''
                    }

                  </div>

                </div>


                <input
                  type="number"
                  min="0"
                  step="100"
                  class="budget-input"
                  data-budget-category="${category.id}"
                  value="${
                    budget > 0
                      ? budget
                      : ''
                  }"
                  placeholder="Monthly limit"
                  style="max-width:150px;">

              </div>


              <div class="budget-progress">

                <span
                  class="${barClass}"
                  style="
                    width:${width}%;
                    background:${
                      isOver
                        ? 'var(--danger)'
                        : isWarning
                          ? 'var(--warning)'
                          : 'var(--primary)'
                    };
                  ">
                </span>

              </div>


              <div class="budget-footer">

                <span class="budget-status">
                  ${status}
                </span>

                <span class="small muted">
                  ${
                    budget > 0
                      ? `${percentage}% used`
                      : 'Set a limit'
                  }
                </span>

              </div>

            </div>

          `;
        }
      ).join('');


    container
      .querySelectorAll(
        '[data-budget-category]'
      )
      .forEach(input => {

        input.addEventListener(
          'change',
          () => {

            setBudget(
              input.dataset
                .budgetCategory,

              input.value
            );


            renderBudgetList();


            Utils.showToast(
              'Budget updated'
            );
          }
        );
      });
  }


  return {

    spentThisMonth,

    setBudget,

    renderBudgetList

  };

})();