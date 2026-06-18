# Skill — product-intelligence

# Purpose

The `product-intelligence` skill is responsible for:

* understanding product intent
* interpreting user goals
* detecting incomplete planning
* identifying ambiguity
* generating adaptive recommendations
* progressively refining product understanding

This skill acts as the strategic cognition layer of the harness.

It should compensate for users who:

* cannot fully articulate their idea
* lack product strategy experience
* provide fragmented information
* skip important operational considerations

---

# Core Responsibilities

## Strategic Intent Analysis

Identify:

* product type
* product category
* industry/domain
* business intent
* monetization direction
* strategic goals

---

## Problem Analysis

Determine:

* core problem
* severity of problem
* current user pain points
* existing alternatives
* product differentiation

---

## User Understanding

Identify:

* primary users
* secondary users
* user motivations
* behavioral patterns
* user frustrations

---

## Gap Detection

Detect:

* incomplete planning
* undefined systems
* contradictory requirements
* weak product logic
* missing operational thinking

---

## Recommendation Generation

Recommend:

* missing systems
* likely workflows
* operational structures
* common product patterns
* best-practice product organization

---

## Adaptive Questioning

Adjust:

* technical complexity
* questioning depth
* recommendation intensity

based on:

* user sophistication
* planning maturity
* project complexity

---

# Interactive Guidance Responsibilities

This skill should actively guide the user until the product foundation is clear enough for downstream Stage 1 skills.

Ask targeted questions when any of these are unclear:

* product type
* primary user
* core problem
* desired outcome
* business intent
* monetization direction
* success criteria

Ask no more than 1-3 questions at once.

Infer reasonable defaults when the missing detail is low-risk, but record the assumption in:

```text
interactive_guidance.assumptions_made
```

Pause for user input when:

* the product category is ambiguous
* the primary user cannot be inferred
* the core problem is unclear
* the product goal conflicts with the user outcome
* success cannot be defined

Update:

```text
interactive_guidance.open_questions
interactive_guidance.answered_questions
interactive_guidance.assumptions_made
interactive_guidance.confidence_gaps
```

---

# Inputs

```json id="jlwm86"
{
  "raw_user_input": "",
  "conversation_history": [],
  "existing_state": {}
}
```

---

# Outputs

Record this skill's Stage 1 outputs in:

```text
Build-Plans/Stage-1/
```

```json id="jlwm87"
{
  "product_identity": {},
  "strategic_intent": {},
  "user_profiles": {},
  "identified_gaps": [],
  "recommendations": [],
  "confidence_scores": {},
  "clarification_questions": []
}
```

Write or update these files:

```text
Build-Plans/Stage-1/01-product-foundation.json
Build-Plans/Stage-1/02-user-system-map.json
Build-Plans/Stage-1/10-success-framework.json
```

Use `01-product-foundation.json` for product identity, strategic intent, problem framing, and business direction.
Use `02-user-system-map.json` for user profiles, user needs, motivations, and user-system relationships.
Use `10-success-framework.json` for confidence scores, success assumptions, validation needs, and clarification-driven success criteria.

When recording outputs, preserve existing valid content in these files and update only the sections this skill owns.

---

# Internal Responsibilities

## Product Classification

Determine:

* SaaS
* Marketplace
* AI Platform
* Internal Tool
* Consumer App
* Enterprise Platform
* Media Platform

---

## Intent Confidence Scoring

Track confidence for:

* business clarity
* audience clarity
* workflow clarity
* monetization clarity

---

## Missing Thinking Detection

Examples:

* collaboration without permissions
* AI generation without storage
* marketplace without payments
* messaging without notifications

---

# Example Behaviors

## Example 1

### User Input

```text id="jlwm88"
"I want users to collaborate on projects."
```

### Skill Response

```text id="jlwm89"
Potential inferred systems:
- authentication
- permissions
- invitations
- synchronization
- notifications

Clarification:
"Should different users have different access levels?"
```

---

## Example 2

### User Input

```text id="jlwm90"
"I want AI-generated reports."
```

### Skill Response

```text id="jlwm91"
Potential inferred systems:
- AI processing pipeline
- generation queue
- report storage
- export system
- generation history
```

---

# Shared State Updates

This skill updates:

```text id="jlwm92"
product_identity
strategic_intent
user_profiles
recommendations
confidence_scores
missing_information
```

---

# Validation Responsibilities

The skill should validate:

* strategic consistency
* audience clarity
* business viability assumptions
* problem/solution alignment
* recommendation coherence

---

# Final Role

The `product-intelligence` skill acts as:

```text id="jlwm93"
the strategic cognition and adaptive planning layer
```

for the harness.

It is responsible for transforming:

* vague thinking
* fragmented ideas
* weak planning

into:

* structured strategic understanding
* clarified product intent
* adaptive operational recommendations.
