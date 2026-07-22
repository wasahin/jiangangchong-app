---
name: dynamic-ui
description: Show visual content inline alongside your text response — diagrams, charts, interactive demos, comparisons. Use only when a compact visual makes the answer clearer. Not for websites, apps, reports, dashboards, or slides.
---

# Dynamic UI

## Description

Show visual content inline alongside text responses — diagrams, charts, interactive demos, comparisons.

## When to Use

Use when a compact visual makes the answer clearer. Not for websites, apps, reports, dashboards, or slides.

## Visual Types

### Diagrams
- Flowcharts for processes and workflows
- Architecture diagrams for system design
- Sequence diagrams for API interactions
- ER diagrams for data models
- State machines for order/status flows

### Charts
- Bar charts for comparisons
- Line charts for trends over time
- Pie/donut charts for proportions
- Scatter plots for correlations

### Interactive Demos
- Form prototypes
- Comparison tables
- Before/after sliders
- Configurators

## Design Guidelines

- Use SVG for scalable, crisp visuals
- Keep colors consistent with a defined palette
- Ensure labels are readable and concise
- For Chinese content, use `Noto Sans CJK SC` or `WenQuanYi Micro Hei`

## Output Format

- Inline SVGs rendered directly in the chat
- HTML widgets for interactive content
- No external dependencies or CDN links
