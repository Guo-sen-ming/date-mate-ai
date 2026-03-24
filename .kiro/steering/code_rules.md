---
inclusion: always
---

# Project Rules

## Language Rules
- All planning documents, README, TODOLIST, and other markdown files should be written in Chinese
- All code comments (JS, CSS, HTML, Java, etc.) MUST be written in English only
- No Chinese characters allowed in any code comments

## Code Style
- Follow consistent code formatting across the project
- Use meaningful variable and function names in English
- Keep code comments concise and descriptive
- Do NOT use inline styles in JSX. Use SASS module files instead
- Use SASS (.scss) for all styling, NOT Tailwind CSS
- Each component/page should have its own .module.scss file

## UI & Design Rules
- Mobile-first design: all pages and components must prioritize mobile layout
- Use responsive design with media queries in SASS
- Use Radix UI (https://www.radix-ui.com/) as the primary component library for buttons, dialogs, dropdowns, and other interactive elements
- Prefer Radix UI primitives over custom implementations for accessibility and consistency
- Test all layouts at 375px (mobile), 768px (tablet), and 1024px+ (desktop) widths
- All buttons must have a max-width of 300px
- Do NOT hardcode `color` prop on Radix UI `<Button>`. Let buttons inherit the theme's `accentColor` so they follow the gender-based theme automatically
- Prefer Radix UI components over native HTML elements (e.g., use Radix `Select` instead of native `<select>`, Radix `TextArea` instead of native `<textarea>`)
- All avatars should use square shape (border-radius: $radius-sm) by default unless explicitly specified otherwise

## Git Branch Rules
- Do NOT write code directly on the main branch
- Create a new feature branch for each major feature
- Branch naming: camelCase, prefixed with "self" (e.g., selfLogin, selfRegister, selfDiscover)
- Merge back to main only after feature is complete and tested
- 以后创建新的分支都要遵循下面的规则：
# 1. 确保本地代码是最新的
git pull
# 2. 基于当前分支创建新分支
git checkout -b new-branch-name
# 3. 推送到远程并设置跟踪关系
git push -u origin new-branch-name

## Git Commit Rules
- Do NOT auto-commit code. Let the user commit manually
- Only provide commit messages as suggestions when asked
