const Goals = (() => {


  const COLORS = {

    gold: '#d97706',

    blue: '#2563eb',

    green: '#16a34a',

    red: '#dc2626'

  };


  function getColor(
    color
  ) {

    return (
      COLORS[color] ||
      COLORS.blue
    );
  }


  function suggestedWeeklyAmount(
    goal
  ) {

    const days =
      Utils.daysBetween(
        goal.targetDate
      );


    if (days <= 0) {
      return null;
    }


    const remaining =
      Math.max(
        0,
        Number(goal.target) -
        Number(goal.current)
      );


    const weeks =
      Math.max(
        1,
        Math.ceil(days / 7)
      );


    return remaining / weeks;
  }


  function addGoal(goal) {

    goal.id =
      goal.id ||
      Utils.uid('goal');


    goal.current =
      Number(goal.current || 0);


    goal.target =
      Number(goal.target || 0);


    goal.priority =
      goal.priority ??
      AppState.data.goals.length;


    const existingIndex =
      AppState.data.goals.findIndex(
        item =>
          item.id === goal.id
      );


    if (
      existingIndex >= 0
    ) {

      AppState.data.goals[
        existingIndex
      ] = {

        ...AppState.data.goals[
          existingIndex
        ],

        ...goal

      };

    } else {

      AppState.data.goals.push(
        goal
      );
    }


    Store.save(
      AppState.data
    );
  }


  function deleteGoal(
    id
  ) {

    AppState.data.goals =
      AppState.data.goals.filter(
        goal =>
          goal.id !== id
      );


    Store.save(
      AppState.data
    );
  }


  function contribute(
    goalId,
    amount,
    accountId
  ) {

    const goal =
      AppState.data.goals.find(
        item =>
          item.id === goalId
      );


    if (!goal) {
      return false;
    }


    amount =
      Number(amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return false;
    }


    const remaining =
      Math.max(
        0,
        Number(goal.target) -
        Number(goal.current)
      );


    if (amount > remaining) {

      amount =
        remaining;
    }


    if (amount <= 0) {
      return false;
    }


    goal.current =
      Number(
        (
          Number(goal.current) +
          amount
        ).toFixed(2)
      );


    const category =
      ensureGoalCategory();


    Transactions.addTransaction({

      type: 'expense',

      amount,

      accountId,

      categoryId:
        category.id,

      note:
        `Contribution to ${goal.name}`,

      date:
        Utils.todayISO(),

      _skipRoundup:
        true
    });


    Store.save(
      AppState.data
    );


    return true;
  }


  function ensureGoalCategory() {

    let category =
      AppState.data.categories.find(
        item =>
          item.name ===
          'Savings Transfer'
      );


    if (!category) {

      category = {

        id:
          Utils.uid('cat'),

        name:
          'Savings Transfer',

        color:
          'gold',

        type:
          'expense'

      };


      AppState.data.categories.push(
        category
      );
    }


    return category;
  }


  function renderGoalsGrid() {

    const grid =
      document.getElementById(
        'goals-grid'
      );


    const empty =
      document.getElementById(
        'goals-empty'
      );


    if (!grid || !empty) {
      return;
    }


    const goals =
      AppState.data.goals
        .slice()
        .sort(
          (a, b) =>
            (a.priority || 0) -
            (b.priority || 0)
        );


    if (!goals.length) {

      grid.innerHTML = '';

      empty.style.display =
        'block';

      return;
    }


    empty.style.display =
      'none';


    grid.innerHTML =
      goals.map(
        goal => {

          const target =
            Number(goal.target) || 0;


          const current =
            Number(goal.current) || 0;


          const percentage =
            target > 0
              ? Math.min(
                  100,
                  Math.round(
                    (current / target) *
                    100
                  )
                )
              : 0;


          const daysLeft =
            Utils.daysBetween(
              goal.targetDate
            );


          const weekly =
            suggestedWeeklyAmount(
              goal
            );


          let deadlineText;


          if (daysLeft > 0) {

            deadlineText =
              `${daysLeft} days left`;

          } else if (
            daysLeft === 0
          ) {

            deadlineText =
              'Due today';

          } else {

            deadlineText =
              `${Math.abs(daysLeft)} days overdue`;
          }


          const color =
            getColor(
              goal.color
            );


          return `

            <article
              class="goal-card">

              <div class="goal-top">

                <div>

                  <div class="goal-name">
                    ${Utils.escapeHTML(
                      goal.name
                    )}
                  </div>

                  <div class="goal-target-date">
                    ${deadlineText}
                  </div>

                </div>

                <div
                  class="goal-percent">
                  ${percentage}%
                </div>

              </div>


              <div
                class="goal-progress">

                <div
                  class="goal-progress-bar"
                  style="
                    width:${percentage}%;
                    background:${color};
                  ">
                </div>

              </div>


              <div class="goal-amounts">

                <span>
                  ${Utils.formatCurrency(
                    current
                  )}
                  saved
                </span>

                <span>
                  of
                  ${Utils.formatCurrency(
                    target
                  )}
                </span>

              </div>


              ${
                weekly &&
                percentage < 100
                  ? `
                    <div
                      class="muted small"
                      style="margin-top:10px;">
                      Recommended:
                      ${Utils.formatCurrency(
                        weekly
                      )}
                      per week
                    </div>
                  `
                  : ''
              }


              <div class="goal-actions">

                <button
                  type="button"
                  class="btn-primary"
                  data-contribute="${goal.id}">
                  Add money
                </button>

                <button
                  type="button"
                  class="btn-secondary"
                  data-edit-goal="${goal.id}">
                  Edit
                </button>

                <button
                  type="button"
                  class="btn-secondary"
                  data-delete-goal="${goal.id}">
                  Delete
                </button>

              </div>

            </article>

          `;
        }
      ).join('');


    grid
      .querySelectorAll(
        '[data-contribute]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            App.openContributeModal(
              button.dataset.contribute
            );
          }
        );
      });


    grid
      .querySelectorAll(
        '[data-edit-goal]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            App.openGoalModal(
              button.dataset.editGoal
            );
          }
        );
      });


    grid
      .querySelectorAll(
        '[data-delete-goal]'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            if (
              !confirm(
                'Delete this goal? The recorded goal progress will be removed.'
              )
            ) {
              return;
            }


            deleteGoal(
              button.dataset.deleteGoal
            );


            App.refreshAll();


            Utils.showToast(
              'Goal deleted'
            );
          }
        );
      });
  }


  function renderDashboardMini() {

    const element =
      document.getElementById(
        'dashboard-goals'
      );


    if (!element) return;


    const goals =
      AppState.data.goals
        .slice()
        .sort(
          (a, b) =>
            (a.priority || 0) -
            (b.priority || 0)
        )
        .slice(0, 5);


    if (!goals.length) {

      element.innerHTML = `

        <div class="empty-state">

          <p>
            No goals yet.
          </p>

          <span class="muted small">
            Create your first savings goal.
          </span>

        </div>

      `;

      return;
    }


    element.innerHTML =
      goals.map(
        goal => {

          const percentage =
            goal.target > 0
              ? Math.min(
                  100,
                  Math.round(
                    (goal.current /
                      goal.target) *
                    100
                  )
                )
              : 0;


          const color =
            getColor(
              goal.color
            );


          return `

            <div class="goal-mini">

              <div class="goal-mini-head">

                <span class="goal-mini-name">
                  ${Utils.escapeHTML(
                    goal.name
                  )}
                </span>

                <span class="goal-mini-value">
                  ${percentage}%
                </span>

              </div>

              <div
                class="goal-mini-progress">

                <span
                  style="
                    width:${percentage}%;
                    background:${color};
                  ">
                </span>

              </div>

            </div>

          `;
        }
      ).join('');
  }


  return {

    addGoal,

    deleteGoal,

    contribute,

    renderGoalsGrid,

    renderDashboardMini,

    ensureGoalCategory

  };

})();