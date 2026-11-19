const express = require('express');
const router = express.Router();

// LLM wrapper stub for mentorship search
router.post('/extract', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Mock LLM response - in real implementation, this would call an actual LLM
    const mockResponse = {
      skills: [],
      company: [],
      grad_year: [],
      role: []
    };

    // Simple keyword extraction for prototype
    const queryLower = query.toLowerCase();

    // Extract skills
    const skillKeywords = [
      'ai', 'machine learning', 'ml', 'artificial intelligence',
      'web development', 'frontend', 'backend', 'full stack',
      'data science', 'python', 'javascript', 'react', 'node',
      'devops', 'cloud', 'aws', 'azure', 'docker', 'kubernetes',
      'cybersecurity', 'blockchain', 'web3', 'mobile', 'ios', 'android'
    ];

    skillKeywords.forEach(skill => {
      if (queryLower.includes(skill)) {
        mockResponse.skills.push(skill);
      }
    });

    // Extract company names (basic pattern matching)
    const companyKeywords = [
      'google', 'microsoft', 'amazon', 'apple', 'meta', 'facebook',
      'netflix', 'uber', 'airbnb', 'tesla', 'spacex', 'openai',
      'tcs', 'infosys', 'wipro', 'accenture', 'deloitte', 'pwc'
    ];

    companyKeywords.forEach(company => {
      if (queryLower.includes(company)) {
        mockResponse.company.push(company);
      }
    });

    // Extract graduation year
    const yearMatch = query.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      mockResponse.grad_year.push(parseInt(yearMatch[0]));
    }

    // Extract roles
    const roleKeywords = [
      'software engineer', 'developer', 'data scientist', 'product manager',
      'designer', 'architect', 'lead', 'senior', 'junior', 'intern',
      'consultant', 'analyst', 'researcher', 'founder', 'ceo', 'cto'
    ];

    roleKeywords.forEach(role => {
      if (queryLower.includes(role)) {
        mockResponse.role.push(role);
      }
    });

    // If no specific matches, add some default suggestions
    if (mockResponse.skills.length === 0 && mockResponse.company.length === 0 && 
        mockResponse.grad_year.length === 0 && mockResponse.role.length === 0) {
      mockResponse.skills = ['software development', 'data science'];
    }

    res.json(mockResponse);
  } catch (error) {
    console.error('LLM extraction error:', error);
    res.status(500).json({ message: 'Error processing query' });
  }
});

module.exports = router;