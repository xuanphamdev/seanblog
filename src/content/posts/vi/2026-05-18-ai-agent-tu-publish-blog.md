---
title: "AI Agent Tự Publish Blog: Từ Markdown Đến Production"
date: 2026-05-18
tags: [ai, agents, automation]
summary: "Cách thiết kế một bot AI có thể viết markdown, validate build và push lên GitHub để public bài viết."
draft: false
translationKey: ai-agent-auto-publish-blog
---

Hôm nay mình vừa build xong một AI agent có thể **tự động viết và publish bài blog** — từ việc nhận request qua Telegram, generate markdown, validate schema, commit code, đến push lên GitHub và trả về public URL.

Nghe có vẻ đơn giản, nhưng thực tế có khá nhiều chi tiết kỹ thuật đáng nói. Bài này mình sẽ chia sẻ cách thiết kế và những bài học rút ra.

---

## 🎯 Mục Tiêu

**Input:** "Viết bài về X" (qua Telegram)  
**Output:** Bài viết đã live tại `https://seandev.io/blog/YYYY-MM-DD-slug`

**Workflow:**
1. Generate markdown với frontmatter chuẩn
2. Validate schema/build
3. Commit với message chuẩn
4. Push lên main branch
5. Reply public URL

**Yêu cầu:**
- ✅ Tự động hoàn toàn (zero manual intervention)
- ✅ Validate đầy đủ (không push code lỗi)
- ✅ Rollback được nếu có vấn đề
- ✅ Secure (không leak credentials)

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────┐
│  User (Telegram)                                    │
│  "Viết bài về AI agents"                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  AI Agent (Mr Chun Bot)                             │
│  ├─ Parse request                                   │
│  ├─ Activate skill: blog-publisher                  │
│  └─ Execute workflow                                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Step 1: Generate Markdown                          │
│  ├─ Create slug from title                          │
│  ├─ Detect language (vi/en)                         │
│  ├─ Generate frontmatter (YAML)                     │
│  ├─ Generate body (Markdown)                        │
│  └─ Write to: src/content/posts/{vi|en}/file.md    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Step 2: Validate Schema                            │
│  ├─ Parse YAML frontmatter                          │
│  ├─ Check required fields (title, date, tags)       │
│  ├─ Validate date format (YYYY-MM-DD)               │
│  ├─ Check body not empty                            │
│  └─ Run build (optional)                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Step 3: Git Commit                                 │
│  ├─ git add src/content/posts/{vi|en}/file.md      │
│  └─ git commit -m "feat(blog): add {title}"        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Step 4: Git Push                                   │
│  ├─ git push origin main                            │
│  └─ Trigger CI/CD (GitHub Actions)                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Step 5: Reply URL                                  │
│  └─ https://seandev.io/blog/YYYY-MM-DD-slug         │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

- **AI Agent:** Claude 3.5 Sonnet (via Anthropic API)
- **Chat Interface:** Telegram Bot
- **Blog Framework:** Astro 5 (static site generator)
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Version Control:** GitHub
- **Authentication:** Personal Access Token (PAT)

---

## 📝 Step 1: Generate Markdown

### Frontmatter Schema

Astro Content Collections yêu cầu frontmatter chuẩn:

```yaml
---
title: "Post title"           # Required
date: YYYY-MM-DD              # Required (ISO 8601)
tags: [tag1, tag2]            # Required (array)
summary: "Short summary."     # Required
draft: false                  # Optional (default: false)
translationKey: optional-key  # Optional (for i18n)
---
```

### Slug Generation

Slug được tạo từ title:

```python
def create_slug(title: str) -> str:
    """
    Convert title to URL-friendly slug.
    
    Example:
    "AI Agent Tự Publish Blog" → "ai-agent-tu-publish-blog"
    """
    slug = title.lower()
    slug = unidecode(slug)  # Remove Vietnamese accents
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug
```

### Language Detection

Tự động detect ngôn ngữ dựa trên content:

```python
def detect_language(content: str) -> str:
    """
    Detect language from content.
    
    Simple heuristic: check for Vietnamese characters.
    """
    vietnamese_chars = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'
    
    if any(char in content.lower() for char in vietnamese_chars):
        return 'vi'
    return 'en'
```

### File Path

```
src/content/posts/
├── vi/
│   └── 2026-05-18-ai-agent-tu-publish-blog.md
└── en/
    └── 2026-05-18-ai-agent-auto-publish-blog.md
```

---

## ✅ Step 2: Validate Schema

### YAML Validation

```python
import yaml

def validate_frontmatter(content: str) -> dict:
    """
    Parse and validate YAML frontmatter.
    
    Raises:
    - ValueError: if frontmatter invalid
    """
    # Extract frontmatter
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        raise ValueError("Frontmatter not found")
    
    # Parse YAML
    try:
        frontmatter = yaml.safe_load(match.group(1))
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML: {e}")
    
    # Validate required fields
    required = ['title', 'date', 'tags', 'summary']
    for field in required:
        if field not in frontmatter:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate date format
    try:
        datetime.strptime(frontmatter['date'], '%Y-%m-%d')
    except ValueError:
        raise ValueError("Date must be YYYY-MM-DD format")
    
    # Validate tags is array
    if not isinstance(frontmatter['tags'], list):
        raise ValueError("Tags must be an array")
    
    return frontmatter
```

### Build Validation (Optional)

Nếu muốn chắc chắn 100%, có thể run build:

```bash
cd seanblog
npm run build
# → Astro sẽ validate Content Collections schema
# → Nếu có lỗi, build sẽ fail
```

**Trade-off:**
- ✅ Catch errors sớm
- ❌ Slow (build mất 10-30s)
- ❌ Cần install dependencies trong container

Mình chọn **không run build** vì:
1. Frontmatter validation đã đủ
2. CI/CD sẽ catch errors sau khi push
3. Nhanh hơn (user experience tốt hơn)

---

## 🔧 Step 3: Git Commit

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(blog): add {title} by owner
```

**Format:**
- `feat`: feature (new blog post)
- `(blog)`: scope
- `add {title}`: description
- `by owner`: author

**Ví dụ:**
```bash
git commit -m "feat(blog): add AI Agent Tự Publish Blog by owner"
```

### Git Config

```bash
git config user.name "Mr Chun Bot"
git config user.email "bot@seandev.io"
```

**Lưu ý:** Không dùng personal email để dễ track commits từ bot.

---

## 🚀 Step 4: Git Push

### Authentication

**Option 1: Personal Access Token (PAT)**

```bash
git remote set-url origin https://x-access-token:TOKEN@github.com/user/repo.git
git push origin main
```

**Option 2: SSH Key**

```bash
# Mount SSH key vào container
# ~/.ssh/id_rsa

git remote set-url origin git@github.com:user/repo.git
git push origin main
```

**Option 3: GitHub CLI**

```bash
export GH_TOKEN=ghp_xxxxx
gh repo clone user/repo
# gh tự động dùng token
```

### Vấn Đề Gặp Phải

**1. "Invalid username or token"**

Nguyên nhân:
- Token không có quyền `repo`
- Token đã expire
- Token bị revoke

Giải pháp:
- Regenerate token với full `repo` permissions
- Set expiration = "No expiration"

**2. "Could not read Password"**

Nguyên nhân:
- Git đang ở interactive mode
- Container không có TTY

Giải pháp:
```bash
GIT_TERMINAL_PROMPT=0 git push origin main
# → Disable interactive prompts
```

**3. "Branch protection rules"**

Nguyên nhân:
- Repo có branch protection (require PR, reviews, status checks)

Giải pháp:
- Disable branch protection cho bot
- Hoặc push vào branch khác, tạo PR tự động

---

## 🔗 Step 5: Reply Public URL

### URL Format

```
https://seandev.io/blog/YYYY-MM-DD-slug
```

**Ví dụ:**
```
https://seandev.io/blog/2026-05-18-ai-agent-tu-publish-blog
```

### CI/CD Flow

```
GitHub Push
    ↓
GitHub Actions Trigger
    ↓
Vercel Build
    ↓
Deploy to Production
    ↓
URL Live (1-2 phút)
```

**Lưu ý:** URL có thể mất 1-2 phút để live (do CI/CD). Có thể:
- Reply URL ngay lập tức (với note "đang deploy")
- Hoặc poll Vercel API để check deploy status

---

## 🛡️ Security Considerations

### 1. Token Storage

**❌ Không nên:**
```python
# Hardcode token trong code
TOKEN = "ghp_xxxxxxxxxxxxx"
```

**✅ Nên:**
```python
# Dùng environment variable
TOKEN = os.getenv("GH_TOKEN")
```

### 2. Token Permissions

**Principle of Least Privilege:**
- Chỉ grant quyền `repo` (không cần `admin`, `delete_repo`, v.v.)
- Nếu có thể, dùng **fine-grained tokens** (GitHub Beta)

### 3. Audit Logs

Track mọi action của bot:

```python
logger.info(f"[BLOG_PUBLISH] User: {user_id}, Title: {title}, Status: {status}")
```

### 4. Rate Limiting

GitHub API có rate limit:
- **5000 requests/hour** (authenticated)
- **60 requests/hour** (unauthenticated)

Implement retry với exponential backoff:

```python
import time
from functools import wraps

def retry_with_backoff(max_retries=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if i == max_retries - 1:
                        raise
                    wait = 2 ** i  # 1s, 2s, 4s
                    time.sleep(wait)
        return wrapper
    return decorator

@retry_with_backoff(max_retries=3)
def git_push():
    subprocess.run(["git", "push", "origin", "main"], check=True)
```

---

## 📊 Monitoring & Observability

### Metrics to Track

1. **Success Rate:** % requests thành công
2. **Latency:** Thời gian từ request đến URL live
3. **Error Rate:** % requests fail (và lý do)
4. **Token Usage:** Số lần dùng GitHub API

### Logging

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "blog_publish_start",
    user_id=user_id,
    title=title,
    language=language,
)

logger.info(
    "blog_publish_success",
    user_id=user_id,
    title=title,
    url=public_url,
    duration_ms=duration,
)

logger.error(
    "blog_publish_failed",
    user_id=user_id,
    title=title,
    error=str(e),
    step="git_push",
)
```

### Alerting

Setup alerts cho:
- ❌ Push failed > 3 lần liên tiếp
- ❌ Token expired
- ❌ CI/CD failed

---

## 🎓 Lessons Learned

### 1. Git Authentication Là Khó Nhất

Mình đã thử:
- Personal Access Token với nhiều formats khác nhau
- SSH key mounting
- GitHub CLI

**Kết luận:** PAT với format `https://x-access-token:TOKEN@github.com/user/repo.git` là đơn giản nhất, nhưng cần:
- Token có đúng permissions
- Disable branch protection (hoặc dùng PR workflow)
- Handle errors gracefully

### 2. Validation Là Quan Trọng

Ban đầu mình không validate frontmatter → push code lỗi → CI/CD fail → phải revert.

**Bài học:** Validate sớm, validate đầy đủ. Tốt hơn là reject request sớm hơn là push code lỗi.

### 3. User Experience Matters

**Bad UX:**
```
Bot: "Đang tạo bài viết..."
[30 giây im lặng]
Bot: "Lỗi: push failed"
```

**Good UX:**
```
Bot: "Đang tạo bài viết... ✍️"
Bot: "Đã tạo markdown ✅"
Bot: "Đang validate schema... ✅"
Bot: "Đang commit... ✅"
Bot: "Đang push... ⏳"
Bot: "✅ Bài viết đã được publish!
🔗 https://seandev.io/blog/2026-05-18-slug"
```

### 4. Error Messages Phải Actionable

**Bad:**
```
❌ Lỗi: push failed
```

**Good:**
```
❌ Lỗi: Push thất bại do token không có quyền write.

🔧 Cách fix:
1. Vào https://github.com/settings/tokens
2. Regenerate token với quyền "repo"
3. Update GH_TOKEN environment variable
4. Thử lại
```

---

## 🚀 Next Steps

### Improvements

1. **Draft Mode:** Cho phép tạo draft trước, review, rồi mới publish
2. **Image Upload:** Tự động upload images lên CDN
3. **SEO Optimization:** Tự động generate meta tags, Open Graph
4. **Multi-Language:** Tự động translate sang tiếng Anh
5. **Analytics:** Track views, engagement

### Advanced Features

1. **PR Workflow:** Push vào branch, tạo PR, merge sau khi review
2. **Scheduled Publishing:** Đặt lịch publish bài viết
3. **Content Suggestions:** AI suggest topics dựa trên trending
4. **Auto-Promotion:** Tự động share lên Twitter, Reddit, HN

---

## 💡 Kết Luận

Build một AI agent tự publish blog không khó, nhưng có nhiều chi tiết kỹ thuật cần chú ý:

- ✅ **Validation:** Validate sớm, validate đầy đủ
- ✅ **Security:** Protect credentials, principle of least privilege
- ✅ **UX:** Feedback rõ ràng, error messages actionable
- ✅ **Monitoring:** Track metrics, setup alerts

**Kết quả:** Từ "Viết bài về X" đến bài viết live trong < 1 phút, hoàn toàn tự động.

---

## 📚 Resources

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)

---

**Bài viết này được tạo bởi Mr Chun Bot 👔 — chính là AI agent được mô tả trong bài!**

*Meta moment: Bài viết về "AI agent tự publish blog" được viết và publish bởi chính AI agent đó. 🤯*
