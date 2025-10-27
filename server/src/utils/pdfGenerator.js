const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate test results PDF
 * @param {Object} testResult - Test result data
 * @param {Object[]} questions - Test questions with answers
 * @param {Object} user - User information
 * @returns {Promise<Buffer>}
 */
const generateTestResultsPDF = async (testResult, questions, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#667eea')
         .text('CRAVINS CBT TEST RESULTS', { align: 'center' });
      
      doc.moveDown();
      
      // Student Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Student Information', { underline: true });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Name: ${user.firstName} ${user.lastName}`)
         .text(`Email: ${user.email}`)
         .text(`Test Date: ${new Date(testResult.completedAt).toLocaleDateString()}`)
         .text(`Test Time: ${new Date(testResult.completedAt).toLocaleTimeString()}`);
      
      doc.moveDown();
      
      // Test Summary
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Test Summary', { underline: true });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Subjects: ${testResult.subjects.join(', ')}`)
         .text(`Difficulty: ${testResult.difficulty}`)
         .text(`Total Questions: ${testResult.totalQuestions}`)
         .text(`Correct Answers: ${testResult.correctAnswers}`)
         .text(`Score: ${testResult.score.toFixed(1)}%`)
         .text(`Time Spent: ${Math.floor(testResult.timeSpent / 60)} minutes ${testResult.timeSpent % 60} seconds`);
      
      doc.moveDown();
      
      // Subject-wise Performance
      if (testResult.subjectScores && Object.keys(testResult.subjectScores).length > 0) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Subject-wise Performance', { underline: true });
        
        doc.fontSize(12)
           .font('Helvetica');
        
        Object.entries(testResult.subjectScores).forEach(([subject, score]) => {
          doc.text(`${subject}: ${score.toFixed(1)}%`);
        });
        
        doc.moveDown();
      }
      
      // Performance Analysis
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Performance Analysis', { underline: true });
      
      doc.fontSize(12)
         .font('Helvetica');
      
      const score = testResult.score;
      let performance = '';
      let recommendation = '';
      
      if (score >= 90) {
        performance = 'Excellent';
        recommendation = 'Outstanding performance! Keep up the great work and consider helping peers.';
      } else if (score >= 80) {
        performance = 'Very Good';
        recommendation = 'Great job! Focus on areas where you lost points to achieve excellence.';
      } else if (score >= 70) {
        performance = 'Good';
        recommendation = 'Good effort! Review topics where you struggled and practice more questions.';
      } else if (score >= 60) {
        performance = 'Fair';
        recommendation = 'You\'re on the right track. Dedicate more time to studying and take more practice tests.';
      } else {
        performance = 'Needs Improvement';
        recommendation = 'Don\'t give up! Focus on understanding basic concepts and take regular practice tests.';
      }
      
      doc.text(`Performance Level: ${performance}`)
         .text(`Recommendation: ${recommendation}`);
      
      doc.moveDown();
      
      // Add new page for detailed questions
      doc.addPage();
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Detailed Question Analysis', { align: 'center' });
      
      doc.moveDown();
      
      // Questions and Answers
      questions.forEach((question, index) => {
        const questionResult = testResult.questions?.[index];
        const userAnswer = questionResult?.userAnswer;
        const isCorrect = questionResult?.isCorrect;
        
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(`Question ${index + 1}:`, { continued: false });
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#333333')
           .text(question.text, { indent: 20 });
        
        // Options
        question.options.forEach((option, optIndex) => {
          const isUserAnswer = userAnswer === optIndex;
          const isCorrectAnswer = question.correctAnswer === optIndex;
          
          let color = '#000000';
          let style = '';
          
          if (isCorrectAnswer) {
            color = '#27ae60'; // Green for correct
            style = ' ✓ [Correct Answer]';
          } else if (isUserAnswer && !isCorrect) {
            color = '#e74c3c'; // Red for wrong user answer
            style = ' ✗ [Your Answer]';
          } else if (isUserAnswer && isCorrect) {
            color = '#27ae60';
            style = ' ✓ [Your Answer - Correct]';
          }
          
          doc.fontSize(10)
             .fillColor(color)
             .text(`${String.fromCharCode(65 + optIndex)}. ${option}${style}`, { indent: 30 });
        });
        
        // Explanation
        if (question.explanation) {
          doc.fontSize(10)
             .fillColor('#666666')
             .text('Explanation:', { indent: 20 });
          
          doc.text(question.explanation, { indent: 30 });
        }
        
        // Status
        const statusText = isCorrect ? '✓ Correct' : '✗ Incorrect';
        const statusColor = isCorrect ? '#27ae60' : '#e74c3c';
        
        doc.fontSize(10)
           .fillColor(statusColor)
           .text(`Status: ${statusText}`, { indent: 20 });
        
        doc.moveDown();
      });
      
      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Generated by Cravins E-Learning Platform', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate certificate PDF
 * @param {Object} user - User information
 * @param {string} courseName - Course name
 * @param {number} score - Achievement score
 * @returns {Promise<Buffer>}
 */
const generateCertificatePDF = async (user, courseName, score) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        layout: 'landscape',
        margin: 50,
        size: 'A4'
      });
      
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Certificate border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .strokeColor('#667eea')
         .lineWidth(5)
         .stroke();
      
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .strokeColor('#764ba2')
         .lineWidth(2)
         .stroke();
      
      // Header
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#667eea')
         .text('CERTIFICATE OF ACHIEVEMENT', { align: 'center' });
      
      doc.moveDown(2);
      
      // Awarded to
      doc.fontSize(18)
         .fillColor('#333333')
         .text('This is to certify that', { align: 'center' });
      
      doc.moveDown();
      
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(`${user.firstName} ${user.lastName}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // Achievement
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#333333')
         .text('has successfully completed', { align: 'center' });
      
      doc.moveDown();
      
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#764ba2')
         .text(courseName, { align: 'center' });
      
      doc.moveDown(2);
      
      // Score
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`with a score of ${score.toFixed(1)}%`, { align: 'center' });
      
      doc.moveDown(3);
      
      // Date and signature
      const currentDate = new Date().toLocaleDateString();
      
      doc.fontSize(12)
         .text(`Date: ${currentDate}`, 100, doc.page.height - 150);
      
      doc.text('Cravins E-Learning Platform', doc.page.width - 250, doc.page.height - 150);
      
      // Logo placeholder (you can add actual logo here)
      doc.fontSize(10)
         .fillColor('#666666')
         .text('🎓 CRAVINS', { align: 'center' }, doc.page.height - 100);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateTestResultsPDF,
  generateCertificatePDF,
};