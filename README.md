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

1. 🗂️ UML - Sơ đồ Class (Entity Diagram)
┌─────────────────┐       ┌─────────────────┐
│     User        │       │    Question     │
├─────────────────┤       ├─────────────────┤
│ id              │ 1──∞  │ id              │
│ email           │──────▶│ text            │
│ full_name       │       │ image_url       │
│ role            │       │ school          │
└─────────────────┘       │ major           │
                          │ cohort          │
                          │ subject         │
                          │ report_count    │
                          │ created_by(email)│
                          └────────┬────────┘
                                   │ 1
                                   │
                                   ∞
                          ┌────────▼────────┐       ┌─────────────────┐
                          │     Answer      │ 1──∞  │    Comment      │
                          ├─────────────────┤──────▶├─────────────────┤
                          │ id              │       │ id              │
                          │ question_id(FK) │       │ answer_id(FK)   │
                          │ text            │       │ text            │
                          │ image_url       │       │ report_count    │
                          │ report_count    │       │ created_by      │
                          │ created_by      │       └─────────────────┘
                          └─────────────────┘

                          ┌─────────────────────┐
                          │    Notification     │
                          ├─────────────────────┤
                          │ id                  │
                          │ user_email (FK)     │
                          │ type (answer/comment│
                          │ question_id (FK)    │
                          │ message             │
                          │ read (boolean)      │
                          └─────────────────────┘
2.🔄 UML - Sơ đồ Use Case
                    ┌─────────────────────────────────────────┐
                    │           The Chicken's Whisper         │
                    │                                         │
  ┌──────────┐      │  ┌──────────────────────────────────┐   │
  │          │──────┼─▶│ Xem danh sách câu hỏi            │   │
  │          │      │  └──────────────────────────────────┘   │
  │          │      │  ┌──────────────────────────────────┐   │
  │  Khách   │──────┼─▶│ Tìm kiếm / Lọc câu hỏi          │   │
  │ (ẩn danh)│      │  └──────────────────────────────────┘   │
  │          │      │  ┌──────────────────────────────────┐   │
  │          │──────┼─▶│ Đặt câu hỏi (ẩn danh)           │   │
  │          │      │  └──────────────────────────────────┘   │
  │          │      │  ┌──────────────────────────────────┐   │
  │          │──────┼─▶│ Trả lời câu hỏi (ẩn danh)       │   │
  └──────────┘      │  └──────────────────────────────────┘   │
                    │  ┌──────────────────────────────────┐   │
  ┌──────────┐      │  │ Bình luận vào câu trả lời        │   │
  │          │──────┼─▶└──────────────────────────────────┘   │
  │  User    │      │  ┌──────────────────────────────────┐   │
  │ (đăng   │──────┼─▶│ Report nội dung xấu              │   │
  │  nhập)  │      │  └──────────────────────────────────┘   │
  │          │      │  ┌──────────────────────────────────┐   │
  │          │──────┼─▶│ Nhận thông báo (🔔)              │   │
  │          │      │  └──────────────────────────────────┘   │
  │          │      │  ┌──────────────────────────────────┐   │
  │          │──────┼─▶│ Xem lịch sử hoạt động            │   │
  └──────────┘      │  └──────────────────────────────────┘   │
                    │  ┌──────────────────────────────────┐   │
  ┌──────────┐      │  │ Xóa nội dung vi phạm             │   │
  │  Admin   │──────┼─▶│ (auto khi report ≥ 5)            │   │
  └──────────┘      │  └──────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
3. 🔁 UML - Sơ đồ Sequence (Luồng đặt câu hỏi & trả lời)
User A          Frontend         Base44 API        User B (chủ câu hỏi)
  │                │                  │                    │
  │──[Đặt câu hỏi]▶│                  │                    │
  │                │──POST Question──▶│                    │
  │                │◀──Question saved─│                    │
  │                │                  │                    │
  │                                   │                    │
User C (người trả lời)                │                    │
  │                │                  │                    │
  │──[Trả lời]────▶│                  │                    │
  │                │──POST Answer────▶│                    │
  │                │──POST Notification (to User B)───────▶│
  │                │◀──Saved──────────│                    │
  │                │                  │                    │
  │                │                  │         [🔔 Nhận thông báo]
  │                │                  │                    │
  │                │                  │◀──GET Notifications│
  │                │                  │────────────────────▶
  4. 🏗️ Sơ đồ Nguyên lý (System Architecture)
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Home    │  │QuestionDetail│  │   MyHistory      │  │
│  │  Page    │  │    Page      │  │     Page         │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
│       │               │                    │            │
│  ┌────▼───────────────▼────────────────────▼──────────┐ │
│  │              Components Layer                      │ │
│  │  QuestionCard │ AnswerCard │ CommentSection        │ │
│  │  FilterBar    │ AskModal   │ NotificationBell      │ │
│  │  ImageCapture │ ...                                │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                             │
│  ┌────────────────────────▼───────────────────────────┐ │
│  │              Lib / Utils Layer                     │ │
│  │  anonymousUser.js  │  userHistory.js (localStorage)│ │
│  │  schoolData.js     │  base44Client.js              │ │
│  └────────────────────────┬───────────────────────────┘ │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP / REST
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BASE44 BACKEND (BaaS)                   │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Auth API   │  │Entity API│  │  Integrations API  │ │
│  │ (login/me)  │  │ (CRUD)   │  │  (LLM, UploadFile) │ │
│  └─────────────┘  └────┬─────┘  └────────────────────┘ │
│                        │                                │
│  ┌─────────────────────▼──────────────────────────────┐ │
│  │                  Database                          │ │
│  │  Question │ Answer │ Comment │ Notification │ User │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            RLS (Row Level Security)              │  │
│  │  Notification: chỉ đọc/sửa được của chính mình  │  │
│  │  Comment: chỉ xóa của chính mình hoặc admin     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
5. 🖼️ UI/UX Flow (User Journey)
[Trang chủ /]
     │
     ├──▶ Xem danh sách câu hỏi
     │         │
     │         ├──▶ [Tìm kiếm / Lọc theo trường, ngành, khóa, môn]
     │         │
     │         └──▶ [Click vào câu hỏi] ──▶ /question/:id
     │                                           │
     │                                           ├──▶ Xem câu trả lời
     │                                           ├──▶ Viết câu trả lời
     │                                           ├──▶ Bình luận
     │                                           └──▶ Report nội dung
     │
     ├──▶ [Nút "Hỏi ngay"] ──▶ Modal đặt câu hỏi
     │                              │
     │                              ├── Nhập nội dung câu hỏi
     │                              ├── Chọn trường / ngành / khóa / môn
     │                              ├── (tùy chọn) Đính kèm ảnh
     │                              └── Submit ──▶ Lưu vào DB
     │
     ├──▶ [🔔 Notification Bell] ──▶ Dropdown thông báo
     │                                    │
     │                                    └──▶ Click ──▶ /question/:id
     │
     └──▶ [Lịch sử] ──▶ /history
                             │
                             ├──▶ Tab "Câu hỏi của tôi"
                             └──▶ Tab "Câu trả lời của tôi"
6. 🔐 Luồng Bảo mật (RLS Logic)
Request từ Client
       │
       ▼
  Có token? ──No──▶ Chỉ được READ công khai
       │
      Yes
       │
       ▼
  Kiểm tra RLS của Entity
       │
       ├── Notification:
       │     READ/UPDATE/DELETE: data.user_email == user.email
       │                         HOẶC role == admin
       │
       ├── Comment:
       │     UPDATE/DELETE: created_by == user.email
       │                    HOẶC role == admin
       │
       └── Question/Answer:
             Report auto-delete khi report_count >= 5
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
MIT © 2024 The Chicken's Whisper Team

✅ Checklist để đạt tiêu chí
1. 📂 Mã nguồn mở — Đẩy lên GitHub public
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả file
git add .

# Commit đầu tiên
git commit -m "🐔 Initial commit - The Chicken's Whisper"

# Tạo repo trên GitHub rồi push
git remote add origin https://github.com/ptun28/WEB.git
git branch -M main
git push -u origin main
⚠️ Nhớ thêm .env vào .gitignore để không lộ API key!

# .gitignore
echo ".env" >> .gitignore
2. 📝 Đầy đủ mô tả — File .env.example
Tạo file .env.example (commit file này lên GitHub):

# .env.example
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_APP_OWNER=your_app_owner_here
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
3. ▶️ Hoạt động tốt — Hướng dẫn chạy rõ ràng trong README
## 🚀 Chạy dự án

### Bước 1 — Clone
```bash
git clone https://github.com/ptun28/chickens-whisper.git
cd chickens-whisper
Bước 2 — Cài dependencies
npm install
Bước 3 — Cấu hình môi trường
cp .env.example .env
# Mở file .env và điền thông tin thật vào
Bước 4 — Chạy
npm run dev
# Mở trình duyệt tại http://localhost:5173

---

### 4. 🔗 Demo link hoạt động

Thêm vào đầu README:

```markdown
## 🌐 Demo trực tuyến

👉 **[https://chickens-whisper.base44.app](https://chickens-whisper.base44.app)**

> Dùng thử ngay — không cần đăng ký!
5. 📸 Screenshot trong README (điểm cộng)
![Demo](assets/demo.png)
## 📸 Giao diện

### Trang chủ
![Home](./screenshots/home.png)

### Chi tiết câu hỏi
![Detail](./screenshots/detail.png)
Chụp màn hình app → lưu vào thư mục screenshots/ → push lên GitHub.

🗂️ Cấu trúc GitHub repo lý tưởng
chickens-whisper/
├── src/                  ✅ Toàn bộ source code
├── screenshots/          ✅ Ảnh demo
├── .env.example          ✅ Mẫu biến môi trường
├── .gitignore            ✅ Ẩn .env thật
├── README.md             ✅ Mô tả đầy đủ
└── package.json          ✅ Dependencies rõ ràng


###Phân Tích , sử dụng , đề cập đến các kỹ thuật OOP
1. 📦 Đóng gói (Encapsulation)
Phân tích & Sử dụng:

Mỗi React component trong dự án (ví dụ: QuestionCard, AnswerCard, NotificationBell, CommentSection) có thể được coi là một đối tượng riêng biệt.

Dữ liệu (State & Props): Mỗi component quản lý dữ liệu riêng của nó (state) và nhận dữ liệu từ bên ngoài (props). Dữ liệu này được "đóng gói" bên trong component, không thể truy cập trực tiếp từ bên ngoài nếu không thông qua props.
Ví dụ: AnswerCard nhận answer và questionCreatedBy làm props. CommentSection nhận comments, answerId, v.v.
Hành vi (Methods/Functions): Logic và hành vi của component (ví dụ: handleReport trong AnswerCard, handleSubmit trong CommentSection) cũng được đóng gói bên trong nó.
Đề cập: Nguyên lý đóng gói giúp giữ cho code gọn gàng, dễ quản lý và giảm thiểu tác động khi có thay đổi. Mỗi component là một "hộp đen" với giao diện rõ ràng (props) và logic nội bộ riêng.

2. 🧩 Trừu tượng hóa (Abstraction) & Tính mô-đun (Modularity/Composition)
Phân tích & Sử dụng:

Dự án này được xây dựng từ nhiều component nhỏ hơn, mỗi component giải quyết một phần nhỏ của vấn đề và cung cấp một giao diện trừu tượng cho các component khác sử dụng. Thay vì tạo ra một class lớn, chúng ta kết hợp (compose) các component nhỏ hơn.

Tính mô-đun: Các file như anonymousUser.js hay schoolData.js là các module trừu tượng hóa logic phức tạp hoặc dữ liệu thành các hàm dễ sử dụng.
Trừu tượng hóa component:
QuestionDetail sử dụng AnswerCard để hiển thị mỗi câu trả lời. QuestionDetail không cần biết AnswerCard hoạt động bên trong như thế nào, chỉ cần truyền props cần thiết.
AnswerCard lại sử dụng CommentSection để quản lý bình luận. AnswerCard cũng không cần biết chi tiết bên trong của CommentSection.
Các component UI dùng chung (Button, Dialog, Input, v.v. từ shadcn/ui) là ví dụ điển hình của trừu tượng hóa, nơi chúng ta sử dụng lại các "đối tượng" UI mà không cần quan tâm đến cách chúng được render hay xử lý sự kiện.
Đề cập: Việc chia nhỏ ứng dụng thành các component và module nhỏ giúp chúng ta trừu tượng hóa các chi tiết phức tạp, làm cho code dễ đọc, dễ bảo trì và dễ mở rộng hơn. Nó thể hiện tính composition over inheritance (ưu tiên kết hợp hơn kế thừa), một triết lý thiết kế mạnh mẽ trong lập trình hiện đại.

3. ♻️ Tái sử dụng (Reusability)
Phân tích & Sử dụng:

Các component và hàm tiện ích được thiết kế để có thể tái sử dụng ở nhiều nơi khác nhau trong ứng dụng, giảm thiểu việc lặp code.

NotificationBell: Có thể được sử dụng ở bất kỳ trang nào cần hiển thị thông báo.
ImageCapture: Dùng cho cả AskQuestionModal (khi đặt câu hỏi) và QuestionDetail (khi trả lời).
getAnonIdentity (từ lib/anonymousUser.js): Một hàm tiện ích được sử dụng rộng rãi bởi QuestionDetail, AnswerCard, CommentSection để tạo danh tính ẩn danh.
Đề cập: Khả năng tái sử dụng là một lợi ích lớn của thiết kế hướng đối tượng/component, giúp tăng hiệu suất phát triển và đảm bảo tính nhất quán trong ứng dụng.

Kết luận
Dự án The Chicken's Whisper chứng minh việc phân tích, sử dụng và đề cập đến các kỹ thuật OOP thông qua cách tổ chức code thành các React component:

Mỗi component hành xử như một đối tượng, đóng gói dữ liệu và logic riêng.
Ứng dụng được xây dựng bằng cách kết hợp các component nhỏ hơn, thể hiện tính mô-đun và trừu tượng hóa.
Các component và hàm tiện ích được thiết kế để tái sử dụng, giảm lặp code và tăng hiệu quả.
Điều này phù hợp với tiêu chí của bạn về việc áp dụng các kỹ thuật thiết kế tốt trong lập trình.