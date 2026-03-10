---
title: "Datadog Quick Start"
date: 2026-03-09
tags:
  - tech
  - datadog
description: "Sau lab này bạn sẽ biết cách:"
---

# Datadog Quick Start

## 📋 Tổng quan Lab

| Mục | Chi tiết |
|---|---|
| **App mẫu** | Storedog — ứng dụng e-commerce chạy trên Docker |
| **Microservices** | `store-frontend`, `store-backend`, `store-discounts`, `store-ads` |
| **Service tập trung** | `store-discounts` |
| **Tags quan trọng** | `env:quickstart-course`, `service:store-discounts` |
| **Mục tiêu** | Làm quen với 4 tính năng cốt lõi của Datadog |

### Mục tiêu học tập

Sau lab này bạn sẽ biết cách:

1. 📊 **Dashboards** — Khám phá và lọc dữ liệu dashboard
2. 📝 **Logs** — Tìm kiếm, lọc và trực quan hóa log
3. 🗂️ **Software Catalog** — Xem thông tin tổng quan về service
4. 🔔 **Monitors** — Đọc hiểu và diễn giải alert/monitor

## 🔐 Đăng nhập Datadog

**URL:** [https://app.datadoghq.com/account/login](https://app.datadoghq.com/account/login)

```
Username: ebo44cutuv@ddtraining.datadoghq.com
Password: 4dDe327f+8
API Key:  87ac4b6c3db50ebc95a4ee230fae29bb
```

> **Lưu ý:** Đây là tài khoản trial 14 ngày, chỉ dùng được trong Datadog Learning Center labs.

![](tech/files/image_1773045391508_0.png)

---

## 📊 Phần 1: Khám phá Dashboard

### Khái niệm

| Khái niệm | Giải thích |
|---|---|
| **Dashboard** | Bảng tổng hợp trực quan hóa dữ liệu từ toàn hệ thống |
| **OOTB Dashboard** | Dashboard có sẵn do Datadog cung cấp tự động |
| **Custom Dashboard** | Dashboard tự tạo theo nhu cầu team |
| **Widget** | Khối xây dựng cơ bản của dashboard |

### Các bước thực hiện

**Bước 1 — Vào Dashboard List**

> Menu chính → hover **Dashboards** → chọn**[Dashboard List](https://app.datadoghq.com/dashboard/lists)**

![](tech/files/image_1773045510684_0.png)

**Bước 2 — Xem danh sách dashboard**

Danh sách gồm:
- Các OOTB dashboards (tự động cài theo cấu hình Storedog)
- 1 custom dashboard: **Storedog 2.0**

![](tech/files/image_1773045567035_0.png)

**Bước 3 — Mở Storedog 2.0**

![](tech/files/image_1773045618169_0.png)

Dashboard có **3 nhóm widget:**
- **Overall Performance**
- **Infrastructure & Network**
- **Databases**

![](tech/files/image_1773045662290_0.png)
![](tech/files/image_1773045683309_0.png)

**Bước 4 — Tương tác với widget**

> Click vào bất kỳ data point nào trong chart → menu hiện ra với options điều hướng đến dữ liệu liên quan

![](tech/files/image_1773045743654_0.png)

**Bước 5 — Lọc theo service store-discounts**

> Bên dưới tiêu đề dashboard → Click **env** → chọn `quickstart-course` → Click**service** → chọn `store-discounts`

![](tech/files/image_1773045806757_0.png)

> ⚠️ **Quan sát:** Sau khi lọc, widgets**SLO: Python service high errors**,**Monitors Status**, và**Error Rate %** cho thấy store-discounts có error rate cao → cần điều tra.**Bước 6 — Đánh dấu yêu thích (★)**

> Click icon **★** cạnh tiêu đề dashboard → thêm vào Starred Dashboards**Bước 7 — Khám phá Docker - Overview dashboard**

> Trong widget **Overall Performance** → click link**[Docker - Overview](https://app.datadoghq.com/screen/integration/52/docker---overview)**

![](tech/files/image_1773046072728_0.png)
![](tech/files/image_1773046137011_0.png)

Dashboard này hiển thị: **Containers**,**CPU Core Load**,**Memory**, v.v.**Bước 8 — Lọc Docker dashboard theo store-discounts**

> Bên dưới tiêu đề → click menu **scope** → gõ `service:store-discounts` → chọn

![](tech/files/image_1773046392118_0.png)
![](tech/files/image_1773046453503_0.png)

> ✅ **Kết quả:** Sức khỏe container store-discounts tốt, không ảnh hưởng đến performance của service.**Bước 9 — Đánh dấu Docker - Overview và kiểm tra Starred**

> Click **★** → vào menu**Dashboards** → xem section**Starred Dashboards & Notebooks**

![](tech/files/image_1773046547612_0.png)

### ✏️ Điểm ôn tập — Dashboards

- Dashboard là nơi **tổng hợp toàn bộ dữ liệu** hệ thống
- Dùng **tags** để**filter** dữ liệu theo service, env
- Click data point bất kỳ để **drill down** sang dữ liệu liên quan
- Có thể **star** dashboard để truy cập nhanh
- Dùng **"Go to…"** để điều hướng nhanh đến bất kỳ trang nào

---

## 📝 Phần 2: Tìm kiếm Logs

### Khái niệm

| Khái niệm | Giải thích |
|---|---|
| **Log Management** | Thu thập, xử lý, chuẩn hóa toàn bộ logs thành định dạng có cấu trúc |
| **Log Explorer** | Giao diện tìm kiếm và phân tích logs |
| **Facet** | Bộ lọc có sẵn bên trái (VD: Service, Status) |
| **Saved View** | Lưu trạng thái tìm kiếm + visualization để dùng lại |

### Các bước thực hiện

**Bước 1 — Dùng "Go to…" để điều hướng đến Logs**

> Menu chính → click **Go to…** → search `Logs` → chọn**Logs**

![](tech/files/image_1773046672999_0.png)
![](tech/files/image_1773046703546_0.png)
![](tech/files/image_1773046734832_0.png)

**Bước 2 — Khám phá Log Explorer**

Giao diện gồm:
- **Time picker** (trên thanh search): chọn khoảng thời gian xem log
- **Facets** (bên trái): bộ lọc nhanh
- **Log list** (giữa): danh sách logs

![](tech/files/image_1773046804394_0.png)
![](tech/files/image_1773046823719_0.png)

**Bước 3 — Lọc log của store-discounts**

> Facets bên trái → **Service** → chọn `store-discounts`

Search field tự động thêm `service:store-discounts`

![](tech/files/image_1773046933894_0.png)
![](tech/files/image_1773046961567_0.png)

**Bước 4 — Xem chi tiết log bình thường**

> Click log có CONTENT: `Discounts available: ###`

Panel hiện ra với:
- **Tags** gắn với log
- **Nội dung** log
- Tabs: **Fields & Attributes** |**Trace** |**Metrics** |**Processes**

![](tech/files/image_1773047025210_0.png)

**Bước 5 — Lọc log lỗi (Error)**

> Facets → **Status** → chọn `Error`

Search field thêm `status:error`

![](tech/files/image_1773047097340_0.png)

**Bước 6 — Xem chi tiết log lỗi**

> Click log có CONTENT: `An error occurred while getting discounts.`

Status hiển thị **ERROR** ở góc trên trái panel.

![](tech/files/image_1773047256083_0.png)

> 💡 **Tip:** Dùng phím ↑↓ để chuyển nhanh giữa các log trong list**Bước 7 — Xóa filter status:error**

> Search field → hover `status:error` → click **X**

![](tech/files/image_1773047361876_0.png)

**Bước 8 — Tạo visualization: Timeseries**

> Bên dưới search field:
> - **Visualize as** → `Timeseries`
> - **Show Count of** → `all logs` (giữ nguyên)
> - **by** → `Status`

![](tech/files/image_1773047460009_0.png)
![](tech/files/image_1773047493502_0.png)

> ℹ️ Timeseries cho thấy số lượng logs nhưng **không hiển thị %**.**Bước 9 — Chuyển sang Pie Chart để xem %**

> **Visualize as** → `Pie Chart`

![](tech/files/image_1773047546791_0.png)

Pie chart hiển thị **phân bố % logs theo status** trong khoảng thời gian đã chọn.**Bước 10 — Lưu Saved View**

> **Views** (góc trên trái) →**Save as new view** → đặt tên:

```
store-discounts status percentages
```

![](tech/files/image_1773047636579_0.png)
![](tech/files/image_1773047701203_0.png)
![](tech/files/image_1773047744104_0.png)

**Bước 11 — Khám phá log phức tạp hơn (webserver)**

> **Visualize as** → `List` → Facets →**Service** → chọn `webserver`

![](tech/files/image_1773047807040_0.png)

> Click một log để xem **Fields & Attributes**

![](tech/files/image_1773047880812_0.png)

> ✅ **Quan sát:** Log của webserver phức tạp hơn nhưng Datadog tự động**parse** và trình bày dưới dạng dễ đọc.

### ✏️ Điểm ôn tập — Logs

- **Facets** giúp filter nhanh theo Service, Status, v.v.
- Search field hỗ trợ query kiểu `key:value` (VD: `service:store-discounts status:error`)
- Có thể **kết hợp filter** bằng cách chọn nhiều facets
- **Saved View** = lưu toàn bộ trạng thái (filter + visualization) để dùng lại
- Từ log detail, có thể xem **Trace, Metrics, Processes** liên quan (APM integration)

---

## 🗂️ Phần 3: Xem Chi tiết Service (Software Catalog)

### Khái niệm

| Khái niệm | Giải thích |
|---|---|
| **Software Catalog** | Tổng quan tập trung về tất cả services đang được monitor |
| **Telemetry icons** | Shortcut đến các loại dữ liệu (logs, traces, metrics) của service |
| **APM metrics** | Requests, Latency, Error Rate |
| **SLO** | Service Level Objective — cam kết mức độ dịch vụ |

### Các bước thực hiện

**Bước 1 — Vào Software Catalog**

> Menu chính → **Automation > Internal Developer Portal > [Software Catalog](https://app.datadoghq.com/services?lens=Ownership)**

![](tech/files/image_1773048112088_0.png)
![](tech/files/image_1773048158649_0.png)

Trang mở ở **Service List**, tab**Ownership**. Các tab khác:**Reliability**,**Performance**,**Security**,**Costs**,**Delivery**.**Bước 2 — Lọc theo môi trường quickstart-course**

> Click menu `env:*` → chọn `env:quickstart-course`

![](tech/files/image_1773048240725_0.png)

**Bước 3 — Xem thông tin Ownership của store-discounts**

> Hover các icon trong cột **Telemetry** để xem shortcuts đến dữ liệu của service

![](tech/files/image_1773048333972_0.png)

**Bước 4 — Xem tab Performance**

> Click tab **Performance** ở trên danh sách

Hiển thị cho từng service:
- **Requests** (req/s)
- **Latency** (p50, p90, p99)
- **Error Rate** (%)
- **Monitor count** và trạng thái

![](tech/files/image_1773048405503_0.png)

> 💡 Cũng có thể vào Performance tab qua: **APM > Software Catalog**

**Bước 5 — Mở chi tiết service store-discounts**

> Click **store-discounts** → panel mở ở tab**Performance**

![](tech/files/image_1773048470460_0.png)

Panel gồm: key visualizations về performance + link đến **Service Page** trong APM**Bước 6 — Xem tab Ownership của service**

> Click tab **Ownership** trong panel

Thấy: Documentation, Runbooks, Dashboards, Team, On-call, Contacts

![](tech/files/image_1773048551661_0.png)

**Bước 7 — Xem thêm thông tin**

> Phần dưới panel: service setup, linked dashboards, **service dependencies**

![](tech/files/image_1773048611013_0.png)

**Bước 8 — Điều hướng đến trang liên quan**

> Góc trên phải panel → click mũi tên cạnh **Service Page** → menu hiện ra

![](tech/files/image_1773048659267_0.png)

### ✏️ Điểm ôn tập — Software Catalog

- Software Catalog = **"one-stop shop"** để xem health, ownership, performance của mọi service
- Tích hợp với APM để hiển thị **Requests, Latency, Error Rate**
- Có thể xem **Dependencies** giữa các services
- Từ panel service, điều hướng trực tiếp đến Monitors, APM, Logs liên quan

---

## 🔔 Phần 4: Diễn giải Monitor

### Khái niệm

| Khái niệm | Giải thích |
|---|---|
| **Monitor** | Alert tự động khi metric vượt ngưỡng hoặc asset thay đổi trạng thái |
| **APM Monitor** | Monitor dựa trên dữ liệu từ APM (traces, error rate) |
| **ALERT** | Ngưỡng đã bị vượt, cần action ngay |
| **WARN** | Đang tiến gần đến ngưỡng, cần theo dõi |
| **SLO** | Service Level Objective — nếu vi phạm sẽ trigger monitor |
| **Query** | Điều kiện để evaluate monitor (VD: error rate > 0.05) |

### Các bước thực hiện

**Bước 1 — Vào Manage Monitors của store-discounts**

> Từ panel Service Page → click mũi tên → **Monitors**

Trang Manage Monitors mở với filter sẵn: `service:store-discounts`

![](tech/files/image_1773049170815_0.png)
![](tech/files/image_1773049197275_0.png)

> ⚠️ **Quan sát:** Một số monitors có trạng thái**ALERT** hoặc**WARN**

**Bước 2 — Mở monitor cụ thể**

> Click monitor tên: **`Service store-discounts has a high error rate`**

![](tech/files/image_1773049235613_0.png)

**Cấu trúc trang Monitor Status:**

| Khu vực | Nội dung |
|---|---|
| **Header** | Monitor Status (ALERT/WARN/OK), Type, Creation Date, Author |
| **Associated** | Teams và Services liên kết |
| **Query** | Điều kiện evaluate (hover để xem đầy đủ) |
| **Evaluation** | Cách tính (VD: sum over last 10 min) |
| **Notification Count** | Số notifications đã gửi + danh sách recipients | **📌 Đọc hiểu Query của monitor này:** 

```
sum(last_10m):sum:trace.flask.request.errors{env:quickstart-course,service:store-discounts}
/ sum:trace.flask.request.hits{env:quickstart-course,service:store-discounts} > 0.05
```

> **Diễn giải:** Lấy**tổng errors / tổng requests** trong**10 phút gần nhất** → nếu**error rate > 5%** → status =**ALERT**

**Bước 3 — Xem Event Details**

> Cuộn xuống dưới trang → phần **Event Details**

![](tech/files/image_1773049442164_0.png)
![](tech/files/image_1773049420398_0.png)

- **Message Template:** Nội dung notification (có thể chứa variables, link dashboard/runbook)
- **Recipients:** Ai nhận notification → `eng-discounts@company.com`**Bước 4 — Xem Monitor Behavior**

> Phần **Monitor Behavior**

![](tech/files/image_1773049562482_0.png)

Gồm:
- **Bar graph:** Lịch sử trạng thái theo thời gian
- **Timeseries graphs:** Giá trị metric được tính toán theo query

### ✏️ Điểm ôn tập — Monitors

- Monitor = cơ chế **alerting tự động** dựa trên điều kiện do người dùng định nghĩa
- Tags trong query đảm bảo monitor chỉ theo dõi **đúng service/env**
- **ALERT** = đã vi phạm ngưỡng |**WARN** = sắp vi phạm
- Notification có thể gửi đến: email, Slack, PagerDuty, v.v.
- Có thể xem **lịch sử trạng thái** và**giá trị metric** trực tiếp trên trang monitor

---

## 🧪 Bài tập tự luyện (Optional)

### Bài 1: Mở lại Saved View trong Logs

<details>
<summary>💡 Gợi ý giải</summary>

> **Logs > Search & Analytics > [Explorer](https://app.datadoghq.com/logs)** → click**Views** (góc trên trái) → chọn view đã lưu

![](tech/files/image_1773050013454_0.png)

</details>

### Bài 2: Tìm Manage Monitors và lọc theo store-discounts

<details>
<summary>💡 Gợi ý giải</summary>

> **[Monitoring > Monitor List](https://app.datadoghq.com/monitors/manage)** → Facets →**Service** → chọn `store-discounts`

![](tech/files/image_1773050084979_0.png)
![](tech/files/image_1773050108204_0.png)

</details>

---

## 📌 Tổng kết

### Những gì đã học

| Tính năng | Chức năng chính | Dùng để |
|---|---|---|
| **Dashboards** | Tổng hợp & trực quan hóa dữ liệu | Bức tranh tổng thể nhanh về hệ thống |
| **Logs** | Tìm kiếm & phân tích logs | Debug, điều tra lỗi, tạo báo cáo |
| **Software Catalog** | Tổng quan service (ownership, perf, deps) | Hiểu ownership và sức khỏe của service |
| **Monitors** | Alerting tự động | Biết ngay khi hệ thống có vấn đề |

### Công cụ điều hướng

| Công cụ | Cách dùng |
|---|---|
| **Main navigation menu** | Hover/click vào các mục trong menu trái |
| **Go to…** | Click "Go to…" → search tên trang → chọn |
| **Correlated data links** | Click data points, icons, hoặc links trong các trang để jump sang dữ liệu liên quan |

### Bước tiếp theo

Học sâu hơn về Dashboards, Logs, Software Catalog và Monitors qua khóa học:
👉 [Datadog Foundation](https://learn.datadoghq.com/courses/datadog-foundation)
