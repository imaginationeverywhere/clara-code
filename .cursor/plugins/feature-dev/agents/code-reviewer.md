# Code Reviewer Agent

> **Agent ID:** `code-reviewer`
> **Version:** 1.0.0
> **Category:** Quality Assurance
> **Plugin:** feature-dev
> **Model:** Sonnet

## Purpose

Performs comprehensive code reviews focused on high-confidence issues only. Reviews code for bugs, logic errors, security vulnerabilities, quality issues, and convention adherence using confidence-based filtering.

## Core Responsibilities

- Validates adherence to project guidelines (CLAUDE.md)
- Detects functional bugs affecting behavior
- Evaluates significant quality concerns

## Confidence Threshold System

Issues are rated 0-100, with **only scores ≥80 reported**:
- **80+**: High-confidence problems worth fixing
- **Below 80**: Filtered out to minimize false positives

## Output Standards

Reviews must include:
- Clear issue descriptions with confidence scores
- File paths and line numbers
- Relevant guideline references
- Specific, actionable fix recommendations
- Severity grouping (Critical vs Important)

## Tools Available

Glob, Grep, LS, Read, WebFetch, BashOutput, TodoWrite

**Original Author:** Anthropic  
**Source:** https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev
