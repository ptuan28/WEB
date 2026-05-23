**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**


Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

# 🐔 The Chicken's Whisper

> Nền tảng hỏi đáp ẩn danh dành cho sinh viên Việt Nam

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [UML & Kiến trúc hệ thống](#-uml--kiến-trúc-hệ-thống)
- [UI/UX Flow](#-uiux-flow)
- [Bảo mật](#-bảo-mật)

---

## 🐔 Giới thiệu

**The Chicken's Whisper** là nền tảng hỏi đáp ẩn danh giúp sinh viên tự do đặt câu hỏi và chia sẻ kiến thức mà không lo lắng về danh tính. Người dùng có thể lọc câu hỏi theo trường, ngành, khóa và môn học.

---

## ✨ Tính năng

- 🙈 **Ẩn danh hoàn toàn** — danh tính được mã hóa thành nhân vật ngẫu nhiên
- ❓ **Đặt câu hỏi** — kèm ảnh, tag trường/ngành/khóa/môn
- 🧠 **Trả lời & Bình luận** — tương tác ẩn danh
- 🔔 **Thông báo real-time** — nhận thông báo khi có người trả lời
- 🚩 **Report nội dung** — tự động xóa khi đủ 5 report
- 📜 **Lịch sử cá nhân** — xem lại câu hỏi & câu trả lời của mình

---

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Các bước

```bash
# 1. Clone dự án
git clone <your-repo-url>
cd PROJECT

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_OWNER=your_app_owner
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

```bash
# 4. Chạy dev server
npm run dev
```

> 💡 Nếu gặp lỗi PowerShell khi chạy `npm install`, hãy mở PowerShell với quyền Admin và chạy:
> ```powershell
> Set-ExecutionPolicy RemoteSigned
> ```

---

## 📁 Cấu trúc dự án

```
PROJECT/
├── src/
│   ├── pages/
│   │   ├── Home.jsx              # Trang chủ - danh sách câu hỏi
│   │   ├── QuestionDetail.jsx    # Chi tiết câu hỏi + trả lời
│   │   └── MyHistory.jsx         # Lịch sử hoạt động
│   ├── components/
│   │   ├── AskQuestionModal.jsx  # Modal đặt câu hỏi
│   │   ├── QuestionCard.jsx      # Card câu hỏi
│   │   ├── AnswerCard.jsx        # Card câu trả lời
│   │   ├── CommentSection.jsx    # Phần bình luận
│   │   ├── FilterBar.jsx         # Thanh lọc/tìm kiếm
│   │   ├── NotificationBell.jsx  # Chuông thông báo
│   │   └── ImageCapture.jsx      # Chụp/tải ảnh
│   ├── lib/
│   │   ├── anonymousUser.js      # Tạo danh tính ẩn danh
│   │   ├── userHistory.js        # Lưu lịch sử localStorage
│   │   └── schoolData.js         # Dữ liệu trường/ngành VN
│   ├── entities/
│   │   ├── Question.json
│   │   ├── Answer.json
│   │   ├── Comment.json
│   │   └── Notification.json
│   └── api/
│       └── base44Client.js       # Khởi tạo Base44 SDK
├── .env                          # Biến môi trường (không commit)
├── .env.example
└── README.md
```

---

## 🗂️ UML & Kiến trúc hệ thống

### Entity Diagram

```
User (1) ──────────────────────────────────── (∞) Question
                                                      │
                                                      │ (1)
                                                      │
                                                     (∞)
                                                   Answer (1) ──── (∞) Comment
                                                      │
                                                      └──────────────▶ Notification
```

### Chi tiết Entity

| Entity       | Thuộc tính chính                                              |
|--------------|---------------------------------------------------------------|
| Question     | text, image_url, school, major, cohort, subject, report_count |
| Answer       | question_id, text, image_url, report_count                    |
| Comment      | answer_id, text, report_count                                 |
| Notification | user_email, type, question_id, message, read                  |

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│   Pages: Home │ QuestionDetail │ MyHistory              │
│                                                         │
│   Components: QuestionCard │ AnswerCard │ CommentSection │
│               FilterBar │ AskModal │ NotificationBell   │
│                                                         │
│   Libs: anonymousUser │ userHistory │ schoolData        │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / REST
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BASE44 BACKEND (BaaS)                   │
│                                                         │
│   Auth API │ Entity CRUD API │ Integrations API         │
│                                                         │
│   Database: Question │ Answer │ Comment │ Notification  │
│                                                         │
│   RLS: Row Level Security theo user.email & role        │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ UI/UX Flow

```
[Trang chủ /]
     ├──▶ Tìm kiếm / Lọc câu hỏi
     ├──▶ [Click câu hỏi] ──▶ /question/:id
     │         ├──▶ Xem câu trả lời
     │         ├──▶ Viết câu trả lời
     │         └──▶ Bình luận / Report
     ├──▶ [Hỏi ngay] ──▶ Modal đặt câu hỏi
     ├──▶ [🔔] ──▶ Dropdown thông báo
     └──▶ [Lịch sử] ──▶ /history
```

---

## 🔐 Bảo mật

| Thao tác           | Điều kiện                              |
|--------------------|----------------------------------------|
| Tạo câu hỏi/trả lời | Đã đăng nhập                          |
| Đọc Notification   | `user_email == user.email` hoặc admin  |
| Xóa Comment        | `created_by == user.email` hoặc admin  |
| Auto-xóa nội dung  | `report_count >= 5`                    |

---

## 🛠️ Tech Stack

| Layer     | Công nghệ                          |
|-----------|------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| UI        | shadcn/ui, Lucide React             |
| Backend   | Base44 BaaS                        |
| Auth      | Base44 Auth                        |
| Storage   | Base44 Entity DB + localStorage    |
| File      | Base44 File Upload                 |

---

## 📄 License
