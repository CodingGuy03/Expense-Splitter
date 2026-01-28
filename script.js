let members = JSON.parse(localStorage.getItem("members")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const memberInput = document.getElementById("memberInput");
const addMemberBtn = document.getElementById("addMemberBtn");
const memberList = document.getElementById("memberList");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const paidBySelect = document.getElementById("paidBy");
const involvedMembersDiv = document.getElementById("involvedMembers");
const addExpenseBtn = document.getElementById("addExpenseBtn");

const summaryDiv = document.getElementById("summary");

function saveData() {
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("expenses", JSON.stringify(expenses));
}


function renderMembers() {
  memberList.innerHTML = "";
  paidBySelect.innerHTML = "";
  involvedMembersDiv.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.innerText = "Select ";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  paidBySelect.appendChild(defaultOption);

  members.forEach(member => {
    const li = document.createElement("li");
    li.innerText = member;
    memberList.appendChild(li);

    const option = document.createElement("option");
    option.value = member;
    option.innerText = member;
    paidBySelect.appendChild(option);

    const label = document.createElement("label");
    label.className = "member-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = member;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + member));
    involvedMembersDiv.appendChild(label);
  });
}


addMemberBtn.addEventListener("click", () => {
  const name = memberInput.value.trim();
  if (name && !members.includes(name)) {
    members.push(name);
    saveData();
    renderMembers();
    memberInput.value = "";
    renderSummary();
  }
});

addExpenseBtn.addEventListener("click", () => {
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const paidBy = paidBySelect.value;

  const involved = [];
  involvedMembersDiv.querySelectorAll("input:checked").forEach(cb => {
    involved.push(cb.value);
  });

  if (!name || !amount || involved.length === 0) {
    alert("Please fill all expense details");
    return;
  }

  expenses.push({
    name,
    amount,
    paidBy,
    involved
  });

  saveData();
  expenseName.value = "";
  expenseAmount.value = "";
  involvedMembersDiv.querySelectorAll("input").forEach(cb => cb.checked = false);
  renderSummary();
});

function calculateBalances() {
  const balances = {};
  members.forEach(m => balances[m] = 0);

  expenses.forEach(exp => {
    const share = exp.amount / exp.involved.length;

    balances[exp.paidBy] += exp.amount;

    exp.involved.forEach(person => {
      balances[person] -= share;
    });
  });

  return balances;
}

function renderSummary() {
  summaryDiv.innerHTML = "";

  const balances = calculateBalances();
  const settlements = calculateSettlements(balances);

  if (settlements.length === 0) {
    const p = document.createElement("p");
    p.innerText = "All expenses are settled 🎉";
    summaryDiv.appendChild(p);
    return;
  }

  settlements.forEach(line => {
    const p = document.createElement("p");
    p.innerText = line;

    if (line.includes("owes")) {
      p.className = "balanceNegative";
    } 

    summaryDiv.appendChild(p);
  });
}



function calculateSettlements(balances) {
  const debtors = [];
  const creditors = [];

  for (let person in balances) {
    const amount = balances[person];

    if (amount < 0) {
      debtors.push({ person, amount: Math.abs(amount) });
    } else if (amount > 0) {
      creditors.push({ person, amount });
    }
  }

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push(
      `${debtor.person} owes ₹${settleAmount.toFixed(2)} to ${creditor.person}`
    );

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }
  return settlements;
}
renderMembers();
renderSummary();
