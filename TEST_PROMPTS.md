# Test Prompts for RightModel

Use these prompts to test the intelligent model selection system. Each should route to different complexity tiers.

## 🟢 Low Complexity (Fast Tier)
*Expected: Groq Llama 8B, Ollama, GPT-3.5, or Claude Haiku*

1. **Simple greeting**
   ```
   Hello!
   ```

2. **Basic definition**
   ```
   What is HTML?
   ```

3. **Simple math**
   ```
   What is 25 * 4?
   ```

4. **Quick fact**
   ```
   Who invented the telephone?
   ```

5. **Basic list**
   ```
   List 3 primary colors
   ```

6. **Yes/No question**
   ```
   Is Python a programming language?
   ```

7. **Simple translation**
   ```
   Translate "hello" to Spanish
   ```

8. **Quick definition**
   ```
   Define "algorithm" in one sentence
   ```

## 🟡 Medium Complexity (Balanced Tier)
*Expected: Claude Sonnet, GPT-4o-mini, or Groq Llama 70B*

9. **Code explanation**
   ```
   Explain how async/await works in JavaScript
   ```

10. **Function request**
    ```
    Write a Python function to check if a number is prime
    ```

11. **Concept comparison**
    ```
    What's the difference between REST and GraphQL APIs?
    ```

12. **Tutorial request**
    ```
    How do I set up a React project with TypeScript?
    ```

13. **Code example**
    ```
    Show me an example of using map() and filter() in JavaScript
    ```

14. **Moderate explanation**
    ```
    Explain the concept of object-oriented programming
    ```

15. **Implementation question**
    ```
    How can I implement user authentication in a Node.js app?
    ```

16. **Translation with context**
    ```
    Translate this paragraph to French: "The weather today is beautiful. I'm going to the park with my friends."
    ```

## 🔴 High Complexity (Advanced Tier)
*Expected: Claude Opus, GPT-4o, or GPT-4-Turbo*

17. **Architecture design**
    ```
    Design a scalable microservices architecture for an e-commerce platform that can handle 1 million concurrent users. Include database design, caching strategy, and API gateway configuration.
    ```

18. **Complex algorithm**
    ```
    Write a detailed algorithm to implement a self-balancing binary search tree (AVL tree) with insertion, deletion, and rotation operations. Explain the time complexity of each operation.
    ```

19. **Deep analysis**
    ```
    Analyze the philosophical implications of artificial general intelligence on human consciousness, free will, and the nature of creativity. Consider both utilitarian and deontological ethical frameworks.
    ```

20. **Multi-step problem solving**
    ```
    I need to optimize a database with 50 million records that's experiencing slow query performance. Analyze potential causes, propose multiple optimization strategies, compare their trade-offs, and provide a step-by-step implementation plan with monitoring metrics.
    ```

21. **Complex code review**
    ```
    Review this system design and refactor it for better performance: I have a React application that makes 100+ API calls on page load, uses nested callbacks, has no error handling, stores everything in component state, and re-renders the entire tree on every update. Provide a comprehensive refactoring strategy.
    ```

22. **Research and synthesis**
    ```
    Compare and contrast the architectural patterns of event-driven systems, CQRS, and event sourcing. Discuss when to use each, their trade-offs, implementation challenges, and provide real-world use cases where each pattern excels.
    ```

23. **Creative + technical**
    ```
    Design a complete full-stack application for a collaborative code editor with real-time synchronization, conflict resolution, syntax highlighting, and AI-powered code completion. Include frontend architecture, backend design, database schema, WebSocket implementation, and security considerations.
    ```

24. **Complex debugging**
    ```
    Debug this scenario: My distributed system occasionally loses messages between microservices, but only under high load. The issue is intermittent and doesn't appear in logs. Design a comprehensive debugging strategy including monitoring, tracing, testing approaches, and preventive measures.
    ```

## 🎯 Edge Cases to Test

25. **Code symbols (should trigger complexity)**
    ```
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    Explain this code
    ```

26. **Long simple query (tests word count)**
    ```
    I want to know what the capital of France is and also what the capital of Germany is and also what the capital of Italy is and also what the capital of Spain is and also what the capital of Portugal is. Can you list all of these capitals?
    ```

27. **Multiple questions (tests complexity)**
    ```
    What is React? How does it work? What are hooks? What's the virtual DOM? How do I optimize performance? What are common patterns? When should I use Redux?
    ```

28. **Technical jargon (tests keywords)**
    ```
    Implement a recursive backtracking algorithm with memoization to solve the N-Queens problem and optimize the time complexity
    ```

## 📊 Testing Strategy

1. **Start with Low Complexity** prompts (1-8)
   - Verify they route to Fast tier models
   - Check response quality is acceptable for simple tasks

2. **Test Medium Complexity** prompts (9-16)
   - Should route to Balanced tier
   - Verify responses have good detail without over-complexity

3. **Test High Complexity** prompts (17-24)
   - Should route to Advanced tier
   - Check for comprehensive, detailed responses

4. **Edge Cases** (25-28)
   - Verify the analyzer handles special cases correctly
   - Test boundary conditions

## ✅ Success Criteria

- **Correct Tier Selection**: 80%+ accuracy in routing to appropriate tier
- **Response Quality**: Answers match the complexity level
- **Cost Efficiency**: Simple queries don't waste expensive model calls
- **Fallback Handling**: System gracefully handles provider failures
- **UI Feedback**: Model info bar shows correct selection reasoning

## 💡 Tips for Testing

1. Watch the **model info bar** at the bottom to see selection reasoning
2. Check the **model tag** on each response to verify correct routing
3. Try prompts from different tiers consecutively to see switching
4. Test with different provider configurations (only OpenAI, only Anthropic, etc.)
5. Try disabling all providers except one tier to test fallback behavior
