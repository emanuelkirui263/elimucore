const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportCardGenerator {
  constructor() {
    this.doc = null;
    this.width = 595; // A4 width
    this.height = 842; // A4 height
    this.margin = 40;
  }

  generateReportCard(studentData, marksData, schoolData) {
    return new Promise((resolve, reject) => {
      try {
        this.doc = new PDFDocument({
          size: 'A4',
          margin: this.margin,
        });

        const filename = `report_card_${studentData.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../reports', filename);

        // Create reports directory if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, '../reports'))) {
          fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);

        this.doc.pipe(stream);

        // Header
        this._drawHeader(schoolData);

        // Student Info
        this._drawStudentInfo(studentData);

        // Marks Table
        this._drawMarksTable(marksData);

        // Summary
        this._drawSummary(marksData);

        // Remarks
        this._drawRemarks(marksData);

        // Footer
        this._drawFooter();

        this.doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  _drawHeader(schoolData) {
    this.doc.fontSize(16).font('Helvetica-Bold').text(schoolData.name, { align: 'center' });
    this.doc.fontSize(10).font('Helvetica').text(schoolData.location, { align: 'center' });
    this.doc.fontSize(10).text('STUDENT REPORT CARD', { align: 'center' });
    this.doc.moveDown(0.5);
  }

  _drawStudentInfo(studentData) {
    const y = this.doc.y;
    const leftX = this.margin;
    const rightX = this.width - this.margin - 200;

    this.doc.fontSize(11).font('Helvetica-Bold').text('Student Information', leftX, y);
    this.doc.fontSize(10).font('Helvetica');

    const infoPairs = [
      { label: 'Name:', value: `${studentData.firstName} ${studentData.lastName}` },
      { label: 'Admission No.:', value: studentData.admissionNumber },
      { label: 'Form:', value: studentData.classLevel.replace('FORM', '') },
      { label: 'Stream:', value: studentData.stream || 'N/A' },
    ];

    let currentY = this.doc.y + 10;

    infoPairs.forEach((pair) => {
      this.doc.text(`${pair.label} ${pair.value}`, leftX, currentY);
      currentY += 15;
    });

    this.doc.moveDown(2);
  }

  _drawMarksTable(marksData) {
    this.doc.fontSize(11).font('Helvetica-Bold').text('Academic Performance', this.margin, this.doc.y);
    this.doc.moveDown(0.3);

    const table = {
      headers: ['Subject', 'Marks', 'Grade', 'Teacher'],
      rows: marksData.map((mark) => [mark.subjectName, mark.marksObtained, mark.grade, mark.teacherName || 'N/A']),
    };

    this._drawTable(table, 10, this.doc.y);
  }

  _drawTable(table, fontSize, startY) {
    const columnWidths = [150, 80, 80, 130];
    const rowHeight = 25;
    let y = startY;

    // Draw headers
    this.doc.fontSize(fontSize).font('Helvetica-Bold').fillColor('#000000');
    let x = this.margin;

    table.headers.forEach((header, i) => {
      this.doc.rect(x, y, columnWidths[i], rowHeight).stroke();
      this.doc.text(header, x + 5, y + 5, { width: columnWidths[i] - 10, align: 'left' });
      x += columnWidths[i];
    });

    y += rowHeight;

    // Draw rows
    this.doc.fontSize(fontSize).font('Helvetica').fillColor('#000000');

    table.rows.forEach((row) => {
      x = this.margin;
      let maxHeight = rowHeight;

      row.forEach((cell, i) => {
        this.doc.rect(x, y, columnWidths[i], rowHeight).stroke();
        this.doc.text(String(cell), x + 5, y + 5, { width: columnWidths[i] - 10, align: 'left' });
        x += columnWidths[i];
      });

      y += rowHeight;
    });
  }

  _drawSummary(marksData) {
    this.doc.moveDown(1);
    this.doc.fontSize(11).font('Helvetica-Bold').text('Summary', this.margin, this.doc.y);

    const total = marksData.reduce((sum, mark) => sum + mark.marksObtained, 0);
    const average = Math.round(total / marksData.length);
    const maxMarks = marksData.length * 100;

    const summaryData = [
      { label: 'Total Marks:', value: `${total}/${maxMarks}` },
      { label: 'Average:', value: `${average}%` },
      { label: 'Grade:', value: this._getOverallGrade(average) },
      { label: 'Rank:', value: 'TBD' }, // Will be calculated separately
    ];

    this.doc.fontSize(10).font('Helvetica').moveDown(0.3);
    summaryData.forEach((item) => {
      this.doc.text(`${item.label} ${item.value}`);
    });
  }

  _drawRemarks(marksData) {
    this.doc.moveDown(1);
    this.doc.fontSize(11).font('Helvetica-Bold').text('Remarks', this.margin, this.doc.y);

    const average = Math.round(marksData.reduce((sum, mark) => sum + mark.marksObtained, 0) / marksData.length);
    let remark = '';

    if (average >= 80) remark = 'Excellent performance. Keep up the good work!';
    else if (average >= 70) remark = 'Good performance. Strive for more improvement.';
    else if (average >= 60) remark = 'Satisfactory performance. More effort required.';
    else remark = 'Needs improvement. Seek additional support.';

    this.doc.fontSize(10).font('Helvetica').text(remark, this.margin, this.doc.y, { width: this.width - 2 * this.margin });
  }

  _drawFooter() {
    const footerY = this.height - 50;

    this.doc.fontSize(9).font('Helvetica').text('Principal Signature: ___________________', this.margin, footerY);
    this.doc.text('Date: ___________________', this.width / 2, footerY);

    this.doc.fontSize(8).text(`Generated on ${new Date().toLocaleDateString()}`, this.margin, footerY + 40, {
      align: 'center',
    });
  }

  _getOverallGrade(average) {
    if (average >= 80) return 'A+';
    if (average >= 75) return 'A';
    if (average >= 70) return 'A-';
    if (average >= 65) return 'B+';
    if (average >= 60) return 'B';
    if (average >= 55) return 'B-';
    if (average >= 50) return 'C+';
    if (average >= 45) return 'C';
    if (average >= 40) return 'C-';
    if (average >= 35) return 'D+';
    if (average >= 30) return 'D';
    if (average >= 25) return 'D-';
    if (average >= 20) return 'E';
    return 'INCOMPLETE';
  }
}

class FeeStatementGenerator {
  constructor() {
    this.doc = null;
    this.width = 595;
    this.height = 842;
    this.margin = 40;
  }

  generateFeeStatement(studentData, accountData, schoolData) {
    return new Promise((resolve, reject) => {
      try {
        this.doc = new PDFDocument({
          size: 'A4',
          margin: this.margin,
        });

        const filename = `fee_statement_${studentData.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../reports', filename);

        if (!fs.existsSync(path.join(__dirname, '../reports'))) {
          fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        this.doc.pipe(stream);

        // Header
        this._drawHeader(schoolData);

        // Student Info
        this._drawStudentInfo(studentData);

        // Statement Details
        this._drawStatementDetails(accountData);

        // Summary
        this._drawSummary(accountData);

        // Payment Instructions
        this._drawPaymentInstructions(schoolData);

        this.doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  _drawHeader(schoolData) {
    this.doc.fontSize(16).font('Helvetica-Bold').text(schoolData.name, { align: 'center' });
    this.doc.fontSize(10).font('Helvetica').text(schoolData.location, { align: 'center' });
    this.doc.fontSize(10).text('FEE STATEMENT', { align: 'center' });
    this.doc.moveDown(0.5);
  }

  _drawStudentInfo(studentData) {
    this.doc.fontSize(11).font('Helvetica-Bold').text('Student Information', this.margin);
    this.doc.fontSize(10).font('Helvetica').moveDown(0.2);

    this.doc.text(`Name: ${studentData.firstName} ${studentData.lastName}`);
    this.doc.text(`Admission No.: ${studentData.admissionNumber}`);
    this.doc.text(`Form: ${studentData.classLevel.replace('FORM', '')}`);
    this.doc.text(`Stream: ${studentData.stream || 'N/A'}`);
    this.doc.moveDown(0.5);
  }

  _drawStatementDetails(accountData) {
    this.doc.fontSize(11).font('Helvetica-Bold').text('Account Details', this.margin);
    this.doc.fontSize(10).font('Helvetica').moveDown(0.2);

    const details = [
      { label: 'Total Fee Due:', value: `KES ${accountData.amountDue}` },
      { label: 'Amount Paid:', value: `KES ${accountData.amountPaid}` },
      { label: 'Current Balance:', value: `KES ${accountData.balance}` },
      { label: 'Status:', value: accountData.status },
    ];

    details.forEach((detail) => {
      this.doc.text(`${detail.label} ${detail.value}`);
    });

    this.doc.moveDown(0.5);
  }

  _drawSummary(accountData) {
    const boxY = this.doc.y;
    const boxX = this.margin;
    const boxWidth = this.width - 2 * this.margin;
    const boxHeight = 80;

    this.doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

    this.doc.fontSize(12).font('Helvetica-Bold').text('Account Summary', boxX + 10, boxY + 10);

    this.doc.fontSize(11).font('Helvetica');
    this.doc.text(`Due: KES ${accountData.amountDue}`, boxX + 10, boxY + 30);
    this.doc.text(`Paid: KES ${accountData.amountPaid}`, boxX + 10, boxY + 50);
    this.doc.fontSize(12).font('Helvetica-Bold').text(`Balance: KES ${accountData.balance}`, boxX + 10, boxY + 70);

    this.doc.moveDown(6);
  }

  _drawPaymentInstructions(schoolData) {
    this.doc.moveDown(0.5);
    this.doc.fontSize(11).font('Helvetica-Bold').text('Payment Instructions', this.margin);
    this.doc.fontSize(10).font('Helvetica').moveDown(0.2);

    const instructions = [
      '1. Payments can be made via M-Pesa, bank transfer, or cash at the school office',
      '2. All payments must include the student admission number as reference',
      '3. Receipts will be issued for all payments',
      '4. Parents are requested to settle balances within 30 days',
    ];

    instructions.forEach((instruction) => {
      this.doc.text(instruction);
    });

    this.doc.moveDown(0.5);
    this.doc.fontSize(9).text(`For inquiries, contact the Bursar's office at ${schoolData.email || 'N/A'}`);
  }
}

module.exports = {
  ReportCardGenerator,
  FeeStatementGenerator,
};
