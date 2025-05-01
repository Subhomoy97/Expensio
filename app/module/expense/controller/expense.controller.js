const Expense = require("../model/expense.model");
class ExpenseController {
    async addExpense(req, res) {
        try {
            const expense = new Expense({ ...req.body, userId: req.user.id });
            await expense.save();
            res.status(201).json(expense);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
    async getExpenses(req, res) {
        try {
            const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
            res.json(expenses);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
    async updateExpense(req, res) {
        try {
            const updated = await Expense.findOneAndUpdate(
              { _id: req.params.id, userId: req.user.id },
              req.body,
              { new: true }
            );
            res.json(updated);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
    async deleteExpense(req, res) {
        try {
            await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
            res.json({ message: 'Deleted' });
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
}

module.exports = new ExpenseController();