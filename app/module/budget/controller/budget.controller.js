const budgetModel = require("../model/budget.model");

class BudgetController {
    async setBudget(req, res) {
        try {
            const budget = await budgetModel.findOneAndUpdate(
              { userId: req.user.id, category: req.body.category },
              { ...req.body, userId: req.user.id },
              { upsert: true, new: true }
            );
            res.json(budget);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
    async getBudgets(req, res) {
        try {
            const budget = await budgetModel.find({ userId: req.user.id });
            res.json(budget);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
}

module.exports = new BudgetController();