# Plan: Civic "Mega-Scenarios" Integration (Agentic Workflows)

This plan expands the simulation to include high-complexity, multi-stage "Mega-Scenarios" based on **Civic's 80+ connectors**. It emphasizes the scale of modern agentic systems, where a single task might span 10+ nodes across multiple platforms, with cascading failure risks.

## 1. High-Complexity "Mega-Scenarios"

Each scenario will feature a "primary path" of 10-15 nodes, plus branching paths and feedback loops.

### Mega-Scenario 1: Enterprise RevOps & Financial Settlement
*   **Context:** A complex sales-to-cash workflow for a global enterprise.
*   **Connectors:** Salesforce, Gmail, DocuSign, QuickBooks, Stripe, Slack, Zendesk.
*   **Workflow:** 
    1.  `salesforce-lead-detect` -> `gmail-lookup-history` -> `nexus-pii-scrub` 
    2.  `docusign-contract-gen` -> `slack-legal-approval` -> `docusign-send-envelope` 
    3.  `stripe-payment-verify` -> `quickbooks-invoice-sync` -> `zendesk-provision-account` 
    4.  `slack-revenue-alert`.
*   **Risk Profile:** High financial and legal risk.
*   **Unique Failures:** "Applied incorrect tax jurisdiction in QuickBooks", "DocuSign sent to personal email instead of corporate", "Stripe payment marked as failed due to outdated webhook".

### Mega-Scenario 2: Autonomous Engineering & SecOps (DevOps Loop)
*   **Context:** An AI agent managing the full software development lifecycle and incident response.
*   **Connectors:** GitHub, Jira, AWS (S3/EC2/IAM), Sentry, PagerDuty, Slack, Vercel.
*   **Workflow:**
    1.  `sentry-error-capture` -> `jira-issue-triage` -> `github-repo-read` 
    2.  `nexus-security-scan` -> `github-pr-create` -> `aws-iam-role-check`
    3.  `vercel-deploy-preview` -> `slack-eng-notify` -> `github-merge-pr`
    4.  `aws-s3-backup-sync`.
*   **Risk Profile:** High infrastructure and security risk.
*   **Unique Failures:** "Sentry alert triggered recursive Jira ticket creation", "Deleted AWS IAM role instead of updating it", "Exposed internal API keys in GitHub PR comment".

### Mega-Scenario 3: Global HR & Compliance Onboarding
*   **Context:** Onboarding a new employee across multiple global systems while maintaining privacy.
*   **Connectors:** Workday, Greenhouse, ADP, SharePoint, Outlook, Zoom, 1Password.
*   **Workflow:**
    1.  `greenhouse-candidate-export` -> `workday-profile-init` -> `nexus-identity-verify`
    2.  `adp-payroll-setup` -> `sharepoint-folder-provision` -> `outlook-invite-gen`
    3.  `zoom-meeting-schedule` -> `1password-vault-grant` -> `slack-welcome-message`.
*   **Risk Profile:** High PII and access control risk.
*   **Unique Failures:** "Salary data uploaded to public SharePoint folder", "Provisioned 1Password vault to wrong user", "Workday profile created with incorrect SSN due to parsing error".

---

## 2. Technical Architecture Expansion

### Phase 1: Massive Node Template Library (`src/simulation/graph.ts`)
*   Add 40+ new node templates covering all Civic categories:
    *   **CRM:** `salesforce`, `hubspot`, `pipedrive`, `intercom`.
    *   **Dev:** `github`, `gitlab`, `aws-s3`, `aws-ec2`, `vercel`, `sentry`, `pagerduty`, `linear`.
    *   **Finance:** `quickbooks`, `stripe`, `xero`, `bill-com`.
    *   **Prod:** `gmail`, `outlook`, `google-sheets`, `notion`, `airtable`, `docusign`.
    *   **Security:** `nexus-auth`, `nexus-pii-scrub`, `okta`, `1password`.

### Phase 2: Scenario-Aware Graph Construction
*   Update `buildGraph` to support "Mega-Scenarios" with custom topology:
    *   Nodes will be arranged in **linear stages** or **branching trees** rather than just clusters.
    *   Introduce "Interconnected Workflows" where Scenario A can have cross-links to Scenario B nodes (e.g., Finance syncs with Engineering via Jira).

### Phase 3: Personalized Failure Logic 2.0 (`src/simulation/failure.ts`)
*   **Node-Specific Messages:** Every one of the 40+ new nodes gets a tailored list of 5-10 failures across Tiers 1-4.
*   **Contextual Weighting:** Critical nodes (e.g., `aws-iam-role-check`) have a higher probability of Tier 3/4 failures compared to safe nodes (e.g., `slack-notify`).
*   **Non-Repetition Engine:** The `usedMessages` set will now be persisted per session to ensure a "no-repeat" experience for the user.

### Phase 4: Dynamic UI Controls (`src/ui/controls.ts`)
*   **Scenario Selector:** Dropdown to switch between "Financial", "Engineering", "HR", and a "Global Nexus" (all nodes).
*   **Complexity Slider:** Controls the number of intermediate "processing" nodes spawned within a scenario.
*   **Live Event Feed:** Highlighting the specific connector icon in the event log.

---

## 3. Implementation Roadmap

1.  **Task 1: The Connector Library** - Populate `src/config.ts` with 40+ connectors and their metadata (icons, risk, base messages).
2.  **Task 2: Mega-Scenario Definitions** - Hardcode the topology for the 3 Mega-Scenarios in a new `src/simulation/scenarios.ts`.
3.  **Task 3: Failure Mapping** - Write the personalized failure strings for every new node.
4.  **Task 4: Integration & UI** - Wire the scenario selector to the simulation state and renderer.
5.  **Task 5: Verification** - Ensure that even with 50+ nodes, the simulation remains performant and visually distinct.
