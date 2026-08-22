const AppState = {

  data:
    Store.load()

};


const App = (() => {


  function init() {

    try {

      setDefaultDates();

      bindNavigation();

      bindModals();

      bindTransactionForm();

      bindGoalForm();

      bindContributionForm();

      bindQuickAdd();

      bindFilters();

      bindTopLevelButtons();

      refreshAll();

    } catch (error) {

      console.error(
        'Application initialization failed:',
        error
      );


      Utils.showToast(
        'Application could not be initialized. Check the browser console.'
      );
    }
  }


  function setDefaultDates() {

    const transactionDate =
      document.getElementById(
        'tx-date'
      );


    if (transactionDate) {

      transactionDate.value =
        Utils.todayISO();
    }


    const goalDate =
      document.getElementById(
        'goal-date'
      );


    if (goalDate) {

      const date =
        new Date();


      date.setMonth(
        date.getMonth() + 3
      );


      goalDate.value =
        date.toISOString()
          .slice(0, 10);
    }
  }


  function bindNavigation() {

    document
      .querySelectorAll(
        '.nav-item'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            switchView(
              button.dataset.view
            );
          }
        );
      });


    document
      .querySelectorAll(
        '[data-view-link]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            switchView(
              button.dataset.viewLink
            );
          }
        );
      });
  }


  function switchView(
    view
  ) {

    if (!view) {
      return;
    }


    document
      .querySelectorAll(
        '.nav-item'
      )
      .forEach(button => {

        button.classList.toggle(
          'is-active',
          button.dataset.view ===
            view
        );
      });


    document
      .querySelectorAll(
        '.view'
      )
      .forEach(section => {

        section.classList.toggle(
          'is-active',
          section.id ===
            `view-${view}`
        );
      });
  }


  function bindModals() {

    document
      .querySelectorAll(
        '[data-close-modal]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          closeAllModals
        );
      });


    document
      .querySelectorAll(
        '.modal-overlay'
      )
      .forEach(overlay => {

        overlay.addEventListener(
          'click',
          event => {

            if (
              event.target ===
              overlay
            ) {

              closeAllModals();
            }
          }
        );
      });


    const transactionButton =
      document.getElementById(
        'btn-open-tx-modal'
      );


    if (transactionButton) {

      transactionButton.addEventListener(
        'click',
        () => openTxModal()
      );
    }


    const goalButton =
      document.getElementById(
        'btn-open-goal-modal'
      );


    if (goalButton) {

      goalButton.addEventListener(
        'click',
        () => openGoalModal()
      );
    }


    const secondaryGoalButton =
      document.getElementById(
        'btn-open-goal-modal-secondary'
      );


    if (secondaryGoalButton) {

      secondaryGoalButton.addEventListener(
        'click',
        () => openGoalModal()
      );
    }


    document
      .querySelectorAll(
        '#tx-type-toggle .seg-btn'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            document
              .querySelectorAll(
                '#tx-type-toggle .seg-btn'
              )
              .forEach(
                item =>
                  item.classList.remove(
                    'is-active'
                  )
              );


            button.classList.add(
              'is-active'
            );


            Transactions
              .populateCategorySelect(

                document.getElementById(
                  'tx-category'
                ),

                button.dataset.type

              );
          }
        );
      });


    document.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Escape'
        ) {

          closeAllModals();
        }
      }
    );
  }


  function closeAllModals() {

    document
      .querySelectorAll(
        '.modal-overlay'
      )
      .forEach(modal => {

        modal.classList.remove(
          'is-open'
        );

        modal.setAttribute(
          'aria-hidden',
          'true'
        );
      });
  }


  function openModal(
    id
  ) {

    const modal =
      document.getElementById(
        id
      );


    if (!modal) {
      return;
    }


    modal.classList.add(
      'is-open'
    );


    modal.setAttribute(
      'aria-hidden',
      'false'
    );
  }


  function openTxModal(
    transactionId
  ) {

    const form =
      document.getElementById(
        'tx-form'
      );


    if (!form) return;


    form.reset();


    document.getElementById(
      'tx-id'
    ).value = '';


    document.getElementById(
      'tx-date'
    ).value =
      Utils.todayISO();


    document
      .querySelectorAll(
        '#tx-type-toggle .seg-btn'
      )
      .forEach(button => {

        button.classList.toggle(
          'is-active',
          button.dataset.type ===
            'expense'
        );
      });


    Transactions.populateCategorySelect(

      document.getElementById(
        'tx-category'
      ),

      'expense'

    );


    Transactions.populateAccountSelect(

      document.getElementById(
        'tx-account'
      )

    );


    const title =
      document.getElementById(
        'tx-modal-title'
      );


    title.textContent =
      'Add transaction';


    if (transactionId) {

      const transaction =
        AppState.data.transactions.find(
          item =>
            item.id ===
            transactionId
        );


      if (!transaction) {
        return;
      }


      title.textContent =
        'Edit transaction';


      document.getElementById(
        'tx-id'
      ).value =
        transaction.id;


      document.getElementById(
        'tx-amount'
      ).value =
        transaction.amount;


      document.getElementById(
        'tx-date'
      ).value =
        transaction.date;


      document.getElementById(
        'tx-note'
      ).value =
        transaction.note || '';


      document
        .querySelectorAll(
          '#tx-type-toggle .seg-btn'
        )
        .forEach(button => {

          button.classList.toggle(
            'is-active',
            button.dataset.type ===
              transaction.type
          );
        });


      Transactions.populateCategorySelect(

        document.getElementById(
          'tx-category'
        ),

        transaction.type

      );


      document.getElementById(
        'tx-category'
      ).value =
        transaction.categoryId;


      document.getElementById(
        'tx-account'
      ).value =
        transaction.accountId;
    }


    openModal(
      'modal-tx'
    );
  }


  function openGoalModal(
    goalId
  ) {

    const form =
      document.getElementById(
        'goal-form'
      );


    if (!form) return;


    form.reset();


    document.getElementById(
      'goal-id'
    ).value = '';


    const targetDate =
      document.getElementById(
        'goal-date'
      );


    const date =
      new Date();


    date.setMonth(
      date.getMonth() + 3
    );


    targetDate.value =
      date.toISOString()
        .slice(0, 10);


    document.getElementById(
      'goal-modal-title'
    ).textContent =
      'New goal';


    if (goalId) {

      const goal =
        AppState.data.goals.find(
          item =>
            item.id ===
            goalId
        );


      if (!goal) {
        return;
      }


      document.getElementById(
        'goal-modal-title'
      ).textContent =
        'Edit goal';


      document.getElementById(
        'goal-id'
      ).value =
        goal.id;


      document.getElementById(
        'goal-name'
      ).value =
        goal.name;


      document.getElementById(
        'goal-target'
      ).value =
        goal.target;


      document.getElementById(
        'goal-date'
      ).value =
        goal.targetDate;


      document.getElementById(
        'goal-color'
      ).value =
        goal.color ||
        'blue';


      document.getElementById(
        'goal-roundup'
      ).value =
        goal.roundUp
          ? '1'
          : '0';
    }


    openModal(
      'modal-goal'
    );
  }


  function openContributeModal(
    goalId
  ) {

    const goal =
      AppState.data.goals.find(
        item =>
          item.id ===
          goalId
      );


    if (!goal) {
      return;
    }


    const form =
      document.getElementById(
        'contribute-form'
      );


    form.reset();


    document.getElementById(
      'contribute-goal-id'
    ).value =
      goalId;


    document.getElementById(
      'contribute-goal-name'
    ).textContent =
      `Adding money to "${goal.name}"`;


    Transactions.populateAccountSelect(

      document.getElementById(
        'contribute-account'
      )

    );


    openModal(
      'modal-contribute'
    );
  }


  function bindTransactionForm() {

    const form =
      document.getElementById(
        'tx-form'
      );


    if (!form) return;


    form.addEventListener(
      'submit',
      event => {

        event.preventDefault();


        const activeType =
          document.querySelector(
            '#tx-type-toggle .seg-btn.is-active'
          );


        const amount =
          parseFloat(
            document.getElementById(
              'tx-amount'
            ).value
          );


        const date =
          document.getElementById(
            'tx-date'
          ).value;


        const categoryId =
          document.getElementById(
            'tx-category'
          ).value;


        const accountId =
          document.getElementById(
            'tx-account'
          ).value;


        if (
          !activeType ||
          !amount ||
          amount <= 0 ||
          !date ||
          !categoryId ||
          !accountId
        ) {

          Utils.showToast(
            'Please complete all required fields'
          );

          return;
        }


        const success =
          Transactions.addTransaction({

            id:
              document.getElementById(
                'tx-id'
              ).value ||
              undefined,

            type:
              activeType.dataset.type,

            amount,

            date,

            categoryId,

            accountId,

            note:
              document.getElementById(
                'tx-note'
              ).value.trim()

          });


        if (!success) {

          Utils.showToast(
            'Unable to save transaction'
          );

          return;
        }


        closeAllModals();


        refreshAll();


        Utils.showToast(
          'Transaction saved'
        );
      }
    );
  }


  function bindGoalForm() {

    const form =
      document.getElementById(
        'goal-form'
      );


    if (!form) return;


    form.addEventListener(
      'submit',
      event => {

        event.preventDefault();


        const name =
          document.getElementById(
            'goal-name'
          ).value.trim();


        const target =
          parseFloat(
            document.getElementById(
              'goal-target'
            ).value
          );


        const targetDate =
          document.getElementById(
            'goal-date'
          ).value;


        if (
          !name ||
          !target ||
          target <= 0 ||
          !targetDate
        ) {

          Utils.showToast(
            'Please complete all required fields'
          );

          return;
        }


        Goals.addGoal({

          id:
            document.getElementById(
              'goal-id'
            ).value ||
            undefined,

          name,

          target,

          targetDate,

          color:
            document.getElementById(
              'goal-color'
            ).value,

          roundUp:
            document.getElementById(
              'goal-roundup'
            ).value === '1'

        });


        closeAllModals();


        refreshAll();


        Utils.showToast(
          'Goal saved'
        );
      }
    );
  }


  function bindContributionForm() {

    const form =
      document.getElementById(
        'contribute-form'
      );


    if (!form) return;


    form.addEventListener(
      'submit',
      event => {

        event.preventDefault();


        const goalId =
          document.getElementById(
            'contribute-goal-id'
          ).value;


        const amount =
          parseFloat(
            document.getElementById(
              'contribute-amount'
            ).value
          );


        const accountId =
          document.getElementById(
            'contribute-account'
          ).value;


        if (
          !goalId ||
          !amount ||
          amount <= 0 ||
          !accountId
        ) {

          Utils.showToast(
            'Enter a valid contribution amount'
          );

          return;
        }


        const success =
          Goals.contribute(
            goalId,
            amount,
            accountId
          );


        if (!success) {

          Utils.showToast(
            'Unable to add contribution'
          );

          return;
        }


        closeAllModals();


        refreshAll();


        Utils.showToast(
          'Contribution added'
        );
      }
    );
  }


  function bindQuickAdd() {

    const input =
      document.getElementById(
        'quickadd-input'
      );


    const button =
      document.getElementById(
        'quickadd-submit'
      );


    if (!input || !button) {
      return;
    }


    const submit =
      () => {

        const parsed =
          Utils.parseQuickAdd(
            input.value,
            AppState.data.categories
          );


        if (
          !parsed ||
          !parsed.amount ||
          parsed.amount <= 0
        ) {

          Utils.showToast(
            'Include an amount, for example: coffee 150'
          );

          return;
        }


        const incomeGuess =
          /salary|freelance|income|refund/i
            .test(
              parsed.note
            );


        const type =
          incomeGuess
            ? 'income'
            : 'expense';


        let category =
          parsed.categoryGuess;


        if (
          !category ||
          category.type !==
            type
        ) {

          category =
            AppState.data.categories.find(
              item =>
                item.type ===
                type
            );
        }


        const account =
          AppState.data.accounts[0];


        if (!category || !account) {

          Utils.showToast(
            'No account or category is available'
          );

          return;
        }


        Transactions.addTransaction({

          type,

          amount:
            parsed.amount,

          date:
            parsed.dateISO,

          categoryId:
            category.id,

          accountId:
            account.id,

          note:
            parsed.note

        });


        input.value = '';


        refreshAll();


        Utils.showToast(
          `Added ${Utils.formatCurrency(
            parsed.amount
          )} · ${category.name}`
        );
      };


    button.addEventListener(
      'click',
      submit
    );


    input.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Enter'
        ) {

          event.preventDefault();

          submit();
        }
      }
    );
  }


  function bindFilters() {

    const search =
      document.getElementById(
        'filter-search'
      );


    const category =
      document.getElementById(
        'filter-category'
      );


    const type =
      document.getElementById(
        'filter-type'
      );


    if (search) {

      search.addEventListener(
        'input',
        () =>
          Transactions.renderTable()
      );
    }


    if (category) {

      category.addEventListener(
        'change',
        () =>
          Transactions.renderTable()
      );
    }


    if (type) {

      type.addEventListener(
        'change',
        () =>
          Transactions.renderTable()
      );
    }
  }


  function bindTopLevelButtons() {

    const exportButton =
      document.getElementById(
        'btn-export'
      );


    if (exportButton) {

      exportButton.addEventListener(
        'click',
        () =>
          Reports.exportCSV()
      );
    }


    const resetButton =
      document.getElementById(
        'btn-reset'
      );


    if (resetButton) {

      resetButton.addEventListener(
        'click',
        () => {

          const confirmed =
            confirm(
              'This will erase all saved transactions, goals and budgets. Continue?'
            );


          if (!confirmed) {
            return;
          }


          AppState.data =
            Store.reset();


          refreshAll();


          Utils.showToast(
            'Data reset successfully'
          );
        }
      );
    }
  }


  function refreshAll() {

    renderDashboardStats();


    Transactions.renderDashboardRecent();


    Goals.renderDashboardMini();


    const donut =
      document.getElementById(
        'chart-donut'
      );


    const breakdown =
      Transactions.categoryBreakdownThisMonth();


    Charts.drawDonut(
      donut,
      breakdown
    );


    Charts.renderDonutLegend(
      document.getElementById(
        'donut-legend'
      ),
      breakdown
    );


    Charts.drawTrendBar(

      document.getElementById(
        'chart-trend'
      ),

      Transactions.last6MonthsTotals()

    );


    const monthLabel =
      document.getElementById(
        'donut-month-label'
      );


    if (monthLabel) {

      monthLabel.textContent =
        new Date().toLocaleDateString(
          'en-IN',
          {
            month: 'long',
            year: 'numeric'
          }
        );
    }


    Transactions.populateFilterCategory(

      document.getElementById(
        'filter-category'
      )

    );


    Transactions.renderTable();


    Goals.renderGoalsGrid();


    Budgets.renderBudgetList();


    Reports.render();
  }


  function renderDashboardStats() {

    const {
      income,
      expense
    } =
      Transactions.monthTotals();


    const balance =
      Transactions.totalBalance();


    const net =
      income - expense;


    const savingsRate =
      income > 0
        ? Math.round(
            (net / income) *
            100
          )
        : 0;


    const balanceElement =
      document.getElementById(
        'stat-balance'
      );


    const balanceFoot =
      document.getElementById(
        'stat-balance-foot'
      );


    const incomeElement =
      document.getElementById(
        'stat-income'
      );


    const expenseElement =
      document.getElementById(
        'stat-expense'
      );


    const savingsElement =
      document.getElementById(
        'stat-savings-rate'
      );


    if (balanceElement) {

      balanceElement.textContent =
        Utils.formatCurrency(
          balance
        );
    }


    if (balanceFoot) {

      balanceFoot.textContent =
        `${AppState.data.accounts.length} account${
          AppState.data.accounts.length !== 1
            ? 's'
            : ''
        }`;
    }


    if (incomeElement) {

      incomeElement.textContent =
        Utils.formatCurrency(
          income
        );
    }


    if (expenseElement) {

      expenseElement.textContent =
        Utils.formatCurrency(
          expense
        );
    }


    if (savingsElement) {

      savingsElement.textContent =
        `${savingsRate}%`;
    }


    const currentMonth =
      new Date().toLocaleDateString(
        'en-IN',
        {
          month: 'long',
          year: 'numeric'
        }
      );


    const incomeFoot =
      document.getElementById(
        'stat-income-foot'
      );


    const expenseFoot =
      document.getElementById(
        'stat-expense-foot'
      );


    if (incomeFoot) {

      incomeFoot.textContent =
        currentMonth;
    }


    if (expenseFoot) {

      expenseFoot.textContent =
        currentMonth;
    }
  }


  return {

    init,

    refreshAll,

    openTxModal,

    openGoalModal,

    openContributeModal

  };

})();


document.addEventListener(
  'DOMContentLoaded',
  App.init
);