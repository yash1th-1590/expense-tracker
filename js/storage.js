/* =========================================================
   storage.js
   Handles all localStorage operations.
   ========================================================= */

const Store = (() => {

  const KEY = 'ledger_app_data_v2';


  function seedData() {

    const categories = [

      {
        id: Utils.uid('cat'),
        name: 'Food',
        color: 'coral',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Transport',
        color: 'sky',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Shopping',
        color: 'gold',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Bills',
        color: 'coral',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Entertainment',
        color: 'sky',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Health',
        color: 'mint',
        type: 'expense'
      },

      {
        id: Utils.uid('cat'),
        name: 'Salary',
        color: 'mint',
        type: 'income'
      },

      {
        id: Utils.uid('cat'),
        name: 'Freelance',
        color: 'mint',
        type: 'income'
      },

      {
        id: Utils.uid('cat'),
        name: 'Other',
        color: 'gold',
        type: 'expense'
      }
    ];


    const accounts = [

      {
        id: Utils.uid('acc'),
        name: 'Cash',
        type: 'cash'
      },

      {
        id: Utils.uid('acc'),
        name: 'Bank Account',
        type: 'bank'
      }

    ];


    return {

      accounts,

      categories,

      transactions: [],

      goals: [],

      budgets: {},

      settings: {
        currency: '₹'
      }

    };
  }


  function normalize(data) {

    if (!data || typeof data !== 'object') {
      return seedData();
    }


    if (!Array.isArray(data.accounts)) {
      data.accounts = [];
    }


    if (!Array.isArray(data.categories)) {
      data.categories = [];
    }


    if (!Array.isArray(data.transactions)) {
      data.transactions = [];
    }


    if (!Array.isArray(data.goals)) {
      data.goals = [];
    }


    if (!data.budgets ||
        typeof data.budgets !== 'object') {

      data.budgets = {};
    }


    if (!data.settings) {

      data.settings = {
        currency: '₹'
      };
    }


    return data;
  }


  function load() {

    try {

      const raw =
        localStorage.getItem(KEY);


      if (!raw) {

        const fresh =
          seedData();

        save(fresh);

        return fresh;
      }


      const parsed =
        JSON.parse(raw);

      return normalize(parsed);

    } catch (error) {

      console.error(
        'Unable to load saved data:',
        error
      );


      const fresh =
        seedData();

      save(fresh);

      return fresh;
    }
  }


  function save(data) {

    try {

      localStorage.setItem(
        KEY,
        JSON.stringify(data)
      );

    } catch (error) {

      console.error(
        'Unable to save data:',
        error
      );

      Utils.showToast(
        'Unable to save data locally'
      );
    }
  }


  function reset() {

    localStorage.removeItem(KEY);

    return load();
  }


  return {

    load,

    save,

    reset
  };

})();