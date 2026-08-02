# Tutorial: Your First Blog Post

Learn the complete editorial workflow by creating, submitting, and publishing your first blog post.

---

## What You'll Learn

- How to create a blog post as an Author
- How to use the markdown editor
- How to submit posts for review
- How to review and approve posts as an Editor
- How to publish posts

**Time:** 15 minutes

---

## Prerequisites

- Alif Pustaka installed and running
- Super Admin account access
- Basic understanding of markdown

---

## Step 1: Create Test Users

First, create two test users to demonstrate the workflow.

### 1.1 Login as Super Admin

Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)

```
Email: superadmin@alifpustaka.web.id
Password: [Your SUPERADMIN_PASSWORD]
```

### 1.2 Create an Author Account

1. Go to **User Management** at `/admin/users`
2. Click **Create User** (or create via signup page)
3. Fill in details:
   - Name: `Jane Author`
   - Email: `author@test.local`
   - Username: `janeauthor`
   - Role: **Author**
   - Status: **Active**
4. Set a password and save

### 1.3 Create an Editor Account

1. Repeat the process
2. Fill in details:
   - Name: `John Editor`
   - Email: `editor@test.local`
   - Username: `johneditor`
   - Role: **Editor**
   - Status: **Active**
3. Set a password and save

---

## Step 2: Write Your First Post (As Author)

### 2.1 Login as Author

Logout from Super Admin and login as:

```
Email: author@test.local
Password: [Password you set]
```

### 2.2 Navigate to Post Editor

Go to `/posts/editor` or click **Create Post** from the dashboard.

### 2.3 Write Your Post

Fill in the post details:

**Title:**
```
Getting Started with Alif Pustaka
```

**Slug:**
```
getting-started-with-alif-pustaka
```

**Excerpt:**
```
Learn how to use the Alif Pustaka CMS to create and publish content with our comprehensive editorial workflow.
```

**Content:**
```markdown
# Welcome to Alif Pustaka

Alif Pustaka is a modern content management system built with Next.js.

## Key Features

- **Role-Based Access Control** - 8-tier role system
- **Editorial Workflow** - Draft → Submit → Review → Publish
- **Rich Editor** - Markdown support with live preview

## Getting Started

Creating content is easy:

1. Write your content in markdown
2. Preview it in real-time
3. Submit for review
4. Wait for approval
5. Your content goes live!

## Code Example

```javascript
const greeting = "Hello, Alif Pustaka!";
console.log(greeting);
```

## Conclusion

Start creating amazing content today!
```

**Tags:**
```
tutorial, getting-started, cms
```

### 2.4 Save as Draft

1. Click **Save as Draft**
2. Verify the success message appears
3. Your post is now in "draft" status

---

## Step 3: Submit for Review

### 3.1 Review Your Draft

1. Go to `/posts` to see your posts list
2. Find your draft post
3. Click **Edit** to open it

### 3.2 Submit

1. Click **Submit for Review** button
2. Confirm the submission
3. Status changes from "draft" to "pending"
4. A notification is sent to Editors

**Note:** Once submitted, you cannot edit the post until it's reviewed.

---

## Step 4: Review the Post (As Editor)

### 4.1 Switch to Editor Account

Logout and login as:

```
Email: editor@test.local
Password: [Password you set]
```

### 4.2 Navigate to Review Queue

1. Go to `/admin/posts` (Admin Posts Management)
2. Filter by status: **Pending**
3. You should see "Getting Started with Alif Pustaka"

### 4.3 Review the Post

1. Click **Review** on the post
2. Read through the content
3. Check for:
   - Grammar and spelling
   - Formatting issues
   - Content quality
   - Image placement (if any)

### 4.4 Approve the Post

1. Scroll to the bottom
2. Add an optional review note:
   ```
   Great first post! Content is clear and well-structured.
   ```
3. Click **Approve**
4. Post status changes to "published"
5. Author receives a notification

**Alternative:** If issues found, click **Reject** with feedback. The post returns to "draft" status.

---

## Step 5: View Published Post

### 5.1 Visit Public Blog

Navigate to:
```
http://localhost:3000/blog/getting-started-with-alif-pustaka
```

Your post is now live and visible to the public!

### 5.2 Verify Features

Check that the following work:

- ✅ Markdown renders correctly
- ✅ Code blocks have syntax highlighting
- ✅ Headings generate table of contents
- ✅ Scroll progress indicator appears
- ✅ Share buttons work
- ✅ Post metadata (author, date) displays

---

## Step 6: Edit a Published Post (As Author)

### 6.1 Return to Author Account

Login back as `author@test.local`

### 6.2 Edit Published Post

1. Go to `/posts`
2. Click **Edit** on your published post
3. Make a change (e.g., add a paragraph):
   ```markdown
   ## Update
   
   This section was added after publication to demonstrate editing.
   ```
4. Click **Save Changes**

**Note:** Editing a published post changes status back to "draft". You must resubmit for review.

### 6.3 Resubmit

1. Click **Submit for Review**
2. Editor will need to review again
3. After approval, changes go live

---

## What You've Learned

✅ Created author and editor accounts  
✅ Used the markdown editor  
✅ Saved drafts and submitted for review  
✅ Reviewed and approved posts as an editor  
✅ Published content to the public blog  
✅ Edited and resubmitted published content  

---

## Understanding the Workflow

```
┌─────────┐
│  Draft  │ ← Author creates and edits
└────┬────┘
     │ Submit for Review
     ↓
┌─────────┐
│ Pending │ ← Waiting for editor
└────┬────┘
     │ Editor Reviews
     ↓
┌──────────────┬──────────┐
│  Approved    │ Rejected │
│  (Published) │ (Draft)  │
└──────────────┴──────────┘
```

---

## Role Permissions Summary

| Action | Author | Editor | Content Admin |
|--------|--------|--------|---------------|
| Create draft | ✅ | ✅ | ✅ |
| Submit for review | ✅ | ✅ | ✅ |
| Review posts | ❌ | ✅ | ✅ |
| Publish directly | ❌ | ✅ | ✅ |
| Delete posts | Own only | ✅ | ✅ |

**Special Rule:** Editors cannot review Content Admin posts (hierarchy).

---

## Next Steps

- **[Managing Users Tutorial](./managing-users-tutorial.md)** - Learn user administration
- **[Setting Up OAuth Tutorial](./setting-up-oauth.md)** - Add social login
- **[Blog Management Guide](../guides/administration/blog-management.md)** - Advanced blog features
- **[RBAC System Explanation](../explanation/features/rbac-system.md)** - Understand permissions

---

## Troubleshooting

**Can't submit for review?**
- Ensure all required fields are filled
- Check that status is "draft"

**Editor can't see post?**
- Verify post status is "pending"
- Check editor has "review_posts" permission

**Post not appearing on public blog?**
- Confirm status is "published"
- Check slug is correct in URL
- Clear browser cache

---

**Last Updated:** 2026-08-01
