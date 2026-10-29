/**
 * Role-Specific Question Banks with Progressive Difficulty Ladder
 * Level 1: Basic / Fundamental
 * Level 2: Medium / Practical
 * Level 3: Difficult / Advanced
 */

export const ROLE_QUESTION_BANK = {
  'frontend engineer': {
    title: 'Frontend Engineer',
    topics: ['JavaScript & ES6', 'HTML & CSS', 'React / UI Frameworks', 'Web Performance', 'State Management'],
    basic: [
      'What is the difference between let, const, and var in JavaScript, and how does block scoping work?',
      'Can you explain the CSS Box Model, and what difference box-sizing: border-box makes?',
      'What are semantic HTML elements (like header, main, and article), and why are they important for accessibility and SEO?',
      'What is the difference between null and undefined in JavaScript?',
      'How does the browser event bubbling and event capturing mechanism work?',
    ],
    medium: [
      'In React, how do useState and useEffect work, and how do you handle cleanup to avoid memory leaks?',
      'How do you manage asynchronous API calls and loading or error states in a React web application?',
      'What is the difference between props and state in React, and when would you use Context API or a state management library?',
      'How does the JavaScript Event Loop handle microtasks like Promises versus macrotasks like setTimeout?',
      'What are controlled versus uncontrolled components in HTML forms with React?',
    ],
    difficult: [
      'How would you optimize the Core Web Vitals and initial bundle load time of a large React application using code splitting and lazy loading?',
      'How does the React Virtual DOM reconciliation algorithm work, and why are unique keys crucial when rendering dynamic lists?',
      'How do you prevent unnecessary component re-renders using useMemo, useCallback, and React.memo in performance-critical interfaces?',
      'How would you implement an accessible, keyboard-navigable autocomplete dropdown with debounced network search?',
    ],
  },

  'backend engineer': {
    title: 'Backend Engineer',
    topics: ['REST APIs', 'Databases & SQL', 'Node.js / Express', 'Authentication & JWT', 'System Architecture'],
    basic: [
      'What is the difference between HTTP GET and POST requests, and what are common HTTP status codes like 200, 400, 404, and 500?',
      'What is a RESTful API, and what principles make an API clean and easy to consume?',
      'What is the difference between synchronous and asynchronous code execution in a backend environment?',
      'What is the difference between a relational database like PostgreSQL and a NoSQL database like MongoDB?',
      'What is environment variable configuration, and why should sensitive credentials never be committed to source code?',
    ],
    medium: [
      'How does JWT (JSON Web Token) authentication work between a client and an API server, and how do you handle token expiration and refresh?',
      'How do database indexes (like B-Trees) speed up SELECT queries, and what is the trade-off when performing database writes?',
      'What is backend middleware, and how do you use it for request logging, authentication guards, and centralized error handling?',
      'How do you prevent SQL injection and Cross-Site Scripting (XSS) in backend web applications?',
      'What is the difference between connection pooling and creating a new database connection per incoming request?',
    ],
    difficult: [
      'When handling high concurrent write traffic, how do you manage database race conditions, transactions, and isolation levels without deadlocks?',
      'How would you design a distributed caching layer with Redis to prevent cache stampedes, penetration, and stale data?',
      'How do you architect a background job processing queue (like BullMQ or RabbitMQ) to handle heavy asynchronous tasks reliably with retries?',
      'How would you design rate limiting per IP or user ID across a multi-server backend cluster?',
    ],
  },

  'full stack engineer': {
    title: 'Full Stack Engineer',
    topics: ['Client-Server Architecture', 'REST & GraphQL', 'State Synchronization', 'Full Stack Security', 'Deployment & CI/CD'],
    basic: [
      'How does a web browser communicate with a backend server through HTTP, and how is JSON used to exchange data?',
      'What are the core CRUD operations (Create, Read, Update, Delete), and how do they map to HTTP methods and database queries?',
      'What is the difference between client-side state in the frontend and persistent data stored in a backend database?',
      'What is the difference between a frontend framework like React and a backend runtime like Node.js?',
      'How does client-side routing differ from traditional server-rendered multi-page websites?',
    ],
    medium: [
      'Can you walk me through an end-to-end user authentication flow, from the React login form to backend token verification and protected database access?',
      'How do you resolve Cross-Origin Resource Sharing (CORS) errors when your frontend and backend run on different domains or ports?',
      'When should you choose a relational database like PostgreSQL versus a document store like MongoDB for a new full-stack project?',
      'How do you handle client-side form validation while ensuring security through strict backend validation?',
      'How do you synchronize optimistic UI updates with backend server responses when users perform mutations?',
    ],
    difficult: [
      'How would you architect a real-time collaborative feature (like notifications or live chat) using WebSockets, Redis pub/sub, and persistent database storage?',
      'How do you structure database schema migrations with zero downtime while existing application instances are actively serving production traffic?',
      'How would you set up an automated CI/CD deployment pipeline that builds, tests, containerizes with Docker, and deploys full-stack services?',
      'How do you prevent security vulnerabilities like CSRF, SSRF, and credential stuffing across full-stack applications?',
    ],
  },

  'ai / machine learning engineer': {
    title: 'AI / Machine Learning Engineer',
    topics: ['ML Foundations', 'Deep Learning & Neural Networks', 'Model Evaluation', 'LLMs & Transformers', 'MLOps & Deployment'],
    basic: [
      'What is the fundamental difference between Supervised Learning, Unsupervised Learning, and Reinforcement Learning?',
      'What is overfitting in a machine learning model, and what are two common methods you use to prevent it?',
      'What is the difference between accuracy, precision, recall, and F1-score when evaluating a model?',
      'What is the difference between training data, validation data, and test data?',
      'What is feature scaling (like normalization and standardization), and why is it important for machine learning algorithms?',
    ],
    medium: [
      'How does gradient descent optimize the loss function, and why is choosing the right learning rate critical?',
      'What role do activation functions like ReLU, Sigmoid, and Softmax play in deep neural networks?',
      'How do you handle severe class imbalance in a dataset (such as fraud detection with 99% negative samples)?',
      'What is transfer learning, and how does fine-tuning a pre-trained model save training time and compute?',
      'What is the difference between batch gradient descent, stochastic gradient descent (SGD), and mini-batch gradient descent?',
    ],
    difficult: [
      'How does the Transformer self-attention mechanism compute query, key, and value matrices, and what is its computational complexity?',
      'How would you design an end-to-end MLOps pipeline for deploying an LLM or ML model with monitoring for data drift and model latency?',
      'How do Retrieval-Augmented Generation (RAG) pipelines work, including embedding chunking, vector search, and reranking?',
      'How do you optimize deep learning model inference using techniques like quantization, pruning, and ONNX runtime?',
    ],
  },

  'data scientist': {
    title: 'Data Scientist',
    topics: ['Statistics & Probability', 'Data Wrangling & Pandas', 'Hypothesis Testing & A/B Tests', 'Predictive Modeling', 'Feature Engineering'],
    basic: [
      'What is the difference between mean, median, and mode, and in what scenarios is the median preferred over the mean?',
      'What is exploratory data analysis (EDA), and what key steps do you follow when examining a new tabular dataset?',
      'What are common techniques for handling missing values in Pandas, and what are the trade-offs of dropping versus imputing data?',
      'What is the difference between correlation and causation in data analysis?',
      'What is a p-value in statistics, and how do you interpret statistical significance at alpha equals 0.05?',
    ],
    medium: [
      'How do you detect and handle outliers in a dataset using IQR (interquartile range) or Z-score methods?',
      'How would you design and analyze an A/B test for a product feature to ensure the sample size and test duration are statistically valid?',
      'What is multicollinearity in regression models, and how do you detect and mitigate it using Variance Inflation Factor (VIF)?',
      'What is cross-validation (like K-Fold), and why is it superior to a single train-test split?',
      'What are common feature engineering techniques for categorical variables, such as One-Hot Encoding versus Target Encoding?',
    ],
    difficult: [
      'How does Principal Component Analysis (PCA) reduce dimensionality while retaining maximum variance across features?',
      'How would you evaluate and mitigate algorithmic bias or data skew in predictive machine learning models?',
      'How would you build a recommendation system or uplift model for millions of users facing severe sparsity and cold-start problems?',
    ],
  },

  'cloud & devops engineer': {
    title: 'Cloud & DevOps Engineer',
    topics: ['Linux & Containers', 'CI/CD Pipelines', 'Kubernetes & Orchestration', 'Infrastructure as Code', 'Cloud Security & SRE'],
    basic: [
      'What is Docker, and how does an isolated container differ from a traditional virtual machine?',
      'What is CI/CD (Continuous Integration and Continuous Deployment), and why is it essential in modern software delivery?',
      'What are the core differences between Public Cloud, Private Cloud, and Hybrid Cloud architectures?',
      'What is the difference between TCP and UDP networking protocols, and where is each typically used?',
      'What is SSH, and how does public-private key authentication work for securely accessing cloud servers?',
    ],
    medium: [
      'What are Kubernetes Pods, Deployments, and Services, and how does Kubernetes perform rolling zero-downtime updates?',
      'How does Infrastructure as Code (IaC) with tools like Terraform improve infrastructure consistency and auditability?',
      'How do reverse proxies and load balancers (like Nginx or AWS ALB) distribute incoming traffic across healthy backend instances?',
      'How do you manage sensitive secrets, API keys, and certificates securely in automated deployment pipelines?',
      'What is the difference between horizontal pod autoscaling (HPA) and vertical pod autoscaling (VPA) in Kubernetes?',
    ],
    difficult: [
      'How would you architect a multi-region disaster recovery and failover strategy with strict Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?',
      'How do you design a centralized observability stack (metrics, logs, traces) using Prometheus, Grafana, and OpenTelemetry to detect incidents fast?',
      'How would you enforce strict zero-trust security policies and network isolation in a multi-tenant Kubernetes cluster?',
    ],
  },

  'mobile app developer': {
    title: 'Mobile App Developer',
    topics: ['Mobile Lifecycle', 'UI Frameworks (Flutter / React Native)', 'Local Storage & Offline Sync', 'Performance & Battery', 'App Store Deployment'],
    basic: [
      'What is the mobile application lifecycle, and what happens when an app transitions from the foreground to the background?',
      'What is the difference between native development (Swift/Kotlin) and cross-platform frameworks like React Native or Flutter?',
      'What is state management in mobile apps, and why is it necessary for responsive user interfaces?',
      'How do mobile apps store user preferences and simple key-value settings locally?',
      'What are the key differences between iOS and Android design guidelines and navigation patterns?',
    ],
    medium: [
      'How do you implement offline caching and local database synchronization (like SQLite or Room) so users can view data without internet?',
      'How do you handle background tasks, push notifications, and deep linking across mobile platforms?',
      'How do you optimize mobile app performance to prevent UI thread blocking and frame drops (maintaining 60 FPS)?',
      'How do you manage mobile app permissions (like camera, location, and storage) gracefully when a user denies them?',
    ],
    difficult: [
      'How would you architect an end-to-end offline-first synchronization engine that resolves data conflicts between mobile clients and the cloud?',
      'How do you profile and eliminate memory leaks, excessive battery consumption, and excessive network wakeups in mobile applications?',
    ],
  },

  'cybersecurity specialist': {
    title: 'Cybersecurity Specialist',
    topics: ['Network Security', 'OWASP Top 10', 'Cryptography & Auth', 'Vulnerability Assessment', 'Incident Response'],
    basic: [
      'What is the CIA Triad (Confidentiality, Integrity, Availability) in information security?',
      'What is the difference between symmetric and asymmetric encryption?',
      'What is Phishing, and how do multi-factor authentication (MFA) and security awareness defend against it?',
      'What are firewalls, and what is the difference between network firewalls and Web Application Firewalls (WAF)?',
      'What is the difference between a vulnerability, an exploit, and a threat in cybersecurity?',
    ],
    medium: [
      'Can you explain the top OWASP vulnerabilities, particularly SQL Injection and Cross-Site Scripting (XSS), and how to remediate them?',
      'How does Public Key Infrastructure (PKI) and SSL/TLS handshakes establish secure encrypted connections between client and server?',
      'What is the Principle of Least Privilege, and how do you enforce Role-Based Access Control (RBAC) across systems?',
      'How do you conduct a vulnerability scan versus a penetration test, and what is the difference between them?',
    ],
    difficult: [
      'How would you architect a Zero Trust Network Architecture across distributed hybrid cloud infrastructure?',
      'How would you manage and contain an active ransomware or credential exfiltration incident following an Incident Response lifecycle?',
    ],
  },
}

/**
 * Normalize arbitrary user role string into one of the supported role keys.
 */
export function normalizeRole(roleInput = '') {
  const clean = (roleInput || '').toLowerCase().trim()
  if (!clean) return 'full stack engineer'

  if (clean.includes('front') || clean.includes('ui') || clean.includes('react') || clean.includes('web dev')) {
    return 'frontend engineer'
  }
  if (clean.includes('back') || clean.includes('node') || clean.includes('api') || clean.includes('java') || clean.includes('python dev')) {
    return 'backend engineer'
  }
  if (clean.includes('ai') || clean.includes('machine learning') || clean.includes('ml') || clean.includes('deep learning')) {
    return 'ai / machine learning engineer'
  }
  if (clean.includes('data scien') || clean.includes('analytics') || clean.includes('data analyst')) {
    return 'data scientist'
  }
  if (clean.includes('devops') || clean.includes('cloud') || clean.includes('sre') || clean.includes('aws') || clean.includes('infra')) {
    return 'cloud & devops engineer'
  }
  if (clean.includes('mobile') || clean.includes('android') || clean.includes('ios') || clean.includes('flutter') || clean.includes('react native')) {
    return 'mobile app developer'
  }
  if (clean.includes('cyber') || clean.includes('security') || clean.includes('infosec') || clean.includes('soc')) {
    return 'cybersecurity specialist'
  }

  return 'full stack engineer'
}

/**
 * Determine difficulty level string from question turn index (0-based)
 */
export function getDifficultyForIndex(turnIndex = 0) {
  if (turnIndex <= 1) return 'Basic'
  if (turnIndex <= 3) return 'Medium'
  return 'Difficult'
}

/**
 * Retrieve a calibrated question from the role question bank
 */
export function getQuestionForRole(roleInput, difficulty = 'Basic', index = 0) {
  const normalized = normalizeRole(roleInput)
  const bank = ROLE_QUESTION_BANK[normalized] || ROLE_QUESTION_BANK['full stack engineer']
  const diffKey = (difficulty || 'Basic').toLowerCase()
  const list = bank[diffKey] || bank.basic

  return list[index % list.length]
}

/**
 * Provide a role-calibrated starter greeting and opening simple question
 */
export function getStarterPromptForCandidate(candidateName = 'Sharanu', roleInput = 'Full Stack Engineer') {
  const normalized = normalizeRole(roleInput)
  const roleData = ROLE_QUESTION_BANK[normalized] || ROLE_QUESTION_BANK['full stack engineer']
  const firstQuestion = roleData.basic[0]

  return {
    roleTitle: roleData.title,
    difficulty: 'Basic',
    greeting: `Welcome ${candidateName} to your technical interview for ${roleData.title}!`,
    questionText: `Let's start with a warm-up basic question: ${firstQuestion}`,
    fullStarterText: `Welcome ${candidateName} to your technical interview for ${roleData.title}! Let's start with a warm-up basic question: ${firstQuestion}`,
  }
}

