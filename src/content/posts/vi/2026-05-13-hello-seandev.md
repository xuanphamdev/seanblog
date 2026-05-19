---
title: "Xin chào, Seandev"
date: 2026-05-13
tags: [meta, intro, astro]
summary: "Bài viết đầu tiên trên Seandev — về lý do mình bắt đầu blog này, và những thứ định viết về."
draft: false
translationKey: hello-seandev-2026-05
---

Mình từng nghĩ blog là chuyện của những người **đã biết**. Hóa ra blog hợp với những người **đang học** hơn — vì viết là cách rõ ràng nhất để biết mình hiểu cái gì và không hiểu cái gì.[^1]

Đó là lý do mình mở Seandev. Không có roadmap. Không có chiến lược content. Chỉ là một chỗ để ghi lại — bằng tiếng Việt và tiếng Anh — những thứ mình đang học khi làm việc với Rust, AI agents và các hệ thống phân tán.[^2]

[^1]: Câu này không phải của mình — nó là biến tấu của một quote nổi tiếng: *"Writing is thinking. To write well is to think clearly."*

[^2]: "Phân tán" ở đây không nhất thiết phải là Kubernetes-scale. Một con web scraper chạy trên 2 machines cũng đã đụng đến vấn đề distributed.

## Vì sao lại là Astro?

Mình thử qua khá nhiều static site generator. Jekyll thì cổ. Hugo nhanh nhưng template DSL khó tùy biến UI cho ra hồn. Next.js thì over-engineered cho một blog cá nhân.

Astro hay ở chỗ: nó **mặc định không ship JavaScript**. Mỗi page là HTML tĩnh, nhanh, accessible. Nếu cần JS thì opt-in từng component qua "islands". Một blog đọc bài thì hầu như không cần JS — toggle theme và search là đủ.

Cộng với Content Collections (type-safe markdown), MDX support, native i18n routing — Astro 5 cho mình mọi thứ cần với cấu hình tối thiểu.

## Stack hiện tại

Phần kỹ thuật mình muốn ghi lại để sau này nhớ:

- **Astro 5** với Content Collections + MDX
- **Tailwind v4** (CSS-first config) + design tokens dùng `oklch()`
- **Shiki dual-theme** thông qua `astro-expressive-code`
- **Pagefind** cho static search (offline-friendly, không cần backend)
- **GitHub Pages** hosting, deploy qua `git push`

```ts title="src/content.config.ts"
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    draft: z.boolean().default(false),
    translationKey: z.string().optional(),
  }),
});

export const collections = { posts };
```

Đây là schema cho posts. Zod validate frontmatter tại build time — viết sai field gì là báo lỗi ngay, không phải đợi runtime.

## Editorial Terminal — design direction

Mình muốn blog vừa **dễ đọc** vừa có **tính cách**. Phần lớn dev blog rơi vào 1 trong 2 thái cực: hoặc quá nghiêm túc kiểu corporate (Linear), hoặc quá hacker neon (Fly.io). Cả hai đều ổn nhưng đều thiếu cái gì đó.

Direction mình chọn — gọi là "Editorial Terminal":

- Typography: serif (Fraunces) cho headlines + body, mono (JetBrains Mono) cho code và meta. Inter cho UI ngắn.
- Color: dark mặc định, accent là muted cyan (`oklch(72% 0.14 200)`). Mọi token định nghĩa qua `oklch()` cho perceptual uniformity.
- Layout: single column 680px, không sidebar, không card box. Bài viết flow như editorial.
- Signature: terminal "now" status line trên đầu homepage. Mono. Subtle blinking caret.

Mọi quyết định đều cố trả lời câu: "Reader đang đọc gì? Cái gì giúp họ đọc dễ hơn?". Decoration nào không phục vụ đọc thì bỏ.

## Sẽ viết về gì?

Vài chủ đề mình đang nghĩ tới:

1. **AI agents trong thực tế** — không phải hype, mà là những thứ mình build và xài thật
2. **Rust memory model** — `Pin`, `Send/Sync`, async runtime internals
3. **System design** từ góc nhìn người tự build tool cho cá nhân
4. **Notes về Claude Code** — workflows, hooks, custom skills
5. **Reading notes** — sách kỹ thuật mình đọc

Không hứa lịch đăng đều. Khi nào có gì đáng viết thì viết.

## Đóng góp

Source code blog này mở trên GitHub. Nếu bạn thấy lỗi typo, broken link, hoặc muốn thảo luận về một bài viết — mở issue hoặc PR. Mình đọc hết.

Còn lại, cảm ơn bạn đã ghé. Hẹn ở bài tiếp theo.
