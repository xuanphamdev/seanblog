---
title: "Ghi chú về Claude Code hooks"
date: 2026-05-10
tags: [claude, agents, notes]
summary: "Hooks là cách mạnh nhất để dạy Claude Code những thứ nó không tự biết. Vài pattern mình đang dùng."
draft: false
---

Claude Code có một system gọi là **hooks** — script chạy tự động trước/sau mỗi tool call. Nghe đơn giản nhưng đây là chỗ inject hành vi tùy chỉnh hiệu quả nhất.

## Bốn loại hook

Có 4 trigger chính: `PreToolUse`, `PostToolUse`, `Stop`, `UserPromptSubmit`. Trong đó `PreToolUse` là loại cứu mình nhiều nhất — nó có quyền **block** một tool call nếu trả về exit code 2.

Mình dùng nó để: ngăn việc đọc file `.env`, block các bash command nguy hiểm như `rm -rf`, và inject context cho từng tool gọi (CWD, current branch, project name).

## Ví dụ thực tế

```bash title="hooks/block-env.sh"
#!/usr/bin/env bash
# Block reads of any .env* file
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')
if [[ "$file" =~ \.env ]]; then
  echo "Blocked: $file may contain secrets" >&2
  exit 2
fi
```

Đặt vào `~/.claude/hooks/` và wire trong `settings.json` với matcher là `Read`. Claude bị chặn đọc env file mà không cần permission prompt.

## Lesson

Hook không phải nơi để viết logic phức tạp. Nó nên là: **một check nhanh, một block hoặc pass, log nếu cần**. Khi nào cảm thấy hook đang dài hơn 20 dòng, nó nên là một skill hoặc agent, không phải hook.

Hết.
