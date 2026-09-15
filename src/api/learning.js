import { supabase } from './supabase'
import { invokeAi } from './ai'

export const DEFAULT_MATERIALS = [
  {
    _id: 'learning-1',
    type: 'course',
    category: 'Web Development',
    title: 'Full-Stack Web Development Bootcamp (React & Node.js)',
    description: 'Master modern frontend UI building with React, REST APIs with Node/Express, and SQL database design.',
    url: 'https://developer.mozilla.org',
    duration: '6 Weeks',
    level: 'Intermediate',
    content: {
      overview: 'Comprehensive guide to building production-ready web applications using React 18, Node.js microservices, and PostgreSQL.',
      modules: [
        'Module 1: React Fundamentals & Hooks (useState, useEffect, useMemo)',
        'Module 2: RESTful API Design & Express Middleware Routing',
        'Module 3: Database Indexing, Transactions, & ORM Integration',
        'Module 4: JWT Authentication & Role-Based Access Control (RBAC)',
      ],
      keyTakeaways: [
        'Component-driven UI architecture with atomic design',
        'Asynchronous state management and custom React hooks',
        'Secure API authentication with HTTP-only cookies',
      ],
      codeSnippet: `// Example React Custom Hook for Data Fetching
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); });
  }, [url]);

  return { data, loading };
}`,
    },
  },
  {
    _id: 'learning-2',
    type: 'video',
    category: 'System Design',
    title: 'System Design Fundamentals & High-Scalability Architecture',
    description: 'Learn load balancing, horizontal scaling, Redis caching, database sharding, and message queues.',
    url: 'https://youtube.com',
    embedVideoUrl: 'https://www.youtube.com/embed/SqsRkXaf6aU',
    duration: '3 Hours',
    level: 'Advanced',
    content: {
      overview: 'Deep-dive architectural tutorial covering system bottlenecks, caching strategies, rate limiting, and event-driven microservices.',
      modules: [
        'Lesson 1: Horizontal vs Vertical Scaling Tradeoffs',
        'Lesson 2: Load Balancing Algorithms (Round Robin, Least Connections)',
        'Lesson 3: Redis Cache-Aside Pattern & Eviction Policies (LRU)',
        'Lesson 4: Database Sharding & Consistent Hashing',
      ],
      keyTakeaways: [
        'Design systems for 99.99% high availability and fault tolerance',
        'Prevent cache stampedes using mutex locks and TTL jitter',
        'Implement distributed rate limiters using Token Bucket algorithm',
      ],
      codeSnippet: `// Cache-Aside Pattern with Redis
async function getUser(userId) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.find(userId);
  await redis.set(\`user:\${userId}\`, JSON.stringify(user), 'EX', 3600);
  return user;
}`,
    },
  },
  {
    _id: 'learning-3',
    type: 'article',
    category: 'Data Structures',
    title: 'Data Structures & Algorithms Deep Dive for Tech Interviews',
    description: 'Essential Big-O complexity analysis, sliding window patterns, graph traversals, and dynamic programming.',
    url: 'https://leetcode.com',
    duration: '4 Hours',
    level: 'Intermediate',
    content: {
      overview: 'Master the top 14 algorithmic patterns frequently asked in FAANG and tier-1 tech company interviews.',
      modules: [
        'Pattern 1: Two Pointers & Sliding Window',
        'Pattern 2: Fast & Slow Pointer (Cycle Detection)',
        'Pattern 3: Breadth-First Search (BFS) & Depth-First Search (DFS)',
        'Pattern 4: Dynamic Programming Top-Down vs Bottom-Up',
      ],
      keyTakeaways: [
        'Analyze worst-case time complexity O(N) vs space complexity O(1)',
        'Recognize when to convert exponential O(2^N) recursion into linear DP',
        'Master Hash Map frequency lookups for constant time operations',
      ],
      codeSnippet: `// Sliding Window Pattern
function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`,
    },
  },
  {
    _id: 'learning-4',
    type: 'course',
    category: 'AI & Machine Learning',
    title: 'Generative AI & LLM Engineering with Google Gemini 2.5',
    description: 'Build and deploy production-ready AI applications, prompt engineering pipelines, and fine-tuned models.',
    url: 'https://coursera.org',
    duration: '4 Weeks',
    level: 'Advanced',
    content: {
      overview: 'Comprehensive AI developer guide covering Google Gemini 2.5 Flash API integration, RAG (Retrieval-Augmented Generation), and Agentic Workflows.',
      modules: [
        'Module 1: Prompt Engineering Techniques (Few-Shot, Chain-of-Thought)',
        'Module 2: Gemini 3.6 Flash API JSON Schema Enforcement',
        'Module 3: Vector Embeddings & Semantic Document Search',
        'Module 4: Building Autonomous AI Coding Agents',
      ],
      keyTakeaways: [
        'Leverage Gemini 3.6 Flash for sub-second structured JSON responses',
        'Implement fallback model chains for 99.99% uptime resiliency',
        'Build self-correcting AI agent loops with tool usage capabilities',
      ],
      codeSnippet: `// Gemini 3.6 Flash API Call with JSON Enforcement
const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + API_KEY, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Analyze code..." }] }],
    generationConfig: { responseMimeType: 'application/json' }
  })
});`,
    },
  },
  {
    _id: 'learning-5',
    type: 'video',
    category: 'DevOps & Cloud',
    title: 'Docker & Kubernetes Container Orchestration Crash Course',
    description: 'Containerize microservices with Docker, write Kubernetes deployment manifests, and set up CI/CD pipelines.',
    url: 'https://youtube.com',
    embedVideoUrl: 'https://www.youtube.com/embed/X48VuDVv0do',
    duration: '2.5 Hours',
    level: 'Intermediate',
    content: {
      overview: 'Learn how to build multi-stage Dockerfiles, manage Docker Compose multi-container environments, and deploy Kubernetes Pods.',
      modules: [
        'Lesson 1: Docker Basics (Images, Containers, Volumes)',
        'Lesson 2: Writing Efficient Multi-Stage Dockerfiles',
        'Lesson 3: Docker Compose for Multi-Container Services',
        'Lesson 4: Kubernetes Pods, Deployments, and Ingress Controllers',
      ],
      keyTakeaways: [
        'Minimize Docker image sizes from 1GB to 50MB using Alpine Linux',
        'Expose cluster microservices using NGINX Ingress Controller',
        'Automate container builds with GitHub Actions CI/CD workflows',
      ],
      codeSnippet: `# Multi-Stage Dockerfile Example
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80`,
    },
  },
  {
    _id: 'learning-6',
    type: 'article',
    category: 'Web Development',
    title: 'Modern CSS, Tailwind, & Glassmorphism UI Design Systems',
    description: 'Build responsive, accessible, and high-converting user interfaces with modern CSS utilities.',
    url: 'https://tailwindcss.com',
    duration: '1 Hour',
    level: 'Beginner',
    content: {
      overview: 'Master Tailwind CSS 3 utility classes, custom design tokens, dark mode toggle support, and glassmorphism styling.',
      modules: [
        'Section 1: Utility-First CSS Principles vs Component CSS',
        'Section 2: Responsive Breakpoints (sm, md, lg, xl)',
        'Section 3: Glassmorphism Card Effects & Backdrop Blurs',
        'Section 4: Custom CSS Variables & Dark Theme Configuration',
      ],
      keyTakeaways: [
        'Design Mobile-First responsive layouts effortlessly',
        'Build sleek dark-themed SaaS dashboards with glassmorphism',
        'Maintain zero CSS bundle bloat using Tailwind JIT compiler',
      ],
      codeSnippet: `<!-- Glassmorphism Card Component -->
<div className="bg-base-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-glow-purple">
  <h3 className="text-lg font-bold text-heading">SaaS Component</h3>
  <p className="text-xs text-gray-400 mt-2">Modern glassmorphism styling.</p>
</div>`,
    },
  },
]

export async function getLearning(params = {}) {
  const topic = params.topic || ''

  if (import.meta.env.VITE_GEMINI_API_KEY && topic.trim()) {
    try {
      const res = await invokeAi('learning', { topic: topic.trim() })
      if (res.data?.materials && res.data.materials.length > 0) {
        return { data: { materials: res.data.materials } }
      }
    } catch {
      /* proceed to local fallback */
    }
  }

  try {
    const { data, error } = await supabase.from('materials').select('*')
    if (!error && data && data.length > 0) {
      const rows = data.map((m) => ({
        _id: m.id,
        type: m.type || 'course',
        category: m.category || 'General',
        title: m.title,
        description: m.description || '',
        url: m.url || '#',
        duration: 'Self-Paced',
        level: 'Intermediate',
        content: {
          overview: m.description || 'Interactive learning module curated for CareerAI students.',
          modules: ['Overview & Fundamentals', 'Implementation Guide', 'Summary'],
          keyTakeaways: ['Master core concepts', 'Build real-world application'],
          codeSnippet: `// Sample Implementation Code\nconsole.log("Learning ${m.title}");`,
        },
      }))
      return { data: { materials: rows } }
    }
  } catch {
    /* fallback to DEFAULT_MATERIALS */
  }

  return {
    data: {
      materials: DEFAULT_MATERIALS,
    },
  }
}
