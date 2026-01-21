const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // ========== LIBRARIAN ENDPOINTS ==========

  // Add book to library
  router.post('/books', authenticate, authorize('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
      const { isbn, title, author, publisher, category, acquisitionDate, totalCopies, location } = req.body;

      if (!title || !author || !acquisitionDate || !totalCopies) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const book = await db.models.Book.create({
        schoolId: req.user.schoolId,
        isbn,
        title,
        author,
        publisher,
        category,
        acquisitionDate: new Date(acquisitionDate),
        totalCopies,
        availableCopies: totalCopies,
        location,
        createdBy: req.user.id,
      });

      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List books
  router.get('/books', authenticate, async (req, res) => {
    try {
      const { category, status, search } = req.query;
      const where = { schoolId: req.user.schoolId };

      if (category) where.category = category;
      if (status) where.status = status;

      let books = await db.models.Book.findAll({
        where,
        order: [['title', 'ASC']],
      });

      if (search) {
        books = books.filter(
          (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.json(books);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get book by ID
  router.get('/books/:id', authenticate, async (req, res) => {
    try {
      const book = await db.models.Book.findByPk(req.params.id);

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update book
  router.put('/books/:id', authenticate, authorize('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
      const book = await db.models.Book.findByPk(req.params.id);

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const { totalCopies, availableCopies, location, status, category } = req.body;

      if (totalCopies) book.totalCopies = totalCopies;
      if (availableCopies !== undefined) book.availableCopies = availableCopies;
      if (location) book.location = location;
      if (status) book.status = status;
      if (category) book.category = category;

      await book.save();
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== BOOK ISSUE ENDPOINTS ==========

  // Issue book to student
  router.post('/issues', authenticate, authorize('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
      const { bookId, studentId, dueDate } = req.body;

      if (!bookId || !studentId || !dueDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const book = await db.models.Book.findByPk(bookId);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      if (book.availableCopies <= 0) {
        return res.status(400).json({ error: 'No copies available' });
      }

      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const issue = await db.models.BookIssue.create({
        bookId,
        studentId,
        issuedDate: new Date(),
        dueDate: new Date(dueDate),
        issuedBy: req.user.id,
      });

      // Update available copies
      book.availableCopies -= 1;
      if (book.availableCopies === 0) {
        book.status = 'OUT_OF_STOCK';
      }
      await book.save();

      res.status(201).json(issue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List book issues
  router.get('/issues', authenticate, async (req, res) => {
    try {
      const { studentId, status } = req.query;
      const where = {};

      if (studentId) where.studentId = studentId;
      if (status) where.status = status;

      const issues = await db.models.BookIssue.findAll({
        where,
        include: [
          { model: db.models.Book, as: 'book' },
          { model: db.models.Student, as: 'student' },
          { model: db.models.User, as: 'issuedByUser', attributes: ['id', 'email', 'name'] },
          { model: db.models.User, as: 'receivedByUser', attributes: ['id', 'email', 'name'] },
        ],
        order: [['issuedDate', 'DESC']],
      });

      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Return book
  router.post('/issues/:id/return', authenticate, authorize('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
      const { condition, damageDescription, replacementCost } = req.body;

      const issue = await db.models.BookIssue.findByPk(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: 'Book issue not found' });
      }

      const returnDate = new Date();
      const daysOverdue = Math.max(0, Math.floor((returnDate - issue.dueDate) / (1000 * 60 * 60 * 24)));
      const finePerDay = 10; // KES 10 per day

      issue.returnedDate = returnDate;
      issue.status = 'RETURNED';
      issue.condition = condition || 'GOOD';
      issue.damageDescription = damageDescription;
      issue.replacementCost = replacementCost;
      issue.fineAmount = daysOverdue * finePerDay;
      issue.receivedBy = req.user.id;

      await issue.save();

      // Update book availability
      const book = await db.models.Book.findByPk(issue.bookId);
      if (condition === 'DAMAGED' || condition === 'POOR') {
        book.status = 'DAMAGED';
      } else {
        book.availableCopies += 1;
        if (book.availableCopies > 0) {
          book.status = 'AVAILABLE';
        }
      }
      await book.save();

      res.json({
        message: 'Book returned successfully',
        issue,
        fine: issue.fineAmount > 0 ? `KES ${issue.fineAmount}` : 'No fine',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get student's issued books
  router.get('/student/:studentId/books', authenticate, async (req, res) => {
    try {
      const issues = await db.models.BookIssue.findAll({
        where: { studentId: req.params.studentId, status: 'ISSUED' },
        include: [
          { model: db.models.Book, as: 'book' },
          { model: db.models.User, as: 'issuedByUser', attributes: ['id', 'email', 'name'] },
        ],
        order: [['issuedDate', 'DESC']],
      });

      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get overdue books
  router.get('/overdue', authenticate, authorize('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
      const today = new Date();

      const overdueIssues = await db.models.BookIssue.findAll({
        where: {
          status: 'ISSUED',
          dueDate: { [db.sequelize.Op.lt]: today },
        },
        include: [
          { model: db.models.Book, as: 'book' },
          { model: db.models.Student, as: 'student' },
        ],
        order: [['dueDate', 'ASC']],
      });

      res.json(overdueIssues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get library statistics
  router.get('/stats', authenticate, authorize('ADMIN', 'LIBRARIAN', 'PRINCIPAL'), async (req, res) => {
    try {
      const totalBooks = await db.models.Book.count({
        where: { schoolId: req.user.schoolId },
      });

      const totalIssued = await db.models.BookIssue.count({
        where: { status: 'ISSUED' },
      });

      const overdueCount = await db.models.BookIssue.count({
        where: {
          status: 'ISSUED',
          dueDate: { [db.sequelize.Op.lt]: new Date() },
        },
      });

      const categories = await db.sequelize.query(
        `SELECT category, COUNT(*) as count FROM books WHERE schoolId = ? GROUP BY category`,
        {
          replacements: [req.user.schoolId],
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      res.json({
        totalBooks,
        totalIssued,
        overdueCount,
        availableBooks: totalBooks - totalIssued,
        categories,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
