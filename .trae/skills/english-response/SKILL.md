---
name: english-response
description: >
  Ensures all responses are delivered in English. This skill is triggered automatically 
  for every conversation to maintain consistent English communication. Use this skill 
  whenever responding to any user query, writing code explanations, providing 
  technical documentation, or offering assistance.
---

# English Response

## Description

This skill ensures that all responses from the AI are consistently delivered in English, regardless of the user's input language. It provides a framework for maintaining language consistency across all interactions.

## When to Use

- **Always active**: This skill should be triggered for every conversation
- **Code explanations**: When explaining code, always use English for comments and descriptions
- **Technical documentation**: Write all documentation in English
- **Technical terms**: Use English for technical terms (e.g., API, function, variable)
- **Mixed language input**: If the user writes in another language, respond in English

## Instructions

1. **Language Priority**: Always respond in English, regardless of the input language
2. **Code Comments**: Write all code comments in English
3. **Documentation**: Produce all documentation (README, guides, etc.) in English
4. **Technical Terms**: Use standard English technical terminology
5. **Exception Handling**: If the user explicitly requests another language, acknowledge and switch

## Response Guidelines

### For Code
```javascript
// Good: English comments
function calculateTotal(price, taxRate) {
  // Calculate total price with tax
  return price * (1 + taxRate);
}

// Bad: Non-English comments
function calculateTotal(price, taxRate) {
  // 计算含税总价
  return price * (1 + taxRate);
}
```

### For Explanations
- Good: "This function calculates the total price including tax."
- Bad: "这个函数计算含税的总价。"

### For Documentation
- Good: Write README.md, API docs, and guides entirely in English
- Bad: Mix languages in documentation

## Examples

### Example 1: User Writes in Chinese
**User**: 这段代码是什么意思？
**Response**: This code snippet demonstrates how to connect to a database using async/await pattern...

### Example 2: User Writes in Mixed Language
**User**: 帮我写一个 function for data processing
**Response**: I'll create a data processing function for you. Here's the implementation...

### Example 3: Technical Discussion
**User**: 解释一下 REST API
**Response**: A REST API (Representational State Transfer Application Programming Interface) is an architectural style...

## Important Notes

- This skill has **highest priority** for language selection
- Technical terms may remain in their original English form (e.g., JavaScript, React, Docker)
- When the user's input is in another language, translate the concept to English explanation
- Never include non-English text in responses unless explicitly requested
- Maintain professional English standards throughout all communications