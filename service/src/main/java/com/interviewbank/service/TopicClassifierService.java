package com.interviewbank.service;

import com.interviewbank.model.Question.QuestionCategory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Keyword-based topic classifier.
 *
 * Classifies question text into {@link QuestionCategory} and extracts
 * a specific topic tag (e.g. "Dynamic Programming", "Rate Limiting").
 *
 * This intentionally avoids external ML dependencies — it uses weighted
 * keyword matching and can be swapped for a real NLP model later.
 */
@Service
public class TopicClassifierService {

    private static final Map<QuestionCategory, List<String>> CATEGORY_KEYWORDS;
    private static final Map<String, List<String>> TOPIC_KEYWORDS;

    static {
        CATEGORY_KEYWORDS = new EnumMap<>(QuestionCategory.class);

        CATEGORY_KEYWORDS.put(QuestionCategory.DSA, List.of(
                "array", "string", "linked list", "tree", "graph", "binary search",
                "dynamic programming", "dp", "recursion", "backtracking", "sorting",
                "heap", "stack", "queue", "hash map", "trie", "sliding window",
                "two pointer", "bit manipulation", "complexity", "big o", "algorithm",
                "data structure", "lru", "lfu", "matrix", "bfs", "dfs", "cycle",
                "topological", "union find", "segment tree", "fenwick"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.SYSTEM_DESIGN, List.of(
                "design a system", "scale", "distributed", "microservice", "load balancer",
                "cdn", "cache", "database sharding", "replication", "consistency",
                "availability", "partition", "cap theorem", "message queue", "kafka",
                "redis", "rate limiting", "api gateway", "service mesh", "architecture",
                "high availability", "horizontal scaling", "vertical scaling", "event driven",
                "pub sub", "websocket", "notification system", "url shortener", "feed",
                "search engine", "recommendation", "payment system", "ride sharing"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.LLD, List.of(
                "design class", "oop", "solid", "design pattern", "singleton", "factory",
                "observer", "strategy", "decorator", "builder", "prototype", "command",
                "parking lot", "library system", "elevator", "chess", "atm", "hotel",
                "inventory", "uml", "class diagram", "inheritance", "polymorphism",
                "encapsulation", "abstraction", "interface", "abstract class"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.BEHAVIORAL, List.of(
                "tell me about yourself", "strengths", "weaknesses", "conflict",
                "leadership", "teamwork", "challenging project", "failure", "success",
                "why this company", "career goals", "feedback", "time management",
                "situation", "task", "action", "result", "star", "ownership",
                "customer obsession", "bias for action", "earn trust", "culture fit"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.DATABASE, List.of(
                "sql", "nosql", "join", "index", "query optimization", "acid",
                "transaction", "normalization", "schema", "foreign key", "primary key",
                "mongodb", "postgresql", "mysql", "cassandra", "elasticsearch",
                "n+1 problem", "stored procedure", "trigger", "view", "partition"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.OS_NETWORKING, List.of(
                "thread", "process", "deadlock", "mutex", "semaphore", "concurrency",
                "synchronization", "memory", "virtual memory", "paging", "scheduling",
                "tcp", "udp", "http", "https", "dns", "ip", "socket", "rest",
                "grpc", "ssl", "tls", "cors", "oauth", "jwt", "authentication",
                "authorization", "race condition", "context switch", "interrupt"
        ));

        CATEGORY_KEYWORDS.put(QuestionCategory.LANGUAGE_SPECIFIC, List.of(
                "java", "python", "javascript", "golang", "kotlin", "rust",
                "garbage collection", "jvm", "generics", "lambda", "stream api",
                "async await", "promise", "closure", "pointer", "memory leak",
                "jit compiler", "gil", "event loop", "prototype chain", "this keyword"
        ));

        // Topic-specific keywords (sub-categories within DSA etc.)
        TOPIC_KEYWORDS = new LinkedHashMap<>();
        TOPIC_KEYWORDS.put("Dynamic Programming",     List.of("dynamic programming", "dp", "memoization", "tabulation", "knapsack", "fibonacci"));
        TOPIC_KEYWORDS.put("Graph Algorithms",        List.of("graph", "bfs", "dfs", "dijkstra", "bellman", "floyd", "topological", "cycle detection", "spanning tree"));
        TOPIC_KEYWORDS.put("Trees",                   List.of("binary tree", "bst", "avl", "red black", "trie", "segment tree", "fenwick", "inorder", "preorder"));
        TOPIC_KEYWORDS.put("Sliding Window",          List.of("sliding window", "two pointer", "substring", "subarray"));
        TOPIC_KEYWORDS.put("Sorting & Searching",     List.of("binary search", "merge sort", "quick sort", "heap sort", "counting sort", "search"));
        TOPIC_KEYWORDS.put("Rate Limiting",           List.of("rate limit", "throttle", "token bucket", "leaky bucket"));
        TOPIC_KEYWORDS.put("Caching",                 List.of("cache", "lru", "lfu", "redis", "eviction", "cache invalidation"));
        TOPIC_KEYWORDS.put("Distributed Systems",     List.of("distributed", "consensus", "raft", "paxos", "eventual consistency", "cap theorem"));
        TOPIC_KEYWORDS.put("Design Patterns",         List.of("singleton", "factory", "observer", "strategy", "decorator", "builder", "command", "proxy"));
        TOPIC_KEYWORDS.put("Concurrency",             List.of("thread", "mutex", "semaphore", "deadlock", "race condition", "atomic", "lock", "concurrent"));
        TOPIC_KEYWORDS.put("SQL & Databases",         List.of("sql", "join", "index", "query", "transaction", "acid", "normalization"));
        TOPIC_KEYWORDS.put("Leadership & Culture",    List.of("leadership", "ownership", "conflict", "team", "culture", "bias for action"));
    }

    /**
     * Auto-classify question text into a category.
     */
    public QuestionCategory classify(String questionText) {
        String lower = questionText.toLowerCase();
        Map<QuestionCategory, Integer> scores = new EnumMap<>(QuestionCategory.class);

        for (var entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = entry.getValue().stream()
                    .mapToInt(keyword -> countOccurrences(lower, keyword))
                    .sum();
            if (score > 0) {
                scores.put(entry.getKey(), score);
            }
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(QuestionCategory.DSA); // fallback
    }

    /**
     * Identify a specific topic within a question (best-effort).
     */
    public Optional<String> extractTopic(String questionText) {
        String lower = questionText.toLowerCase();

        return TOPIC_KEYWORDS.entrySet().stream()
                .filter(entry -> entry.getValue().stream().anyMatch(lower::contains))
                .max(Comparator.comparingInt(entry ->
                        entry.getValue().stream()
                                .mapToInt(kw -> countOccurrences(lower, kw))
                                .sum()))
                .map(Map.Entry::getKey);
    }

    private int countOccurrences(String text, String keyword) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(keyword, idx)) != -1) {
            count++;
            idx += keyword.length();
        }
        return count;
    }
}
