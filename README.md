# 🐔 The Chicken's Whisper


![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)
![Base44](https://img.shields.io/badge/Base44-BaaS-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge)

> **Hỏi bài ẩn danh · Trả lời ẩn danh · Không cần đăng nhập 🤫**

![Demo](assets/demo.png)

## 🌐 Demo trực tuyến

👉 **Dùng thử ngay — không cần đăng ký!**

---

## 🛠️ Tech Stack

| Layer     | Công nghệ                            |
|-----------|--------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS         |
| UI        | shadcn/ui, Lucide React              |
| Backend   | Base44 BaaS                          |
| Auth      | Base44 Auth                          |
| Storage   | Base44 Entity DB + localStorage      |
| File      | Base44 File Upload                   |

---

## 🚀 Chạy dự án

**Bước 1 — Clone**
```bash
git clone https://github.com/ptuan28/WEB.git
cd WEB
```

**Bước 2 — Cài dependencies**
```bash
npm install
```

**Bước 3 — Cấu hình môi trường**

Tạo file `.env.local`:
```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://api.base44.com
VITE_BASE44_API_KEY=your_api_key
```

**Bước 4 — Chạy**
```bash
npm run dev
# Mở trình duyệt tại http://localhost:5173
```

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
│   └── api/
│       └── base44Client.js       # Khởi tạo Base44 SDK
├── .env.local                    # Biến môi trường (không commit)
└── README.md
```

---

## 🗂️ UML & Kiến trúc hệ thống

### 1. Entity Diagram (Class Diagram)

```mermaid
classDiagram
    class User {
        +id
        +email
        +full_name
        +role
    }
    class Question {
        +id
        +text
        +image_url
        +school
        +major
        +cohort
        +subject
        +report_count
        +created_by
    }
    class Answer {
        +id
        +question_id
        +text
        +image_url
        +report_count
        +created_by
    }
    class Comment {
        +id
        +answer_id
        +text
        +report_count
        +created_by
    }
    class Notification {
        +id
        +user_email
        +type
        +question_id
        +message
        +read
    }

    User "1" --> "*" Question
    Question "1" --> "*" Answer
    Answer "1" --> "*" Comment
    Answer "1" --> "*" Notification
```

### 2. Use Case Diagram

```mermaid
flowchart LR
    Guest([👤 Khách ẩn danh])
    User([👤 User đăng nhập])
    Admin([👤 Admin])

    subgraph App["The Chicken's Whisper"]
        UC1[Xem danh sách câu hỏi]
        UC2[Tìm kiếm / Lọc câu hỏi]
        UC3[Đặt câu hỏi ẩn danh]
        UC4[Trả lời câu hỏi ẩn danh]
        UC5[Bình luận vào câu trả lời]
        UC6[Report nội dung xấu]
        UC7[Nhận thông báo 🔔]
        UC8[Xem lịch sử hoạt động]
        UC9[Xóa nội dung vi phạm]
    end

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    Admin --> UC9
```

### 3. Sequence Diagram (Luồng đặt câu hỏi & trả lời)

```mermaid
sequenceDiagram
    participant A as User A
    participant FE as Frontend
    participant API as Base44 API
    participant B as User B (chủ câu hỏi)

    A->>FE: Đặt câu hỏi
    FE->>API: POST Question
    API-->>FE: Question saved

    Note over A,B: User C trả lời

    A->>FE: Trả lời câu hỏi
    FE->>API: POST Answer
    FE->>API: POST Notification (to User B)
    API-->>FE: Saved
    B->>API: GET Notifications
    API-->>B: 🔔 Nhận thông báo
```

### 4. System Architecture

```mermaid
flowchart TB
    subgraph FE["FRONTEND (React + Vite)"]
        Pages["Pages: Home | QuestionDetail | MyHistory"]
        Components["Components: QuestionCard | AnswerCard | CommentSection\nFilterBar | AskModal | NotificationBell"]
        Libs["Libs: anonymousUser | userHistory | schoolData"]
    end

    subgraph BE["BASE44 BACKEND (BaaS)"]
        Auth["Auth API"]
        Entity["Entity CRUD API"]
        Integration["Integrations API"]
        DB["Database: Question | Answer | Comment | Notification"]
        RLS["RLS: Row Level Security"]
    end

    FE -->|HTTP / REST| BE
```

### 5. UI/UX Flow

```mermaid
flowchart TD
    Home["🏠 Trang chủ /"]
    Home --> Filter["Tìm kiếm / Lọc"]
    Home --> Detail["/question/:id"]
    Home --> Modal["Modal đặt câu hỏi"]
    Home --> Bell["🔔 Thông báo"]
    Home --> History["/history"]

    Detail --> ViewAnswer["Xem câu trả lời"]
    Detail --> WriteAnswer["Viết câu trả lời"]
    Detail --> Comment["Bình luận / Report"]

    History --> MyQ["Tab: Câu hỏi của tôi"]
    History --> MyA["Tab: Câu trả lời của tôi"]
```

---

## 🔐 Bảo mật

| Thao tác             | Điều kiện                              |
|----------------------|----------------------------------------|
| Tạo câu hỏi/trả lời  | Đã đăng nhập                           |
| Đọc Notification     | `user_email == user.email` hoặc admin  |
| Xóa Comment          | `created_by == user.email` hoặc admin  |
| Auto-xóa nội dung    | `report_count >= 5`                    |

---

## 🧠 Kỹ thuật OOP trong dự án

Dù dùng React (functional), dự án vẫn thể hiện rõ các nguyên lý OOP:

**1. Đóng gói (Encapsulation)**
Mỗi component quản lý state và logic riêng. Ví dụ: `AnswerCard` đóng gói logic report, xóa bên trong — bên ngoài chỉ cần truyền `answer` và `onDelete`.

**2. Trừu tượng hóa (Abstraction)**
`anonymousUser.js`, `userHistory.js`, `schoolData.js` trừu tượng hóa logic phức tạp thành các hàm đơn giản. Component cha không cần biết bên trong hoạt động thế nào.

**3. Tái sử dụng (Reusability)**
`NotificationBell` dùng ở cả `Home` và `QuestionDetail`. `ImageCapture` dùng ở cả modal hỏi và form trả lời. `getAnonIdentity` dùng ở nhiều component.

**4. Kết hợp (Composition)**
`QuestionDetail` → `AnswerCard` → `CommentSection`. Các component nhỏ lắp ghép thành UI phức tạp, thay vì kế thừa (inheritance).

---

## 📄 License

MIT © 2025 The Chicken's Whisper Team
