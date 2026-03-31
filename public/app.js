document.addEventListener('DOMContentLoaded', () => {
  const gtmPlaybook = document.getElementById('gtmPlaybook');
  const battleCard = document.getElementById('battleCard');
  
  // Modal Drawer logic
  const openContextBtn = document.getElementById('openContextBtn');
  const contextModalOverlay = document.getElementById('contextModalOverlay');
  const contextDrawer = document.getElementById('contextDrawer');
  const closeContextBtn = document.getElementById('closeContextBtn');
  const saveContextBtn = document.getElementById('saveContextBtn');
  const saveContextStatus = document.getElementById('saveContextStatus');
  
  const leadForm = document.getElementById('leadForm');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  
  const outputSection = document.getElementById('outputSection');
  const skeletonSection = document.getElementById('skeletonSection');
  
  const whyTidbOut = document.getElementById('whyTidbOut');
  const linkedinOut = document.getElementById('linkedinOut');
  const emailSubject = document.getElementById('emailSubject');
  const emailOut = document.getElementById('emailOut');
  const callScriptOut = document.getElementById('callScriptOut');
  const notesOut = document.getElementById('notesOut');
  
  const copyButtons = document.querySelectorAll('.copy-btn');

  const defaultGTM = `# Unified Knowledge Base: TiDB Cloud as an Agentic Data Foundation

## 1. Executive Summary: The AI Data Challenge
Current AI infrastructure is suffering from the "Memory Wall." While LLMs have become highly capable, the data systems feeding them are fragmented. Engineering teams spend ~70% of their time on "data plumbing"—synchronizing data between transactional databases (Postgres), vector stores (Pinecone), and analytical engines (Snowflake). This leads to:
* **The Agentic Tax:** High costs and complexity from managing multiple siloed services.
* **Data Stale-ness:** Lag between a real-world event and its availability for AI reasoning.
* **Context Fragmentation:** Agents cannot correlate real-time telemetry with historical trends or semantic context.

**The Solution:** TiDB Cloud provides a Unified Agentic Data Foundation, combining OLTP, OLAP, and Vector search into a single, serverless, "Git-like" database environment.

## 2. Technical Architecture & Core Features

### A. Unified Multi-Modal Engine
TiDB eliminates the need for multiple databases by integrating three core capabilities into one cluster:
* **Transactional (OLTP):** High-concurrency ACID-compliant storage for session states and device telemetry.
* **Analytical (OLAP/HTAP):** Real-time analysis of historical data using a columnar storage engine (TiFlash) without impacting transactional performance.
* **Vector Search:** Native storage and indexing of embeddings, allowing agents to perform semantic searches directly alongside SQL queries.

### B. Agent-First Features
* **Serverless Branching:** Allows an agent to instantly "fork" a production database into a sandbox. Agents can test schema changes or run complex simulations without affecting the live environment.
* **Scale-to-Zero & RU Metering:** Using "Request Units" (RU), the system scales compute based on actual demand. This is critical for AI apps where agent activity is often "spiky."
* **Model Context Protocol (MCP):** A standardized interface that allows AI agents to "talk" to the database natively, reducing the need for custom middleware.

### C. The 3-Tier Memory Model for Agents
To act autonomously, agents require three types of memory, all hosted in TiDB:
* **Short-Term:** Current session variables and immediate task state.
* **Mid-Term:** Checkpoints of reasoning paths and recent logs.
* **Long-Term:** The "Fleet Memory"—historical patterns, user preferences, and global knowledge graphs.

## 3. Real-World Implementation (IoT Case Study)
The documents highlight a deployment for an EV Charging Network, demonstrating how this foundation handles high-scale, "noisy" IoT data:
* **Ingestion:** 1,300+ messages/sec across 20,000+ devices with 99.9% availability.
* **Automated Vectorization:** Uses TiCDC (Change Data Capture) to monitor telemetry. When an anomaly is detected, a background process automatically generates a vector embedding and stores it in the Vector engine.
* **Autonomous Diagnostics:** When a charger fails, an agent performs a "Hybrid Search":
  * **SQL:** "What is the current voltage of Charger X?"
  * **Vector:** "Find the top 3 similar failure patterns in our historical Outage Catalog."
  * **Analysis:** "Compare today’s performance to the monthly average."

## 4. Business & Engineering Impact
* **TCO Reduction:** Consolidating the stack leads to a 65%–75% reduction in Total Cost of Ownership by removing the need for ETL tools and multiple licenses.
* **Development Speed:** Teams report a 3x faster Go-To-Market (GTM) because they spend less time on infrastructure and more on agent logic.
* **Enhanced Reliability:** Unified security policies, SOC 2 compliance, and built-in "Safety Guardrails" prevent agents from executing destructive commands (e.g., automated blocks for DROP TABLE).

## 5. Summary Table for App Logic
* **HTAP Engine (Hybrid Row/Columnar Storage):** Real-time reasoning on fresh data.
* **Native Vector (Semantic search + SQL):** Eliminates external vector DB latency.
* **Branching (Instant DB Cloning):** Risk-free hypothesis testing.
* **RU Billing (Consumption-based pricing):** Cost-efficient scaling for agent fleets.
* **TiCDC (Real-time event streaming):** Automates the embedding pipeline.`;

  const defaultBattleCard = `**CockroachDB**
*   **What they do:** A cloud-agnostic, distributed SQL database compatible with PostgreSQL, designed for global scale and extreme survivability.
*   **Their main weaknesses vs TiDB:** It defaults to "Serializable" isolation (paranoid consistency), which adds significant P99 latency spikes and forces applications to handle transaction retries (error 40001). It also lacks a dedicated columnar storage engine, forcing analytical queries to perform slow row-based scans. Its vector index (C-SPANN) is strictly locked to the Postgres ecosystem.
*   **Common pain points their customers face:** High developer friction due to writing transaction retry loops in the application code, sluggish performance on complex analytical/reporting queries, and a steep learning curve. 
*   **Best TiDB talking points against them:** "CockroachDB forces you to drive a tank to the grocery store—it's safe but slow and heavy. TiDB gives you a sports car—it's fast for 99% of apps with Snapshot Isolation, with a manual override (SELECT FOR UPDATE) for the 1% that need strict locking". Furthermore, TiDB includes **TiFlash**, giving you "Snowflake built-in for free" for instant real-time analytics without slowing down your transactions.
*   **Typical tech stack signals:** Postgres ecosystem, Go/Java backends, financial/ledger applications, multi-region deployments.

**Amazon Aurora (MySQL / PostgreSQL)**
*   **What they do:** AWS’s fully managed relational database optimized for cloud storage, relying on a traditional monolithic compute node.
*   **Their main weaknesses vs TiDB:** Plagued by the "single-writer bottleneck," maxing out around 20,000 QPS for writes. Compute does not scale horizontally with storage. Failovers can take up to 120 seconds (during which writes are blocked), and it lacks native Hybrid Transactional/Analytical Processing (HTAP).
*   **Common pain points their customers face:** Hitting write-throughput ceilings during traffic spikes, massive application downtime or table locking during schema changes (DDL), and the forced reliance on complex, delayed ETL pipelines to move data to Redshift or Snowflake for analytics. 
*   **Best TiDB talking points against them:** TiDB separates compute and storage for unlimited multi-writer horizontal scaling (>300,000 QPS) and <30s failover. For CI/CD, TiDB offers **Instant Database Branching** to clone production data in seconds, accelerating developer velocity by 10x. 
*   **Typical tech stack signals:** AWS-centric infrastructure, heavy use of read replicas, complex ETL pipelines feeding into data warehouses, and teams complaining about MySQL 5.7 deprecation.

**Google Cloud Spanner**
*   **What they do:** Google’s globally distributed, strongly consistent database that uses proprietary TrueTime hardware (atomic clocks and GPS) to achieve external consistency.
*   **Their main weaknesses vs TiDB:** Extreme vendor lock-in (exclusive to GCP). Global writes suffer a "commit wait" latency tax (typically 4-10ms) to ensure clock uncertainty passes. 
*   **Common pain points their customers face:** Prohibitive expense for non-critical workloads, the inability to deploy on AWS, Azure, or on-premise, and forced lock-in to Google's Vertex AI for vector capabilities.
*   **Best TiDB talking points against them:** TiDB is the "Agnostic Scaler"—it runs anywhere (AWS, Azure, GCP, on-prem) with zero vendor lock-in. TiDB also democratizes AI by bringing **Native MySQL Vector Search** directly to your database, meaning you don't need to be locked into Vertex AI to build GenAI apps.
*   **Typical tech stack signals:** Deep GCP integration, Vertex AI usage, global ledger/banking systems.

**YugabyteDB**
*   **What they do:** A cloud-native, distributed SQL database built on a Spanner-like architecture but featuring a PostgreSQL-compatible query layer.
*   **Their main weaknesses vs TiDB:** Employs a more monolithic node design compared to TiDB's highly decoupled architecture. It reuses the standard PostgreSQL query planner, making distributed joins heavy and inefficient. It lacks a dedicated, isolated columnar engine for real-time analytics.
*   **Common pain points their customers face:** Slower single-region write latency due to full Raft consensus overhead without storage offload, and sluggish analytical query performance based on row-store limitations.
*   **Best TiDB talking points against them:** "Yugabyte is great if you specifically need Postgres features, but TiDB scales compute (TiDB), transactional storage (TiKV), and analytical storage (TiFlash) completely independently. If you need faster reporting, you just add TiFlash nodes without impacting your live app". 
*   **Typical tech stack signals:** Postgres ecosystem, multi-cloud/geo-location deployments, need for distributed SQL APIs.

**MySQL / MariaDB**
*   **What they do:** The world's most popular open-source monolithic relational databases, serving as the default backend for web applications.
*   **Their main weaknesses vs TiDB:** Strictly bound to vertical scaling (needing bigger servers). Horizontal write scaling requires complex, manual sharding logic written into the application code. 
*   **Common pain points their customers face:** Managing manual shards, replication lag causing stale reads, and massive application downtime or table locking during schema changes. 
*   **Best TiDB talking points against them:** TiDB is fully MySQL 5.7/8.0 wire-compatible. You get limitless horizontal scaling with auto-sharding that is completely transparent to your app. Plus, TiDB performs **Online DDL**, allowing schema changes on terabytes of data with zero downtime. 
*   **Typical tech stack signals:** LAMP stack, heavy reliance on read replicas, use of migration/DDL tools like \`gh-ost\` or proxy tools like MaxScale.

**PostgreSQL**
*   **What they do:** The world's most advanced open-source object-relational database, highly favored for complex queries, JSON, and GIS support.
*   **Their main weaknesses vs TiDB:** It is a monolithic architecture built for a single node. Horizontal scaling is incredibly difficult without moving to a completely different database or relying on complex extensions. 
*   **Common pain points their customers face:** Hitting the write-capacity limits of a single machine, and the inability to run real-time analytics without setting up expensive, delayed ETL pipelines to data warehouses.
*   **Best TiDB talking points against them:** TiDB offers elastic, limitless horizontal scale that a monolithic Postgres setup cannot achieve. With TiFlash, you eliminate your ETL pipeline entirely, analyzing live operational data instantly.
*   **Typical tech stack signals:** Deep Postgres usage, reliance on extensions (like Citus or pgvector), monolithic backend apps hitting performance walls.

**PlanetScale / Vitess**
*   **What they do:** A database platform built on Vitess, offering a shared-nothing architecture that shards MySQL databases for massive scale.
*   **Their main weaknesses vs TiDB:** Requires manual configuration of sharding schemes (choosing shard keys) which dictates application architecture. 
*   **Common pain points their customers face:** The operational overhead of maintaining sharding logic, and the inability to run real-time, heavy analytical joins natively across shards.
*   **Best TiDB talking points against them:** TiDB handles sharding dynamically and automatically under the hood via the Placement Driver (PD)—developers never have to pick a shard key or rewrite application logic. TiDB also features built-in HTAP for real-time analytics.
*   **Typical tech stack signals:** High-growth startups, Kubernetes-heavy environments, Vercel integrations, massive scale MySQL users.

**Neon**
*   **What they do:** A serverless Postgres platform that separates compute and storage to offer features like instant database branching and autoscaling.
*   **Their main weaknesses vs TiDB:** Neon relies on a single writer node; it scales writes vertically (adding CPU/RAM) but reads horizontally. 
*   **Common pain points their customers face:** Hitting write bottlenecks when traffic unexpectedly spikes beyond a single node's capacity.
*   **Best TiDB talking points against them:** While Neon is great for serverless Postgres reads, TiDB offers true **distributed multi-writer capabilities** for unlimited horizontal write scale. TiDB Cloud also provides Serverless scaling and instant database branching.
*   **Typical tech stack signals:** Serverless applications, Vercel deployments, Postgres users needing quick staging clones.

**Microsoft SQL Server (MSSQL) & Oracle**
*   **What they do:** The traditional commercial market leaders for core enterprise, ERP, and legacy workloads.
*   **Their main weaknesses vs TiDB:** Reliant on monolithic architecture requiring expensive vertical scaling. Extreme commercial licensing costs and reliance on active-passive failover clusters that can take seconds or minutes to recover.
*   **Common pain points their customers face:** Prohibitive licensing expense, vendor lock-in, complex scaling, and slower failover times. 
*   **Best TiDB talking points against them:** TiDB offers unlimited horizontal scaling and is open-source, significantly lowering TCO. TiDB uses the Raft Consensus Algorithm for active-active high availability, guaranteeing zero data loss (RPO=0) and near-zero downtime (RTO < 30s) if a node fails. 
*   **Typical tech stack signals:** Microsoft-centric teams (.NET, Azure SQL, PowerBI), legacy banking/telecom systems, heavy reliance on Stored Procedures.

**Cassandra**
*   **What they do:** A wide-column NoSQL database known as "The Firehose," built for ultra-fast, high-throughput writes by appending data to logs without waiting for consensus.
*   **Their main weaknesses vs TiDB:** Sacrifices strong ACID consistency (offering eventual consistency) and completely lacks support for SQL JOINs. 
*   **Common pain points their customers face:** Attempting to run complex reads or joins forces developers to write incredibly slow and complex logic into the application code. Reads can also be slower if records are updated frequently. 
*   **Best TiDB talking points against them:** "Cassandra might be faster for pure ingestion, but you lose SQL joins and consistency. TiDB gives you massive throughput with strict ACID guarantees, allowing you to run complex real-time analytics (OLAP) on your live data".
*   **Typical tech stack signals:** Use cases requiring massive ingest speed where consistency is optional, such as IoT sensor logs or chat history.`;

  const loadContext = async () => {
    try {
      const res = await fetch('/api/context');
      const data = await res.json();
      if (data.gtmPlaybook) gtmPlaybook.value = data.gtmPlaybook;
      else gtmPlaybook.value = localStorage.getItem('tidb_gtmPlaybook_v2') || defaultGTM;
      
      if (data.battleCard) battleCard.value = data.battleCard;
      else battleCard.value = localStorage.getItem('tidb_battleCard_v2') || defaultBattleCard;
    } catch (err) {
      console.error('Failed to load context.json, relying on local cache', err);
      gtmPlaybook.value = localStorage.getItem('tidb_gtmPlaybook_v2') || defaultGTM;
      battleCard.value = localStorage.getItem('tidb_battleCard_v2') || defaultBattleCard;
    }
  };
  loadContext();

  const openDrawer = () => {
    contextModalOverlay.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => {
      contextDrawer.classList.remove('translate-x-full');
    }, 10);
  };

  const closeDrawer = () => {
    contextDrawer.classList.add('translate-x-full');
    setTimeout(() => {
      contextModalOverlay.classList.add('hidden');
    }, 300);
  };

  openContextBtn.addEventListener('click', openDrawer);
  closeContextBtn.addEventListener('click', closeDrawer);
  contextModalOverlay.addEventListener('click', (e) => {
    if (e.target === contextModalOverlay) closeDrawer();
  });

  saveContextBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gtmPlaybook: gtmPlaybook.value, battleCard: battleCard.value })
      });
      // also save to localStorage as a backup
      localStorage.setItem('tidb_gtmPlaybook_v2', gtmPlaybook.value);
      localStorage.setItem('tidb_battleCard_v2', battleCard.value);
      
      saveContextStatus.classList.remove('opacity-0');
      setTimeout(() => {
        saveContextStatus.classList.add('opacity-0');
        setTimeout(closeDrawer, 300); // auto close on save
      }, 1000);
    } catch (err) {
      console.error('Failed to save context to server:', err);
    }
  });

  const loadingPhaseText = document.getElementById('loadingPhaseText');
  const phases = [
    "Connecting to Search grounding & scraping LinkedIn signals...",
    "Inferring role, industry, and tech stack...",
    "Drafting personalized hooks...",
    "Finalizing email and LinkedIn output..."
  ];

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    generateBtn.disabled = true;
    btnText.textContent = 'Executing Search Grounding...';
    
    outputSection.classList.add('hidden');
    skeletonSection.classList.remove('hidden');
    
    let phaseIndex = 0;
    loadingPhaseText.textContent = phases[0];
    const loadingInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      loadingPhaseText.textContent = phases[phaseIndex];
    }, 2500);

    const payload = {
      companyName: document.getElementById('companyName').value,
      linkedinUrl: document.getElementById('linkedinUrl').value,
      extraNotes: document.getElementById('extraNotes').value,
      gtmPlaybook: gtmPlaybook.value,
      battleCard: battleCard.value
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      whyTidbOut.textContent = data.why_tidb || 'No justification generated.';
      linkedinOut.textContent = data.linkedin_message || 'No LinkedIn message generated.';
      emailSubject.textContent = data.email_subject || 'No subject generated.';
      emailOut.textContent = data.email_body || 'No email body generated.';
      callScriptOut.textContent = data.call_script || 'No call script generated.';
      
      notesOut.innerHTML = '';
      if (data.personalization_notes && data.personalization_notes.length > 0) {
        data.personalization_notes.forEach(note => {
          const li = document.createElement('li');
          // Highlight TiDB specifically for that developer aesthetic "highlight" trick
          li.innerHTML = note.replace(/TiDB/g, '<span class="text-[#ef4444] font-medium border-b border-[#ef4444]/30 pb-0.5">TiDB</span>');
          notesOut.appendChild(li);
        });
      }

      skeletonSection.classList.add('hidden');
      outputSection.classList.remove('hidden');

    } catch (error) {
      alert('Error generating messages. Make sure your API key is configured correctly and the Node server is running.');
      console.error(error);
      skeletonSection.classList.add('hidden');
    } finally {
      clearInterval(loadingInterval);
      generateBtn.disabled = false;
      btnText.textContent = 'Analyze & Generate Payload';
    }
  });

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      const textToCopy = targetEl.innerText;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        const feedback = btn.querySelector('.copy-feedback');
        if (feedback) {
          feedback.classList.remove('opacity-0');
          setTimeout(() => {
            feedback.classList.add('opacity-0');
          }, 1500);
        }
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });
});
