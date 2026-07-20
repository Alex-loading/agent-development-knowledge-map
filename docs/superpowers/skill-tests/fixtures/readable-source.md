# Fixture Official Guide: Deterministic Tool Loops

Provenance: Example Standards Team official engineering guide, version 1.0, published 2026-07-20.

A deterministic tool loop has four required stages: accept a typed request, execute one allowlisted tool, validate the tool result against an explicit schema, and stop with either `done` or `blocked`. The host program owns tool execution and the stop decision; the model may prepare arguments but cannot bypass the allowlist or result validator.

Use this decision rule: choose a deterministic loop when the route is known in advance and every output can be checked by code. Choose a model-directed agent only when observations can change the next action and that flexibility creates measurable value. A chat interface or a tool call alone does not make a system an agent.

Worked example: a weather lookup accepts a city, invokes one approved weather tool, validates that temperature and timestamp are present, and returns `done`. If the tool omits the timestamp, validation fails and the loop returns `blocked` without inventing a value.

Limit: this guide defines the fixture loop and selection rule only. It does not establish performance claims for any model or framework.
