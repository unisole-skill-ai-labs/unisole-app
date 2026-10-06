export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  title: string;
  duration?: string;
  type: "video" | "quiz" | "assignment" | "coding_test" | "video_test" | "subjective_test" | "folder";
  category?: "LECTURE" | "PRACTICE" | "TEST" | "FOLDER";
  videoUrl?: string;
  description?: string;
  questions?: QuizQuestion[];
  instructions?: string;
  config?: any;
  maxScore?: number;
  attachments?: Array<{ id: string; name: string; url: string; size?: string }>;
}

export interface ModuleSection {
  id: string;
  title: string;
  meta: string;
  items: LessonItem[];
}

export interface CourseCurriculum {
  id: string;
  title: string;
  eyebrow: string;
  duration: string;
  level: string;
  stats: {
    videos: number;
    assessments: number;
    resources: number;
  };
  modules: ModuleSection[];
}

const RICK_ROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1";

export const GENAI_CURRICULUM: CourseCurriculum = {
  id: "cs-genai",
  title: "Generative AI Engineering",
  eyebrow: "FOUNDATIONS TO AGENTIC AI • 12-WEEK FLAGSHIP",
  duration: "12 Weeks (132 Contact Hours)",
  level: "Foundations to Agentic AI",
  stats: {
    videos: 36,
    assessments: 24,
    resources: 48,
  },
  modules: [
    {
      id: "mod-1",
      title: "Week 1 — Data Engineering for AI",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g1-1",
          title: "1.1 Handling Large & Messy Datasets",
          duration: "14 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Techniques for ingesting dirty real-world datasets, handling missing values, and high-cardinality encodings.",
        },
        {
          id: "les-g1-2",
          title: "1.2 EDA Strategy & Data Quality Diagnostics",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Systematic exploratory data analysis, skewness correction, and distribution profiling.",
        },
        {
          id: "les-g1-3",
          title: "1.3 Git Branching & Team AI Workflows",
          duration: "12 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Trunk-based development, PR review etiquette, and reproducible Linux CLI environments.",
        },
        {
          id: "les-g1-quiz",
          title: "Week 1 Graded Quiz: Data & Linux Drills",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-1-1",
              question: "Which Linux command displays interactive real-time CPU, RAM, and process load?",
              options: ["top / htop", "grep -r", "chmod +x", "netstat -tuln"],
              correctOptionIndex: 0,
              explanation: "top and htop provide interactive real-time process and resource monitoring on Linux servers.",
            },
            {
              id: "q-1-2",
              question: "What is the primary risk of using simple One-Hot Encoding on high-cardinality categorical features?",
              options: [
                "Sparse matrix explosion and excessive dimensionality",
                "Total loss of floating point precision",
                "Instant kernel panics in pandas",
                "Inability to save files to disk",
              ],
              correctOptionIndex: 0,
              explanation: "One-hot encoding creates a column for every unique value, causing massive memory usage and computational slowdowns.",
            },
            {
              id: "q-1-3",
              question: "Which Git command creates and switches to a new branch in a single command?",
              options: ["git checkout -b <name>", "git merge --abort", "git status -v", "git branch -d"],
              correctOptionIndex: 0,
              explanation: "git checkout -b (or git switch -c) creates the new branch and immediately checks it out.",
            },
          ],
        },
        {
          id: "les-g1-lab",
          title: "Week 1 Hands-on Lab: Real Dataset Profiling",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Clean and profile a messy 100k+ row dataset with Pandas/NumPy. Establish a reproducible Git branching + PR workflow and execute Linux CLI drills.",
        },
      ],
    },
    {
      id: "mod-2",
      title: "Week 2 — AI Backend Engineering I",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g2-1",
          title: "2.1 REST API Design for ML/LLM Serving",
          duration: "16 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Designing synchronous vs asynchronous prediction contracts, SSE streaming, and payload validations.",
        },
        {
          id: "les-g2-2",
          title: "2.2 FastAPI vs Flask Architecture & Concurrency",
          duration: "15 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "ASGI event loops, Uvicorn worker clustering, and async/await throughput benchmarks.",
        },
        {
          id: "les-g2-3",
          title: "2.3 Pydantic Request Validation & Error Handling",
          duration: "13 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Strict typing, schema serialization, custom validators, and standard HTTP error codes.",
        },
        {
          id: "les-g2-quiz",
          title: "Week 2 Graded Quiz: FastAPI & Model Serving",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-2-1",
              question: "Why is FastAPI natively better suited than standard synchronous Flask for LLM serving?",
              options: [
                "Native ASGI async/await allows high-concurrency non-blocking streaming I/O during LLM token generation",
                "FastAPI does not run on Python",
                "Flask cannot accept POST requests",
                "FastAPI trains neural networks 10x faster",
              ],
              correctOptionIndex: 0,
              explanation: "FastAPI is built on Starlette and supports async event loops, preventing slow LLM generation calls from blocking server worker threads.",
            },
            {
              id: "q-2-2",
              question: "What HTTP status code is automatically returned when a request payload fails Pydantic schema validation?",
              options: ["422 Unprocessable Entity", "200 OK", "404 Not Found", "500 Internal Server Error"],
              correctOptionIndex: 0,
              explanation: "FastAPI uses 422 Unprocessable Entity when the incoming JSON fails field types or constraints.",
            },
          ],
        },
        {
          id: "les-g2-lab",
          title: "Week 2 Hands-on Lab: FastAPI Inference Endpoint",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build and deploy a FastAPI service serving an NLP sentiment analysis endpoint with strict Pydantic request/response validation and robust error handling.",
        },
      ],
    },
    {
      id: "mod-3",
      title: "Week 3 — AI Backend Engineering II",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g3-1",
          title: "3.1 PostgreSQL Fundamentals for AI Data",
          duration: "17 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Designing relational schemas, JSONB columns, foreign keys, and migration strategies.",
        },
        {
          id: "les-g3-2",
          title: "3.2 Redis In-Memory Caching for LLM Responses",
          duration: "14 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Sub-millisecond prompt caching, TTL policies, and token cost reduction patterns.",
        },
        {
          id: "les-g3-3",
          title: "3.3 Docker Containerization & System Rate Limiting",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Multi-stage Docker builds, docker-compose orchestration, and sliding-window rate limiters.",
        },
        {
          id: "les-g3-quiz",
          title: "Week 3 Graded Quiz: Docker & Redis Caching",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-3-1",
              question: "What is the primary role of Redis semantic and exact response caching in production LLM systems?",
              options: [
                "Drastically reduce token costs and API latency for frequent identical or semantically similar queries",
                "Compile Python code into machine language",
                "Encrypt user passwords with bcrypt",
                "Replace GPU accelerators",
              ],
              correctOptionIndex: 0,
              explanation: "Caching prompt responses eliminates redundant calls to commercial LLM APIs, cutting costs and dropping latency to sub-10ms.",
            },
            {
              id: "q-3-2",
              question: "What is the key benefit of multi-stage Docker builds for Python AI services?",
              options: [
                "Dramatically smaller final production images by discarding build compilers and pip caches",
                "Doubles GPU memory bandwidth",
                "Bypasses Linux permissions automatically",
                "Runs without Docker desktop",
              ],
              correctOptionIndex: 0,
              explanation: "Multi-stage builds leave compiler tools in builder stages, producing lean runtime images.",
            },
          ],
        },
        {
          id: "les-g3-lab",
          title: "Week 3 Hands-on Lab: Containerized AI Backend Gate",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Dockerize your FastAPI service with Postgres persistence, Redis caching, and a sliding-window rate limiter. This is the industry-readiness gate before NLP & LLMs.",
        },
      ],
    },
    {
      id: "mod-4",
      title: "Week 4 — NLP Foundations: Text Representation",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g4-1",
          title: "4.1 Tokenization, Stemming & Lemmatization",
          duration: "15 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Linguistic challenges, subword tokenizers (BPE, WordPiece), and morphology normalization.",
        },
        {
          id: "les-g4-2",
          title: "4.2 Bag of Words (BoW) & TF-IDF Vectorization",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Sparse lexical vector spaces, term frequency mechanics, and document frequency weighting.",
        },
        {
          id: "les-g4-3",
          title: "4.3 Limitations of Lexical Matching",
          duration: "12 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Polysemy, synonymy, out-of-vocabulary tokens, and the need for dense semantic embeddings.",
        },
        {
          id: "les-g4-quiz",
          title: "Week 4 Graded Quiz: NLP Text Representation",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-4-1",
              question: "What does the Inverse Document Frequency (IDF) component penalize in TF-IDF?",
              options: [
                "Common words that appear across nearly every document in the corpus",
                "Words with fewer than 3 characters",
                "Proper nouns and foreign words",
                "Punctuation symbols",
              ],
              correctOptionIndex: 0,
              explanation: "Words that appear everywhere (like 'the', 'system', 'data') have low discriminative value, so IDF downweights them.",
            },
            {
              id: "q-4-2",
              question: "Why is lemmatization fundamentally superior to rule-based stemming?",
              options: [
                "Lemmatization uses vocabulary and morphological rules to return valid root words (lemma)",
                "Stemming requires an active GPU",
                "Lemmatization runs 100x faster than stemming",
                "Stemming only works on English numbers",
              ],
              correctOptionIndex: 0,
              explanation: "Lemmatization uses linguistic dictionaries to produce real words (e.g. 'caring' -> 'care'), whereas stemming simply truncates suffixes.",
            },
          ],
        },
        {
          id: "les-g4-lab",
          title: "Week 4 Hands-on Lab: Text Cleaning & TF-IDF from Scratch",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build an end-to-end text-cleaning pipeline with NLTK. Implement Bag-of-Words and TF-IDF from scratch in NumPy, then compare against scikit-learn.",
        },
      ],
    },
    {
      id: "mod-5",
      title: "Week 5 — Word Embeddings & Sequence Models",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g5-1",
          title: "5.1 Word2Vec (CBOW vs Skip-Gram) & Vector Math",
          duration: "19 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Distributional hypothesis, dense continuous vectors, negative sampling, and analogy math.",
        },
        {
          id: "les-g5-2",
          title: "5.2 Vanilla RNNs & Vanishing Gradients",
          duration: "16 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Recurrence relations, backpropagation through time (BPTT), and memory bottleneck.",
        },
        {
          id: "les-g5-3",
          title: "5.3 LSTM & GRU Gated Architectures",
          duration: "21 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Cell state highway, forget/input/output gates, bidirectional RNNs (BiRNN).",
        },
        {
          id: "les-g5-quiz",
          title: "Week 5 Graded Quiz: Embeddings & LSTMs",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-5-1",
              question: "In Word2Vec, what is the core difference between CBOW and Skip-gram?",
              options: [
                "CBOW predicts target word from context; Skip-gram predicts context words given target",
                "CBOW is supervised, while Skip-gram is purely random",
                "Skip-gram only handles emojis",
                "CBOW requires pre-trained BERT",
              ],
              correctOptionIndex: 0,
              explanation: "Continuous Bag-of-Words uses surrounding context words to predict the center token; Skip-gram reverses this objective.",
            },
            {
              id: "q-5-2",
              question: "Which component of an LSTM cell solves the vanishing gradient problem over long sequences?",
              options: [
                "The constant error carousel / additive cell state highway gated by the forget gate",
                "Using pure ReLU activations everywhere",
                "Dropping 99% of training samples",
                "Training without backpropagation",
              ],
              correctOptionIndex: 0,
              explanation: "The linear cell state highway allows gradients to flow backwards through time without undergoing repeated multiplicative decay.",
            },
          ],
        },
        {
          id: "les-g5-lab",
          title: "Week 5 Hands-on Lab: Word2Vec & LSTM Benchmark",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Train a Word2Vec embedding model on a custom technical corpus. Build RNN, LSTM, and GRU text classifiers in PyTorch and benchmark their accuracy and convergence.",
        },
      ],
    },
    {
      id: "mod-6",
      title: "Week 6 — Seq2Seq & Attention",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g6-1",
          title: "6.1 Encoder-Decoder Seq2Seq Mechanics",
          duration: "17 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Sequence transduction, teacher forcing, beam search vs greedy decoding.",
        },
        {
          id: "les-g6-2",
          title: "6.2 The Fixed-Context-Vector Bottleneck",
          duration: "14 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Diagnosing degradation on sentences longer than 20 tokens.",
        },
        {
          id: "les-g6-3",
          title: "6.3 Bahdanau Additive vs Luong Multiplicative Attention",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Dynamic alignment scoring, softmax normalization, and context vector synthesis.",
        },
        {
          id: "les-g6-quiz",
          title: "Week 6 Graded Quiz: Attention Mechanisms",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-6-1",
              question: "What was the fundamental bottleneck of vanilla Seq2Seq that Attention resolved?",
              options: [
                "Forcing an entire arbitrary-length sentence into a single fixed-size bottleneck vector",
                "High GPU power consumption",
                "Inability to handle English grammar",
                "Requiring too many training epochs",
              ],
              correctOptionIndex: 0,
              explanation: "Compressing entire sentences into a single vector caused severe loss of fine-grained details.",
            },
            {
              id: "q-6-2",
              question: "What does the Attention mechanism calculate at each decoder step?",
              options: [
                "A dynamic weighted sum over all encoder hidden states based on alignment scores",
                "A static average of all vocabulary tokens",
                "A random sample from normal distribution",
                "A binary 0 or 1 mask",
              ],
              correctOptionIndex: 0,
              explanation: "Attention calculates alignment weights so the decoder dynamically focuses on the most relevant source tokens.",
            },
          ],
        },
        {
          id: "les-g6-lab",
          title: "Week 6 Hands-on Lab: Seq2Seq with Attention",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build an Encoder-Decoder Seq2Seq model for text summarization. Implement an Attention layer on top and quantify the BLEU score improvement.",
        },
      ],
    },
    {
      id: "mod-7",
      title: "Week 7 — Transformers",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g7-1",
          title: "7.1 Scaled Dot-Product & Multi-Head Self-Attention",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Q, K, V projections, scaling factor sqrt(d_k), and multi-head representation subspaces.",
        },
        {
          id: "les-g7-2",
          title: "7.2 Positional Encodings & LayerNorm Architecture",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Sinusoidal vs learned encodings, residual connections, Pre-LN vs Post-LN.",
        },
        {
          id: "les-g7-3",
          title: "7.3 Pretrained Transformers & BERT Fine-Tuning",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Masked language modeling (MLM), [CLS] token classification, and transfer learning.",
        },
        {
          id: "les-g7-quiz",
          title: "Week 7 Graded Quiz: Transformer Architecture",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-7-1",
              question: "Why do Transformers require Positional Encodings injected into token embeddings?",
              options: [
                "Self-attention operations are permutation-invariant and cannot distinguish word order without positional signals",
                "To compress vocabulary memory",
                "To prevent gradient underflow",
                "To convert text to audio",
              ],
              correctOptionIndex: 0,
              explanation: "Because self-attention computes dot products across all token pairs simultaneously, word order is lost unless explicitly injected.",
            },
            {
              id: "q-7-2",
              question: "What is the computational complexity of full standard self-attention relative to sequence length N?",
              options: ["O(N^2) quadratic", "O(N) linear", "O(log N)", "O(1) constant"],
              correctOptionIndex: 0,
              explanation: "Computing the N x N attention matrix between all queries and keys scales quadratically with sequence length.",
            },
          ],
        },
        {
          id: "les-g7-lab",
          title: "Week 7 Hands-on Lab: BERT Fine-Tuning Benchmark",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Fine-tune a pretrained BERT model for classification. Complete the evolution benchmark comparing: BoW → Word2Vec → LSTM → Attention → Transformer.",
        },
      ],
    },
    {
      id: "mod-8",
      title: "Week 8 — Embeddings, Vector Databases & Retrieval",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g8-1",
          title: "8.1 Dense Embedding Spaces & Similarity Metrics",
          duration: "16 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Cosine similarity, inner product, L2 distance, and bi-encoder embeddings.",
        },
        {
          id: "les-g8-2",
          title: "8.2 Vector Database Internals: FAISS & Chroma",
          duration: "19 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Inverted file indexing (IVF), HNSW graphs, and Product Quantization (PQ).",
        },
        {
          id: "les-g8-3",
          title: "8.3 Hybrid Retrieval: BM25 + Dense Reranking",
          duration: "17 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Reciprocal Rank Fusion (RRF), cross-encoder rerankers, and recall optimization.",
        },
        {
          id: "les-g8-quiz",
          title: "Week 8 Graded Quiz: Vector DBs & Hybrid Search",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-8-1",
              question: "What is the primary strength of combining BM25 keyword search with Dense vector retrieval?",
              options: [
                "Captures both exact keyword/part-number precision and broad semantic conceptual context",
                "Eliminates the need for indexing",
                "Allows vector databases to run on diskettes",
                "Avoids using any embedding models",
              ],
              correctOptionIndex: 0,
              explanation: "Hybrid search avoids failures where embeddings miss exact jargon or part codes, and where BM25 misses synonyms.",
            },
            {
              id: "q-8-2",
              question: "What algorithm does HNSW use to achieve logarithmic-time approximate nearest neighbor search?",
              options: [
                "Hierarchical multi-layer proximity graphs with skip-list navigation",
                "Brute-force linear scan of every vector",
                "Bubble sort on dot products",
                "Random hash table truncation",
              ],
              correctOptionIndex: 0,
              explanation: "Hierarchical Navigable Small World (HNSW) organizes vectors into hierarchical proximity graphs for ultra-fast traversal.",
            },
          ],
        },
        {
          id: "les-g8-lab",
          title: "Week 8 Hands-on Lab: Hybrid FAISS + Chroma Retrieval",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build embedding pipelines with FAISS and Chroma. Implement a hybrid BM25 + dense retrieval engine with RRF reranking and measure recall gains.",
        },
      ],
    },
    {
      id: "mod-9",
      title: "Week 9 — RAG, Prompt Engineering & LLM APIs",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g9-1",
          title: "9.1 RAG Architecture & Chunking Strategies",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Recursive character chunking, semantic chunking, metadata enrichment, and parent-child retrieval.",
        },
        {
          id: "les-g9-2",
          title: "9.2 Eval-Driven & Chain-of-Thought Prompting",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Few-shot templates, structured JSON outputs, system prompt guardrails, and CoT reasoning.",
        },
        {
          id: "les-g9-3",
          title: "9.3 RAG Evaluation: Faithfulness, Relevance & Cost",
          duration: "19 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "RAGAS framework, hallucination benchmarking, token cost tracking, and latency telemetry.",
        },
        {
          id: "les-g9-quiz",
          title: "Week 9 Graded Quiz: RAG Evaluation & Prompting",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-9-1",
              question: "What does the 'Faithfulness' metric evaluate in a RAG system?",
              options: [
                "Whether all claims in the generated answer are strictly grounded in the retrieved context",
                "Whether the user clicked like on the answer",
                "The ping latency to the LLM API",
                "Whether the model used polite language",
              ],
              correctOptionIndex: 0,
              explanation: "Faithfulness measures the absence of hallucinations by verifying statements against context chunks.",
            },
            {
              id: "q-9-2",
              question: "Why is semantic chunking preferred over naive fixed-character splitting?",
              options: [
                "It splits text at natural conceptual and syntactic boundaries, preserving cohesive meaning",
                "It guarantees all chunks are exactly 100 bytes",
                "It deletes all vowels to save storage",
                "It requires zero compute",
              ],
              correctOptionIndex: 0,
              explanation: "Semantic chunking prevents sentences or ideas from being cut in half, maximizing retrieval relevancy.",
            },
          ],
        },
        {
          id: "les-g9-lab",
          title: "Week 9 Hands-on Lab: End-to-End Evaluated RAG Pipeline",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build an end-to-end RAG pipeline over domain PDF documentation. Implement a telemetry dashboard logging faithfulness, answer relevance, latency, and token cost per query.",
        },
      ],
    },
    {
      id: "mod-10",
      title: "Week 10 — LangChain/LangGraph & LLMOps",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g10-1",
          title: "10.1 LangGraph Stateful Graph Orchestration",
          duration: "21 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "State machines, conditional edges, human-in-the-loop checkpoints, and cycle handling.",
        },
        {
          id: "les-g10-2",
          title: "10.2 LLM Observability, Tracing & Cost Tracking",
          duration: "16 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "OpenTelemetry, Langfuse/Arize instrumentation, span tagging, and latency breakdown.",
        },
        {
          id: "les-g10-3",
          title: "10.3 Guardrails & CI/CD Eval-Regression Checks",
          duration: "17 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Input/output guardrails (NeMo / Guardrails AI), prompt injection filters, and CI/CD quality gates.",
        },
        {
          id: "les-g10-quiz",
          title: "Week 10 Graded Quiz: LangGraph & LLMOps",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-10-1",
              question: "What is the key capability LangGraph provides over linear chain orchestrators?",
              options: [
                "Cyclical execution loops with persistent state machines and branch-based conditional routing",
                "Compiling Python into Android apps",
                "Direct connection to blockchain networks",
                "Removing the need for LLMs",
              ],
              correctOptionIndex: 0,
              explanation: "LangGraph allows agents to iterate in loops, retry tool executions, and maintain conversational state across turns.",
            },
            {
              id: "q-10-2",
              question: "Why are automated eval-regression gates mandatory in modern LLM CI/CD pipelines?",
              options: [
                "To guarantee prompt updates or model changes do not cause silent degradation on established benchmark test sets",
                "To restart the Linux server every 5 minutes",
                "To encrypt all Python files",
                "To compress git commits",
              ],
              correctOptionIndex: 0,
              explanation: "Prompts are fragile; eval-regression testing catches accuracy drop-offs on golden evaluation datasets before shipping.",
            },
          ],
        },
        {
          id: "les-g10-lab",
          title: "Week 10 Hands-on Lab: LangGraph RAG with CI/CD Eval Gates",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Rebuild your RAG pipeline in LangGraph with stateful memory, security guardrails, and a GitHub Actions CI/CD regression check benchmarking accuracy on push.",
        },
      ],
    },
    {
      id: "mod-11",
      title: "Week 11 — Agentic AI & Cloud Deployment",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g11-1",
          title: "11.1 Autonomous Reasoning Loops & Tool-Calling",
          duration: "23 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "ReAct loop (Reason, Act, Observe), JSON tool binding, and dynamic error recovery.",
        },
        {
          id: "les-g11-2",
          title: "11.2 Stateful Agent Memory & Planning Agents",
          duration: "19 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Short-term buffer memory, long-term vector memory, plan-and-solve multi-step decomposition.",
        },
        {
          id: "les-g11-3",
          title: "11.3 Cloud Deployment & Autoscaling on AWS/Azure",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Reverse proxies, SSL termination, horizontal pod autoscaling on queue depth, and streaming APIs.",
        },
        {
          id: "les-g11-quiz",
          title: "Week 11 Graded Quiz: Agentic Systems & Cloud",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-11-1",
              question: "What execution loop defines an autonomous ReAct AI Agent?",
              options: [
                "Reason -> Select Tool -> Execute Tool -> Observe Output -> Decide Next Action or Finish",
                "Single static regex text replacement",
                "Hardcoded if-else statements without LLMs",
                "Manual human approval on every token",
              ],
              correctOptionIndex: 0,
              explanation: "ReAct iteratively interleaves thought generation with tool actions and environment observations.",
            },
            {
              id: "q-11-2",
              question: "Why should LLM API autoscaling rely on concurrent queue depth rather than raw CPU utilization?",
              options: [
                "LLM inference is I/O- and token-bound; CPU stays moderate while request queues back up, causing user timeouts",
                "Kubernetes cannot track CPU",
                "CPUs do not exist in cloud instances",
                "Autoscaling is prohibited on AWS",
              ],
              correctOptionIndex: 0,
              explanation: "Tracking inflight concurrency ensures new replicas spin up before request backlogs degrade user latency.",
            },
          ],
        },
        {
          id: "les-g11-lab",
          title: "Week 11 Hands-on Lab: Deployed Tool-Calling Agent",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build an autonomous tool-calling agent with memory in LangGraph. Containerize and deploy the service to cloud infrastructure with autoscaling and streaming responses.",
        },
      ],
    },
    {
      id: "mod-12",
      title: "Week 12 — Capstone Defense: Production Agentic RAG",
      meta: "3 Videos · 2 Assessments · 4 Resources",
      items: [
        {
          id: "les-g12-1",
          title: "12.1 Capstone Architecture & Problem Framing",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Domain selection (Legal, Medical, Enterprise Bot), data ingestion contracts, and architectural defense.",
        },
        {
          id: "les-g12-2",
          title: "12.2 Telemetry Logging & V1 to V2 Improvement Cycles",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Documenting quantifiable benchmarks: accuracy, cost per query, latency, and guardrail safety gains.",
        },
        {
          id: "les-g12-3",
          title: "12.3 Research Defense Methodology & Panel Presentation",
          duration: "15 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Preparing technical reports, answering adversarial evaluation questions, and production handoff.",
        },
        {
          id: "les-g12-quiz",
          title: "Week 12 Graded Quiz: Capstone Defense Methodology",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-12-1",
              question: "What is the primary requirement when presenting your Capstone V1 vs V2 improvements?",
              options: [
                "Defensible, logged metrics demonstrating measurable gains in accuracy, latency, token costs, and safety",
                "Having the longest source code file",
                "Using only 1 line of Python",
                "Claiming 100% accuracy without any benchmark data",
              ],
              correctOptionIndex: 0,
              explanation: "Evaluation panels look for engineering rigor: concrete telemetry data proving that architectural changes improved real metrics.",
            },
          ],
        },
        {
          id: "les-g12-lab",
          title: "Capstone Project: Production Agentic RAG System",
          duration: "120 Mins",
          type: "assignment",
          instructions: "Deliverables: 1. Integrated Agent/RAG system with hybrid retrieval and dynamic tools. 2. Telemetry evaluation logging accuracy, cost, latency, safety. 3. Containerized cloud deployment. 4. Documented V1 to V2 improvement report. Defend before the panel.",
        },
      ],
    },
  ],
};

export const INCUBATOR_CURRICULUM: CourseCurriculum = {
  id: "cs-common",
  title: "AI Entrepreneurship & Innovation",
  eyebrow: "WEEKEND INCUBATOR TRACK • FROM AI CAPABILITY TO VALIDATED STARTUP",
  duration: "3 Months (12 Weekends · Sat & Sun only)",
  level: "All Students (Weekend Incubator)",
  stats: {
    videos: 24,
    assessments: 12,
    resources: 36,
  },
  modules: [
    {
      id: "mod-i1",
      title: "Weekend 1: Design Thinking & Pain Points",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i1-1",
          title: "Saturday: Introduction to Design Thinking & Empathy Mapping",
          duration: "25 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Understanding human-centered design, identifying real user friction, and structuring empathy interviews.",
        },
        {
          id: "les-i1-2",
          title: "Sunday: Mapping Candidate Pain Points & Peer Critique",
          duration: "25 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Mapping 3 candidate pain points from lived experience or target community.",
        },
        {
          id: "les-i1-quiz",
          title: "Weekend 1 Graded Quiz: Design Thinking Foundations",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i1-1",
              question: "In design thinking empathy mapping, what is the most authentic source of customer pain points?",
              options: [
                "Observing and interviewing real target users experiencing the problem daily",
                "Guessing without external validation",
                "Copying competitor landing pages",
                "Generating random ideas with standard search queries",
              ],
              correctOptionIndex: 0,
              explanation: "Direct empathy and observation of real users reveals actual emotional friction and non-obvious workarounds.",
            },
          ],
        },
        {
          id: "les-i1-lab",
          title: "Milestone Deliverable: Problem Statement Initiation",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Map 3 candidate pain points from your target customer segment and draft the initial Problem Statement Brief.",
        },
      ],
    },
    {
      id: "mod-i2",
      title: "Weekend 2: Customer Discovery Interviews",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i2-1",
          title: "Saturday: Discovery Interview Design & The Mom Test",
          duration: "24 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Writing unbiased questions, avoiding hypothetical leading questions, structuring 15-minute discovery calls.",
        },
        {
          id: "les-i2-2",
          title: "Sunday: Synthesizing Customer Insights into Problem Briefs",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Extracting patterns, quotes, and willingness-to-pay signals from customer transcripts.",
        },
        {
          id: "les-i2-quiz",
          title: "Weekend 2 Graded Quiz: Customer Discovery Techniques",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i2-1",
              question: "Why must early founders avoid asking: 'Would you buy a product that does X?'",
              options: [
                "Hypothetical questions yield polite false validation rather than factual evidence of past behaviors and spending",
                "It violates marketing regulations",
                "Customers always hang up",
                "It causes technical bugs",
              ],
              correctOptionIndex: 0,
              explanation: "People are polite and over-optimistic about hypothetical futures. As taught in 'The Mom Test', always ask about specific past actions.",
            },
          ],
        },
        {
          id: "les-i2-lab",
          title: "Milestone Deliverable: Customer Discovery Problem Brief",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Conduct 3–5 mock customer discovery interviews. Synthesize findings into a verified Problem Brief with direct customer quotes.",
        },
      ],
    },
    {
      id: "mod-i3",
      title: "Weekend 3: Competitor Matrix & Market Sizing",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i3-1",
          title: "Saturday: Competitive Analysis Frameworks & Positioning Maps",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Direct vs indirect competitors, feature matrices, and 2x2 positioning maps.",
        },
        {
          id: "les-i3-2",
          title: "Sunday: Bottom-Up TAM / SAM / SOM Market Sizing",
          duration: "26 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Calculating Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market.",
        },
        {
          id: "les-i3-quiz",
          title: "Weekend 3 Graded Quiz: Market Sizing & Positioning",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i3-1",
              question: "What does SOM represent in the TAM/SAM/SOM market sizing model?",
              options: [
                "Serviceable Obtainable Market: The realistic share of the market your venture can capture within 1–3 years",
                "System Operating Metric",
                "Total global market size",
                "Software Optimization Model",
              ],
              correctOptionIndex: 0,
              explanation: "SOM represents your immediate realistic target given your team, sales channels, and geographic focus.",
            },
          ],
        },
        {
          id: "les-i3-lab",
          title: "Milestone Deliverable: Competitor Matrix & TAM/SAM/SOM Model",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Build a competitor matrix identifying whitespace positioning and a bottom-up TAM/SAM/SOM market model.",
        },
      ],
    },
    {
      id: "mod-i4",
      title: "Weekend 4: Problem Statement Lock-In",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i4-1",
          title: "Saturday: Peer Review & Mentor Feedback Workshop",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Stress-testing customer discovery evidence, market sizing realism, and competitor defensibility.",
        },
        {
          id: "les-i4-2",
          title: "Sunday: Locking in the Validated Problem Statement",
          duration: "18 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Finalizing the problem statement before investing engineering resources into the prototype.",
        },
        {
          id: "les-i4-quiz",
          title: "Weekend 4 Graded Quiz: Problem Statement Validation",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i4-1",
              question: "What is the primary indicator of a validated problem statement ready for MVP engineering?",
              options: [
                "Documented target persona, quantifiable time/money lost, failed current workarounds, and documented willingness to pay",
                "A cool tech stack idea with no user interviews",
                "A large PowerPoint deck",
                "A logo design",
              ],
              correctOptionIndex: 0,
              explanation: "Validation requires documented proof of real user urgency, financial impact, and active search for solutions.",
            },
          ],
        },
        {
          id: "les-i4-lab",
          title: "Milestone Deliverable: Validated Problem Statement Locked",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Finalize and submit your Validated Problem Statement brief locked in with mentor sign-off.",
        },
      ],
    },
    {
      id: "mod-i5",
      title: "Weekend 5: Where AI Creates 10x Value",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i5-1",
          title: "Saturday: Framework for Spotting 10x AI Opportunities",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Transformative 10x friction reduction vs incremental form-filling automation.",
        },
        {
          id: "les-i5-2",
          title: "Sunday: Applying the 10x AI Value Matrix",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Mapping LLMs, vision, and agentic workflows to your validated customer problem.",
        },
        {
          id: "les-i5-quiz",
          title: "Weekend 5 Graded Quiz: The 10x AI Value Matrix",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i5-1",
              question: "In the 10x AI Value Framework, what differentiates genuine transformative AI from simple automation?",
              options: [
                "Enabling fundamentally new capabilities or an order-of-magnitude reduction in time and cost",
                "Using 5 different API keys",
                "Adding a generic chat box to a footer",
                "Charging 10x higher prices",
              ],
              correctOptionIndex: 0,
              explanation: "10x value collapses multi-hour complex human workflows into automated seconds with verified accuracy.",
            },
          ],
        },
        {
          id: "les-i5-lab",
          title: "Milestone Deliverable: 10x AI Opportunity Matrix",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Map the AI Opportunity matrix to your validated problem, proving where generative or agentic AI delivers an order-of-magnitude advantage.",
        },
      ],
    },
    {
      id: "mod-i6",
      title: "Weekend 6: Rapid Prototyping Toolkit",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i6-1",
          title: "Saturday: Low-Code & AI-Assisted Prototyping Tools",
          duration: "25 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Streamlit, v0, Bolt, Lovable, Retool, and fast LLM wrapper prototyping.",
        },
        {
          id: "les-i6-2",
          title: "Sunday: Building the First Clickable MVP Build",
          duration: "28 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Assembling the interactive core flow for early user test sessions.",
        },
        {
          id: "les-i6-quiz",
          title: "Weekend 6 Graded Quiz: Rapid Prototyping Principles",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i6-1",
              question: "What is the single purpose of a Weekend 6 clickable functional prototype?",
              options: [
                "Validating core user interaction loops and value proposition with minimal overhead",
                "Building enterprise microservices",
                "Writing 10,000 unit tests",
                "Filing utility patents",
              ],
              correctOptionIndex: 0,
              explanation: "Clickable prototypes test user comprehension and value delivery before investing in complex backend infrastructure.",
            },
          ],
        },
        {
          id: "les-i6-lab",
          title: "Milestone Deliverable: Functional MVP Clickable Build",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Deploy the first clickable, interactive version of your prototype and submit the live URL.",
        },
      ],
    },
    {
      id: "mod-i7",
      title: "Weekend 7: MVP Build Sprint",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i7-1",
          title: "Saturday: Integrating the Core AI-Driven Feature",
          duration: "24 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Connecting OpenAI/Anthropic APIs or open-source weights to the user frontend.",
        },
        {
          id: "les-i7-2",
          title: "Sunday: Sprint Debugging & Mentor Office Hours",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Handling streaming, latency masking, and error states.",
        },
        {
          id: "les-i7-quiz",
          title: "Weekend 7 Graded Quiz: MVP Build Discipline",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i7-1",
              question: "During an MVP build sprint, how should founders handle feature requests outside the core wedge?",
              options: [
                "Strictly backlog them to maintain velocity on the single core problem-solving feature",
                "Build all requests immediately",
                "Cancel the startup",
                "Rebuild the entire architecture",
              ],
              correctOptionIndex: 0,
              explanation: "Focus is the primary advantage of a pre-seed startup; distraction dilutes the core value proposition.",
            },
          ],
        },
        {
          id: "les-i7-lab",
          title: "Milestone Deliverable: MVP Core AI Integration",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Deliver the functional prototype powered by the core AI feature and live prompt pipeline.",
        },
      ],
    },
    {
      id: "mod-i8",
      title: "Weekend 8: Validating the MVP with Users",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i8-1",
          title: "Saturday: Structuring Feedback & User Observation Sessions",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Observing silent user walkthroughs without coaching or making excuses.",
        },
        {
          id: "les-i8-2",
          title: "Sunday: Logging Feedback & Iterating on the Prototype",
          duration: "24 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Extracting usability hurdles and ranking feature modifications.",
        },
        {
          id: "les-i8-quiz",
          title: "Weekend 8 Graded Quiz: User Validation Diagnostics",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i8-1",
              question: "What is the strongest signal of early product-market pull during MVP testing?",
              options: [
                "Users asking to keep using the product daily, sharing it unprompted, or offering money upfront",
                "Polite compliments without retention",
                "High impressions on LinkedIn posts",
                "Family members saying it looks nice",
              ],
              correctOptionIndex: 0,
              explanation: "Real usage, repeat engagement, and willingness to pay are the only truthful metrics of product pull.",
            },
          ],
        },
        {
          id: "les-i8-lab",
          title: "Milestone Deliverable: User Validation Feedback Log",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Run live testing sessions with at least 3 early users. Submit your structured feedback log and resulting MVP improvements.",
        },
      ],
    },
    {
      id: "mod-i9",
      title: "Weekend 9: Business Model Canvas",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i9-1",
          title: "Saturday: Business Model Canvas (BMC) for AI Products",
          duration: "25 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Value props, customer segments, channels, key partners, and cost structures.",
        },
        {
          id: "les-i9-2",
          title: "Sunday: Unit Economics & AI Token COGS Modeling",
          duration: "26 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Pricing tiers, gross margin modeling, LTV to CAC ratios, and token inference costs.",
        },
        {
          id: "les-i9-quiz",
          title: "Weekend 9 Graded Quiz: BMC & Unit Economics",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i9-1",
              question: "Why must AI startups factor API token and compute costs directly into COGS (Cost of Goods Sold)?",
              options: [
                "LLM inference has non-trivial marginal cost per query that directly impacts gross margins",
                "Token costs are considered office supplies",
                "Cloud providers mandate it by law",
                "It eliminates tax obligations",
              ],
              correctOptionIndex: 0,
              explanation: "Unlike zero-marginal-cost web apps, every AI generation costs compute; unit economics must guarantee healthy gross margins.",
            },
          ],
        },
        {
          id: "les-i9-lab",
          title: "Milestone Deliverable: Complete Business Model Canvas",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Submit a complete Business Model Canvas with documented unit economics, pricing model, and cost structure.",
        },
      ],
    },
    {
      id: "mod-i10",
      title: "Weekend 10: Go-To-Market Strategy",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i10-1",
          title: "Saturday: GTM Frameworks & The Wedge Strategy",
          duration: "22 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Channel distribution, outbound vs inbound, developer evangelism, community flywheels.",
        },
        {
          id: "les-i10-2",
          title: "Sunday: Early-Adopter Acquisition Playbook",
          duration: "20 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Securing your first 10 paying customers with high-touch concierge onboarding.",
        },
        {
          id: "les-i10-quiz",
          title: "Weekend 10 Graded Quiz: GTM Distribution",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i10-1",
              question: "What is the strategic purpose of a narrow 'wedge' in early B2B/B2C distribution?",
              options: [
                "Dominate a specific underserved workflow before expanding laterally into adjacent markets",
                "Sell to Fortune 500 companies on day one",
                "Spend the entire budget on television commercials",
                "Offer unlimited free lifetime service",
              ],
              correctOptionIndex: 0,
              explanation: "A narrow wedge builds high user density, high conversion, and organic word-of-mouth.",
            },
          ],
        },
        {
          id: "les-i10-lab",
          title: "Milestone Deliverable: Go-To-Market Acquisition Playbook",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Deliver an actionable 90-day GTM acquisition playbook outlining channels, outreach scripts, and early adopter milestones.",
        },
      ],
    },
    {
      id: "mod-i11",
      title: "Weekend 11: Investor Pitch Deck",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i11-1",
          title: "Saturday: Storytelling & Anatomy of a 10-Slide Deck",
          duration: "26 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Problem, Solution, Market, Product, Business Model, Traction, Go-to-Market, Competition, Team, The Ask.",
        },
        {
          id: "les-i11-2",
          title: "Sunday: Pitch Deck Draft, Peer Review & Iteration",
          duration: "24 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Removing vanity metrics, clarifying defensibility, and polishing executive slide design.",
        },
        {
          id: "les-i11-quiz",
          title: "Weekend 11 Graded Quiz: Pitch Deck Architecture",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i11-1",
              question: "What is the primary role of the 'Traction' slide in an early-stage investor pitch deck?",
              options: [
                "Demonstrate measurable forward momentum, user adoption velocity, and validated retention",
                "List all software versions installed",
                "Show photos of high-end office buildings",
                "List all college courses taken",
              ],
              correctOptionIndex: 0,
              explanation: "Traction proves that the founders can execute and that the market wants what they are building.",
            },
          ],
        },
        {
          id: "les-i11-lab",
          title: "Milestone Deliverable: 10-Slide Investor Pitch Deck",
          duration: "60 Mins",
          type: "assignment",
          instructions: "Submit your polished 10-slide investor pitch deck synthesized for pre-seed/angel investor scrutiny.",
        },
      ],
    },
    {
      id: "mod-i12",
      title: "Weekend 12: Startup Validation & Pitch Deck (Capstone)",
      meta: "2 Videos · 1 Quiz · 1 Milestone",
      items: [
        {
          id: "les-i12-1",
          title: "Saturday: Pitch Rehearsal & Live Feedback with Mentors",
          duration: "25 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Mastering Q&A, handling adversarial business model challenges, and pacing a 5-minute pitch.",
        },
        {
          id: "les-i12-2",
          title: "Sunday: Final Pitch — Live Capstone Defense",
          duration: "30 Mins",
          type: "video",
          videoUrl: RICK_ROLL_URL,
          description: "Presenting and defending your complete venture before an investor-style evaluation panel.",
        },
        {
          id: "les-i12-quiz",
          title: "Weekend 12 Graded Quiz: Startup Defensibility",
          duration: "15 Mins",
          type: "quiz",
          questions: [
            {
              id: "q-i12-1",
              question: "In the Final Pitch defense, what creates the strongest competitive defensibility (moat)?",
              options: [
                "Proprietary workflow integration, compounding customer data feedback loops, and high switching costs",
                "Claiming no competitors exist anywhere in the world",
                "Having the longest slide deck",
                "Relying solely on standard off-the-shelf public LLM APIs with no customization",
              ],
              correctOptionIndex: 0,
              explanation: "Defensibility comes from customer workflow lock-in, proprietary feedback loops, and high switching costs.",
            },
          ],
        },
        {
          id: "les-i12-lab",
          title: "Milestone Deliverable: Final Pitch Venture Defense",
          duration: "120 Mins",
          type: "assignment",
          instructions: "Final Capstone Deliverables: 1. Functional MVP Prototype 2. Validated Business Model Canvas 3. 90-day GTM Plan 4. 10-Slide Investor Deck 5. Live Defense before Panel.",
        },
      ],
    },
  ],
};

export function getCurriculum(courseId?: string): CourseCurriculum {
  if (!courseId) return GENAI_CURRICULUM;
  const normalized = courseId.toLowerCase();
  if (normalized.includes("common") || normalized.includes("entrepreneur") || normalized.includes("incubator")) {
    return INCUBATOR_CURRICULUM;
  }
  return GENAI_CURRICULUM;
}

export function getEmbedVideoUrl(url?: string): string {
  if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  return url;
}
