---
title: "Datadog Tagging Best Practices — Cách gắn Tag hiệu quả trong Datadog"
date: 2026-03-10
tags:
  - datadog
  - tech
description: "Hạ tầng và ứng dụng ngày nay ngày càng phức tạp, thay đổi liên tục và tồn tại tạm thời (ephemeral). Điều này đặt ra nhiều thách thức cho việc giám sát:"
---

# Datadog Tagging Best Practices — Cách gắn Tag hiệu quả trong Datadog

# Phần 1: Tổng quan về Tag trong Datadog

## Tag là gì và tại sao cần dùng?

Hạ tầng và ứng dụng ngày nay ngày càng phức tạp, thay đổi liên tục và tồn tại tạm thời (ephemeral). Điều này đặt ra nhiều thách thức cho việc giám sát:

- Làm sao **ghép nối** dữ liệu metric, log và trace thành một bức tranh toàn cảnh?
- Làm sao để các team và stakeholder **tìm đúng dữ liệu** họ cần?
- Làm sao **chẩn đoán sự cố** nhanh chóng và chính xác?

> **Tag chính là câu trả lời.** Tag là nhãn (label) gắn vào dữ liệu để thêm ngữ cảnh, giúp bạn**lọc**,**nhóm** và**liên kết** dữ liệu xuyên suốt toàn bộ nền tảng Datadog.**Ví dụ thực tế:** Hình dưới cho thấy các tag được gán cho metric data của một host trên Host Map. Nhờ tag, bạn có thể tìm kiếm host đó và xem dữ liệu của nó ở nhiều sản phẩm khác nhau trong Datadog.

![image_1773129180656_0](tech/files/image_1773129180656_0.png)

## Cấu trúc của một điểm dữ liệu (datapoint)

Mỗi datapoint trong Datadog gồm 4 thành phần:

| Thành phần | Mô tả |
|:-----------|:-------|
| **Tên / ID** | Định danh của metric |
| **Giá trị** | Giá trị đo được |
| **Timestamp** | Thời điểm thu thập |
| **Tags** | Nhãn ngữ cảnh đi kèm |

### Hai dạng tag

| Dạng tag | Ví dụ | Khả năng sử dụng |
|:---------|:------|:------------------|
| **Giá trị đơn** (Simple Value) | `staging`, `demo` | Chỉ dùng để**lọc** (filter) |
| **Cặp key:value** | `env:staging`, `env:demo` | Dùng để**lọc** (theo `key:value`) và**nhóm** (theo `key`) |

![image_1773129196063_0](tech/files/image_1773129196063_0.png)

> **Khuyến nghị:** Luôn dùng dạng `key:value` vì linh hoạt hơn — vừa lọc vừa nhóm được.**Ví dụ minh họa:** Host Map bên dưới được lọc bằng tag `env:staging` và `active`, đồng thời nhóm theo key `availability-zone`.

![image_1773129280115_0](tech/files/image_1773129280115_0.png)

## Tag dành riêng (Reserved Tags) và Unified Service Tagging

Datadog có một số **tag key đặc biệt** (reserved) dùng để liên kết metric, trace và log xuyên suốt nền tảng. Những tag này**chỉ nên dùng đúng mục đích** đã được định nghĩa.

| Tag Key | Mục đích sử dụng |
|:--------|:------------------|
| `host` | Liên kết metric, trace, process và log theo host |
| `device` | Phân tách dữ liệu theo thiết bị hoặc ổ đĩa |
| `source` | Lọc span + tự động tạo pipeline cho Log Management |
| `env` | Phân vùng dữ liệu ứng dụng theo môi trường (dev/staging/prod) |
| `service` | Phân vùng dữ liệu ứng dụng theo dịch vụ |
| `version` | Phân vùng dữ liệu ứng dụng theo phiên bản |
| `team` | Gán quyền sở hữu (ownership) cho tài nguyên |

### Unified Service Tagging là gì?

Ba tag `env`, `service` và `version` khi dùng **cùng nhau** sẽ kích hoạt tính năng [Unified Service Tagging](https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging). Tính năng này cho phép phân vùng dữ liệu theo**môi trường → dịch vụ → phiên bản triển khai**, giúp so sánh hành vi giữa các lần deploy qua thời gian.

![image_1773129403947_0](tech/files/image_1773129403947_0.png)

## Cách gán và sử dụng tag

Có hai cách gán tag:

1. **Tự động** — qua integration inheritance (kế thừa từ các công cụ tích hợp)
2. **Thủ công** — cấu hình trực tiếp theo [tài liệu gán tag](https://docs.datadoghq.com/getting_started/tagging/assigning_tags)**Điểm hay:** Khi bạn gán tag một lần, dữ liệu có tag đó sẽ tự động xuất hiện trong**tất cả** các sản phẩm Datadog mới mà không cần cấu hình thêm.

Tham khảo chi tiết tại [tài liệu sử dụng tag](https://docs.datadoghq.com/getting_started/tagging/using_tags).

# Phần 3: Best Practices — Thực hành tốt nhất khi gắn Tag

## 3.1. Xác định rõ use case trước khi gắn tag

Hãy trả lời những câu hỏi sau:

- **Giám sát bao nhiêu môi trường?** → Nếu nhiều hơn 1, dùng tag `env:xxx` và kích hoạt [Unified Service Tagging](https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging).
- **Giám sát những service nào?** → Gắn tag `host` và `service` để dễ tìm kiếm và liên kết dữ liệu.
- **Có tag nào sẵn từ nhà cung cấp?** → Kiểm tra tích hợp (integration) để tận dụng tag tự động kế thừa như `availability-zone`, `region`.
- **Cần tag tùy chỉnh nào thêm?** → Gắn tag scope, function, ownership hoặc business để có góc nhìn đa chiều hơn.**Ví dụ:** Biểu đồ scatter bên dưới phân nhóm mức sử dụng container theo `service` và `team`.

![image_1773130030012_0](tech/files/image_1773130030012_0.png)

## 3.2. Nghĩ đến người dùng cuối của dữ liệu

- **Team nào sở hữu** service nào? → Cần tag ownership để lọc/nhóm dữ liệu.
- **Ai cần nhận cảnh báo** khi có sự cố? → Gắn tag để gửi alert đúng người.
- **Bộ phận tài chính** có cần xem chi phí theo đơn vị? → Gắn tag business.
- **Người dùng nghiệp vụ** có cần dashboard riêng? → Dùng tag làm template variable.**Ví dụ:** Dashboard dưới đây dùng 3 template variable là `customer`, `security_group` và `application` — cho phép chọn giá trị để lọc dữ liệu hiển thị.

![image_1773130050106_0](tech/files/image_1773130050106_0.png)

## 3.3. Xây dựng quy chuẩn gắn tag toàn tổ chức

**Tại sao quan trọng?** Nếu các team dùng tag khác nhau cho cùng một khái niệm, dữ liệu sẽ**không thể liên kết** được.**Ví dụ lỗi phổ biến:** Metric `system.cpu.user` bên dưới có 4 tag khác nhau: `app`, `app_name`, `application`, `application_name`. Không rõ sự khác biệt → gây nhầm lẫn, không truy vấn liên kết được.

![image_1773130138928_0](tech/files/image_1773130138928_0.png)

**Giải pháp:** Tạo một**kho quy chuẩn tag trung tâm** (central repository) để tất cả team biết:
- Dùng key nào cho mục đích gì
- Giá trị nào hợp lệ
- Cách lọc và nhóm dữ liệu

> **Kết luận:** Chỉ cần lập kế hoạch một chút, bạn sẽ giảm nhiễu, tăng insight và mở rộng giá trị giám sát ra toàn tổ chức.

---

# Phần 4: Thực hành — Sử dụng Tag trong Docker Compose

## Giới thiệu bài lab

Trong bài lab này, bạn sẽ làm việc với ứng dụng mẫu **Storedog** và thực hiện:

1. Khám phá các tag đã được gán cho ứng dụng
2. Xem dữ liệu ứng dụng liên kết qua tag trong Datadog
3. Tạo Synthetic test và dùng tag để liên kết với service cụ thể
4. Thiết lập cảnh báo có mục tiêu (targeted alert) gửi đúng team
5. So sánh hiệu suất giữa các phiên bản deploy bằng Unified Service Tagging

```
Your Datadog credentials for logging in to https://app.datadoghq.com are as follows:
Username:       1hb7pzim16@ddtraining.datadoghq.com
Password:       7ce915fC+8
API Key:        c8fd79d5b933650d2de139a5e5558fc3
Account expires in 12 days and 20 hours

This training account is a trial account that's available for 14 days. After the trial account expires, you will be automatically provisioned a new trial account that you can use to continue your learning. These credentials will only work for Datadog Learning Center labs.

======

If these lab credentials do not work, click the Help tab above this lab terminal for troubleshooting tips.

root@app-lab-host:~/lab#
```

## Phân tích file Docker Compose

### Bước 1: Mở file `docker-compose.yml`

File này cấu hình Datadog Agent và ứng dụng Storedog để giám sát. Trong môi trường Docker:

- **Mọi cấu hình** được thực hiện qua environment variables, volumes và Docker labels
- **Datadog Agent** chạy trong container `dd-agent` song song với các container ứng dụng
- **Mỗi service** chạy trong container riêng: `frontend`, `backend`, `worker`, `ads-java`, `discounts`, `postgres`, `redis`, `nginx`

```
services:
dd-agent:
image: gcr.io/datadoghq/agent:7.56.0
environment:
- DD_API_KEY
- DD_HOSTNAME
- DD_TAGS="env:${DD_ENV}"
- DD_LOGS_ENABLED=true
- DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
- DD_PROCESS_AGENT_ENABLED=true
- DD_CONTAINER_LABELS_AS_TAGS={"my.custom.label.color":"color"}
- DD_APM_NON_LOCAL_TRAFFIC=true
- DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
- DD_SYSTEM_PROBE_NETWORK_ENABLED=true
pid: "host"
ports:
- "8126:8126/tcp"
- "8125:8125/udp"
volumes:
- /var/run/docker.sock:/var/run/docker.sock:ro
- /proc/:/host/proc/:ro
- /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
- /var/lib/docker/containers:/var/lib/docker/containers:ro
- /sys/kernel/debug:/sys/kernel/debug
cap_add:
- SYS_ADMIN
- SYS_RESOURCE
- SYS_PTRACE
- NET_ADMIN
- NET_BROADCAST
- NET_RAW
- IPC_LOCK
- CHOWN
security_opt:
- apparmor:unconfined
labels:
com.datadoghq.ad.logs: '[{"source": "agent", "service": "agent"}]'
frontend:
image: public.ecr.aws/x2b9z2t7/storedog/frontend:1.2.4
command: bash -c "wait-for-it backend:4000 -- npm run build && npm run start"
volumes:
- .env:/storedog-app/.env.local
ports:
- "${FRONTEND_PORT-3000}:3000"
environment:
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_LOGS_INJECTION=true
- DD_SERVICE=store-frontend
- DD_VERSION=1.2.4
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
depends_on:
- dd-agent
- backend
labels:
com.datadoghq.ad.logs: '[{"source": "nodejs", "service": "store-frontend"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-frontend"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "red"
backend:
image: public.ecr.aws/x2b9z2t7/storedog/backend:1.2.4
command: wait-for-it postgres:5432 -- bundle exec rails s -b 0.0.0.0 -p 4000
depends_on:
- dd-agent
- postgres
- redis
ports:
- 4000:4000
environment:
- REDIS_URL
- POSTGRES_USER
- POSTGRES_PASSWORD
- DB_HOST=postgres
- DB_PORT=5432
- RAILS_ENV=development
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-backend
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
labels:
com.datadoghq.ad.logs: '[{"source": "ruby", "service": "store-backend", "auto_multi_line_detection":true }]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-backend"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "orange"
worker:
image: public.ecr.aws/x2b9z2t7/storedog/backend:1.2.4
command: wait-for-it postgres:5432 -- bundle exec sidekiq -C config/sidekiq.yml
depends_on:
- dd-agent
- postgres
- redis
volumes:
- /opt/datadog-training/storedog/services/worker/config/initializers/datadog-tracer.rb:/app/config/initializers/datadog-tracer.rb
environment:
- REDIS_URL
- DB_HOST=postgres
- DB_PORT=5432
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-worker
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
labels:
com.datadoghq.ad.logs: '[{"source": "ruby", "service": "store-worker"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-worker"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "yellow"
ads-java:
image: public.ecr.aws/x2b9z2t7/storedog/ads-java:1.2.4
environment:
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-ads-java
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
ports:
- "${ADS_PORT}:8080"
depends_on:
- dd-agent
labels:
com.datadoghq.ad.logs: '[{"source": "java", "service": "store-ads-java"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-ads-java"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "green"
discounts:
image: public.ecr.aws/x2b9z2t7/storedog/discounts:1.2.4
command: wait-for-it postgres:5432 -- ./my-wrapper-script.sh ${DISCOUNTS_PORT}
environment:
- FLASK_APP=discounts.py
- FLASK_DEBUG=1
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_HOST=postgres
- DD_AGENT_HOST=dd-agent
- DD_ENV
- DD_SERVICE=store-discounts
- DD_VERSION=1.2.4
- DD_LOGS_INJECTION=true
- DD_RUNTIME_METRICS_ENABLED=true
- DD_PROFILING_ENABLED=true
ports:
- "${DISCOUNTS_PORT}:${DISCOUNTS_PORT}"
depends_on:
- dd-agent
- postgres
labels:
com.datadoghq.ad.logs: '[{"source": "python", "service": "store-discounts"}]'
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "store-discounts"
com.datadoghq.tags.version: "1.2.4"
my.custom.label.color: "blue"
volumes:
- /root/discounts.py:/app/discounts.py
postgres:
image: public.ecr.aws/x2b9z2t7/storedog/postgres:1.2.4
command: ["postgres", "-c", "config_file=/postgresql.conf"]
restart: always
environment:
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_HOST_AUTH_METHOD=trust
ports:
- "127.0.0.1:5432:5432"
depends_on:
- dd-agent
labels:
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "database"
com.datadoghq.tags.version: "13"
my.custom.label.color: "purple"
com.datadoghq.ad.check_names: '["postgres"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"host":"%%host%%", "port":5432, "username":"datadog", "password":"datadog"}]'
com.datadoghq.ad.logs: '[{"source": "postgresql", "service": "postgres"}]'
redis:
image: redis:6.2-alpine
volumes:
- redis:/data
depends_on:
- dd-agent
labels:
com.datadoghq.tags.env: "${DD_ENV}"
com.datadoghq.tags.service: "redis"
com.datadoghq.tags.version: "6.2"
my.custom.label.color: "purple"
com.datadoghq.ad.check_names: '["redisdb"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"host":"%%host%%", "port":6379}]'
com.datadoghq.ad.logs: '[{"source": "redis", "service": "redis"}]'
nginx:
image: public.ecr.aws/x2b9z2t7/storedog/nginx:1.2.4
restart: always
ports:
- "80:80"
depends_on:
- dd-agent
- frontend
labels:
com.datadog.tags.env: "${DD_ENV}"
com.datadog.tags.service: "store-nginx"
com.datadog.tags.version: "1.27.1"
com.datadog.tags.team: "backend"
com.datadoghq.ad.logs: '[{"source": "nginx", "service": "store-nginx"}]'
com.datadoghq.ad.check_names: '["nginx"]'
com.datadoghq.ad.init_configs: "[{}]"
com.datadoghq.ad.instances: '[{"nginx_status_url": "http://%%host%%:81/nginx_status/"}]'
puppeteer:
image: ghcr.io/puppeteer/puppeteer:20.9.0
volumes:
- /opt/datadog-training/storedog/services/puppeteer/puppeteer.js:/home/pptruser/puppeteer.js
- /opt/datadog-training/storedog/services/puppeteer/puppeteer.sh:/home/pptruser/puppeteer.sh
environment:
- STOREDOG_URL
- PUPPETEER_TIMEOUT
- SKIP_SESSION_CLOSE
command: bash puppeteer.sh
volumes:
redis:
```

### Bước 2: Giải thích cấu hình tag trong Docker Compose

Hãy chú ý những điểm quan trọng sau:

**① Tag `env` cho toàn bộ host**
```yaml
DD_TAGS="env:${DD_ENV}"
```
→ Gán tag `env` cho host, tất cả dữ liệu từ app Storedog được đánh dấu thuộc cùng một môi trường.

**② Thu thập Docker label làm tag**
```yaml
DD_CONTAINER_LABELS_AS_TAGS={"my.custom.label.color":"color"}
```
→ Biến `DD_CONTAINER_LABELS_AS_TAGS` chỉ định rằng Docker label `my.custom.label.color` sẽ được ánh xạ thành tag `color` trong Datadog.

**③ Các loại label trong block `labels` của mỗi service:**

| Label | Mục đích |
|:------|:---------|
| `com.datadoghq.tags.env` | Tag `env` cho Unified Service Tagging |
| `com.datadoghq.tags.service` | Tag `service` cho Unified Service Tagging |
| `com.datadoghq.tags.version` | Tag `version` cho Unified Service Tagging |
| `com.datadoghq.ad.logs` | Cấu hình `source` và `service` cho log — hỗ trợ tìm kiếm và liên kết log |
| `my.custom.label.color` | Tag tùy chỉnh `color`, ánh xạ thông qua `DD_CONTAINER_LABELS_AS_TAGS` |

**④ Unified Service Tagging qua environment variables:**

Mỗi service đều cấu hình 3 biến môi trường: `DD_ENV`, `DD_SERVICE`, `DD_VERSION`. Giá trị của chúng sẽ trở thành tag `env`, `service`, `version` tương ứng.

> **Kết quả:** Khi cấu hình cả environment variables lẫn Docker labels, mọi dữ liệu metric, trace và log từ container đều mang 3 tag Unified Service Tagging → giúp liên kết dữ liệu xuyên suốt Datadog.

---

# Phần 5: Khám phá dữ liệu liên kết bằng Tag

Nhờ tag, bạn có thể **nhảy qua lại** giữa metric, log và trace liên quan đến nhau trong Datadog.

### Bước 1: Đăng nhập Datadog

Dùng thông tin đăng nhập trong terminal để vào [Datadog](https://app.datadoghq.com/account/login).

![image_1773220132339_0](tech/files/image_1773220132339_0.png)

> Nếu link mở tài khoản khác, hãy đăng xuất rồi đăng nhập lại bằng tài khoản trial.

### Bước 2: Kích hoạt Logs (nếu chưa có)

Nếu là tổ chức Datadog mới, vào **[Logs](https://app.datadoghq.com/logs)** → nhấn**Get Started** → nhấn**Get Started** lần nữa.

![image_1773220162111_0](tech/files/image_1773220162111_0.png)

### Bước 3: Xem danh sách Trace

Vào menu **APM → [Traces](https://app.datadoghq.com/apm/traces)** để xem trace đang đổ về.

![image_1773220540847_0](tech/files/image_1773220540847_0.png)

### Bước 4: Lọc trace bằng tag

Dán query sau vào ô tìm kiếm để lọc trace cho service `store-ads-java`:

```
env:storedog-tagging service:store-ads-java resource_name:"GET /ads"
```

Hoặc chọn Facet tương ứng ở cột bên trái.

![image_1773220624257_0](tech/files/image_1773220624257_0.png)

### Bước 5: Xem chi tiết trace

Nhấn vào bất kỳ trace nào để mở chi tiết.

![image_1773220659998_0](tech/files/image_1773220659998_0.png)

### Bước 6: Khám phá dữ liệu liên kết

Dưới Flame Graph, lần lượt nhấn vào các tab **Infrastructure**,**Metrics**,**Processes** để thấy dữ liệu metric liên kết với trace thông qua tag `env`, `host`, `service`.

![image_1773220748288_0](tech/files/image_1773220748288_0.png)
![image_1773220859432_0](tech/files/image_1773220859432_0.png)
![image_1773220804844_0](tech/files/image_1773220804844_0.png)

### Bước 7: Xem log liên kết

Nhấn tab **Logs** phía dưới Flame Graph để xem danh sách log liên quan.

![image_1773221127222_0](tech/files/image_1773221127222_0.png)

> **Lưu ý:** Ô tìm kiếm hiển thị `trace_id` cụ thể. Tính năng**trace\_id injection** cho phép liên kết log với trace tương ứng.

### Bước 8: Mở chi tiết log

Nhấn vào bất kỳ log nào → tab **Logs** mới mở ra với chi tiết log.

![image_1773221189139_0](tech/files/image_1773221189139_0.png)

### Bước 9: Xem toàn bộ log

Đóng side panel → xóa ô tìm kiếm để hiển thị tất cả log.

![image_1773221238222_0](tech/files/image_1773221238222_0.png)

### Bước 10: Lọc log theo service

Nhập query:

```
env:storedog-tagging service:store-discounts
```

→ Danh sách log của service `store-discounts` hiện ra.

![image_1773221303482_0](tech/files/image_1773221303482_0.png)

### Bước 11: Xem chi tiết log

Nhấn vào bất kỳ log nào để mở chi tiết.

![image_1773221391510_0](tech/files/image_1773221391510_0.png)

### Bước 12: Xem danh sách tag đầy đủ

Nhấn **+22** (số có thể khác) để mở rộng danh sách tag theo thứ tự A-Z.

![image_1773221463461_0](tech/files/image_1773221463461_0.png)

### Bước 13: Tìm tag `color`

Tìm tag `color` → giá trị là `blue`, khớp với label `my.custom.label.color: blue` đã cấu hình cho service `store-discounts` trong docker-compose.

![image_1773221506743_0](tech/files/image_1773221506743_0.png)

### Bước 14: Chuyển sang trang APM Service

Ở phần trên log, nhấn **Service** → chọn**Go to APM Service Page** → trang service tương ứng mở ra.

![image_1773221544876_0](tech/files/image_1773221544876_0.png)

> **Điểm mấu chốt:** Việc di chuyển mượt mà giữa trace → metric → log → service page là nhờ các tag `env`, `host`, `service`, `trace_id` kết nối dữ liệu trong Datadog.

![image_1773221585728_0](tech/files/image_1773221585728_0.png)

---

# Phần 6: Tìm kiếm và liên kết Synthetic Test bằng Tag

Tag có thể đóng vai trò **facet** (bộ lọc chi tiết) trong nhiều tính năng của Datadog. Ở phần này, bạn sẽ tạo Synthetic test và dùng tag để liên kết chúng với service cụ thể.

### Bước 1: Tạo Synthetic test mới

Vào **Digital Experience → Synthetic Monitoring & Testing → New Test**.

![image_1773283954991_0](tech/files/image_1773283954991_0.png)

### Bước 2: Chọn loại API Test

Nhấn **API Test**.

![image_1773284024904_0](tech/files/image_1773284024904_0.png)

### Bước 3: Bắt đầu từ đầu

Nhấn **Start from Scratch**.

![image_1773284145049_0](tech/files/image_1773284145049_0.png)

### Bước 4: Điền thông tin request

| Trường | Giá trị |
|:-------|:--------|
| **URL** | URL trang chủ Storedog của bạn, ví dụ: `https://app-lab-host-80-jbospqxaqehj.env.play.instruqt.com` |
| **Name** | `Test on Storedog homepage` |
| **Environment** | `frontend` (nếu hiện modal "Create Team" → nhấn**Create**) |
| **Additional Tags** | `service:store-frontend` |

![image_1773284448680_0](tech/files/image_1773284448680_0.png)

### Bước 5: Thêm Assertion

Mở rộng **Assertions** → nhấn**New Assertion**:

- **When** `response time` `including DNS` `is less than` `10` ms

![image_1773284511407_0](tech/files/image_1773284511407_0.png)

### Bước 6: Chọn Locations

Mở rộng **Locations** → bỏ chọn**All Locations** → chỉ tích `Americas`.

![image_1773284560971_0](tech/files/image_1773284560971_0.png)

### Bước 7: Bỏ qua Retry conditions

### Bước 8: Cấu hình Scheduling & Alert

Thiết lập: Alert được kích hoạt nếu test thất bại trong `1` phút từ bất kỳ **`1` trong 11 location.**

![image_1773284754073_0](tech/files/image_1773284754073_0.png)

### Bước 9: Phần Monitor

Có thể để trống hoặc nhập message tùy chọn.

![image_1773284812602_0](tech/files/image_1773284812602_0.png)

### Bước 10: Bỏ qua Permissions, nhấn Save Test

Bạn sẽ được chuyển đến trang Synthetic test vừa tạo. Có thể cần refresh sau vài phút khi dữ liệu bắt đầu đổ về.

![image_1773284898237_0](tech/files/image_1773284898237_0.png)

→ Trong phần **Properties**, tag `team`, `env`, `service` hiển thị dưới mục**TEAM**,**ENVIRONMENT** và**ADDITIONAL TAGS**.

### Bước 11: Xem danh sách test

Nhấn icon **Synthetics** hoặc vào**[Digital Experience → Synthetic Monitoring & Testing → Tests](https://app.datadoghq.com/synthetics/tests)**.

![image_1773285509857_0](tech/files/image_1773285509857_0.png)

### Bước 12: Sử dụng tag làm Facet để tìm kiếm

Ở cột facet bên trái, mở rộng **TAGS** → thấy menu**service** (xuất hiện vì bạn đã gắn tag `service` cho test).

![image_1773285750945_0](tech/files/image_1773285750945_0.png)

### Bước 13: Tìm kiếm theo tag

Nhập vào ô tìm kiếm:

```
tag:"service:store-frontend"
```

→ Test vừa tạo hiện ra, tag tìm kiếm được highlight.

![image_1773285781543_0](tech/files/image_1773285781543_0.png)

### Bước 14–15: Clone test và bỏ tag `service`

Nhấn dấu **ba chấm** trên test →**Clone**.

![image_1773285840264_0](tech/files/image_1773285840264_0.png)

Trong test mới:
- Đổi tên thành `Test on Storedog homepage 2`
- **Xóa** tag `service:store-frontend`

![image_1773285946867_0](tech/files/image_1773285946867_0.png)

Nhấn **Save Test**.

### Bước 16: So sánh kết quả facet

Quay lại danh sách Synthetics, kiểm tra facet **Env** và**TAGS**:

- `env:storedog-tagging` và `team:frontend` → **2 test**
- `service:store-frontend` → **chỉ 1 test** (test gốc có gắn tag `service`)

![image_1773286264559_0](tech/files/image_1773286264559_0.png)

### Bước 17: Xác nhận lọc theo tag service

Tìm kiếm `tag:"service:store-frontend"` → chỉ test gốc hiện ra.

![image_1773286310609_0](tech/files/image_1773286310609_0.png)

> **Bài học:** Gắn tag đúng giúp tìm được tất cả test liên quan và kết nối test với dữ liệu tương ứng trong Datadog.

### Bước 18: Xem test trên Service Page

Vào **[APM → Software Catalog → Services](https://app.datadoghq.com/software)** → hover**store-frontend** → nhấn**Service Page**.

![image_1773286630873_0](tech/files/image_1773286630873_0.png)
![image_1773286648546_0](tech/files/image_1773286648546_0.png)

> Kiểm tra dropdown `env` ở trên cùng phải chọn `env:storedog-tagging`.

### Bước 19: Xem Synthetic test liên kết

Nhấn banner **ALERT: 1 Synthetic Test** → cuộn đến phần**Synthetic Tests**.

Chỉ test đầu tiên (có tag `service:store-frontend`) được liên kết. Test thứ hai không có tag `service` nên không xuất hiện.

![image_1773286737309_0](tech/files/image_1773286737309_0.png)

> **Quy tắc:** Mọi monitor/Synthetic test có tag `env` + `service` sẽ tự động liên kết với APM Service Page tương ứng. Thêm tag `resource_name` sẽ liên kết cả với Resource Page.

### Bước 20: Xóa test (dọn dẹp)

Quay lại **[Synthetics Tests](https://app.datadoghq.com/synthetics/tests)** → chọn 2 test → xóa (tránh ping không cần thiết sau lab).

![image_1773286812516_0](tech/files/image_1773286812516_0.png)

---

# Phần 7: Tạo cảnh báo có mục tiêu (Targeted Alerts) bằng Tag

Tag giúp gửi cảnh báo **đúng người, đúng team**, giảm thiểu thông báo thừa gây "alert fatigue" — làm giảm hiệu quả giám sát.

## Tạo Monitor theo dõi CPU usage

### Bước 1: Tạo monitor mới

Vào **[Monitoring → New Monitor](https://app.datadoghq.com/monitors#/create)** → chọn**Metric**.

![image_1773287282337_0](tech/files/image_1773287282337_0.png)

### Bước 2: Chọn phương pháp phát hiện

Chọn **Threshold Alert**.

![image_1773287319668_0](tech/files/image_1773287319668_0.png)

### Bước 3: Định nghĩa metric

| Trường | Giá trị |
|:-------|:--------|
| **Metric (field a)** | `docker.cpu.usage` |
| **from** | `env:storedog-tagging` |
| **avg by** | `service` và `color` |

![image_1773287409803_0](tech/files/image_1773287409803_0.png)

### Bước 4: Đặt ngưỡng cảnh báo

**Alert threshold:** `20`

![image_1773287512710_0](tech/files/image_1773287512710_0.png)

### Bước 5: Cấu hình thông báo

**Monitor Name:**
```
The {{service.name}} service container {{color.name}} has high CPU usage!!
```

**Monitor Message:**
```
The {{service.name}} service container {{color.name}} has high CPU usage!!

Contact:
Email - @{{service.name}}@mycompany.com, @<YOUR EMAIL ADDRESS>
Slack - @slack-{{service.name}}
```

![image_1773287625152_0](tech/files/image_1773287625152_0.png)

**Giải thích template variable:**
- `{{service.name}}` → tên service kích hoạt alert
- `{{color.name}}` → giá trị tag `color` của container

→ Alert sẽ tự động gửi đến email/Slack channel đúng team sở hữu service đó.

**Metadata → Tags:** `env:storedog-tagging`**Aggregation:** chọn `Multi Alert`

![image_1773287703863_0](tech/files/image_1773287703863_0.png)

### Bước 6: Test thông báo

Nhấn **Test Notifications** → chọn tile**Alert** → nhấn**Run Test**.

![image_1773287746024_0](tech/files/image_1773287746024_0.png)

Nếu đã nhập email, kiểm tra hộp thư → thấy email với `{{service.name}}` và `{{color.name}}` đã được thay bằng giá trị thực tế.

![image_1773287914258_0](tech/files/image_1773287914258_0.png)

### Bước 7: Lưu monitor

Xóa email cá nhân khỏi message (nếu đã thêm) → nhấn **Create and Publish**.

## Xem trạng thái Monitor trong Software Catalog

### Bước 8: Kiểm tra cột Monitors

Vào **Software Catalog** → cột**Monitors** hiển thị trạng thái (xanh/đỏ) cho từng service.

![image_1773288369061_0](tech/files/image_1773288369061_0.png)

### Bước 9: Xem service có alert

Ví dụ **store-backend** có 1 alert → hover → nhấn**Service Page**.

> Nếu chưa thấy alert, đợi vài phút rồi refresh. Kiểm tra filter `env:storedog-tagging` hoặc `env:*`.

![image_1773288417272_0](tech/files/image_1773288417272_0.png)

### Bước 10: Xem Monitor trên Service Page

Nhấn banner **Monitor** → xem danh sách monitor liên kết với service.

![image_1773288477623_0](tech/files/image_1773288477623_0.png)

> Kiểm tra dropdown `env:storedog-tagging` ở góc trên bên trái.

![image_1773288519282_0](tech/files/image_1773288519282_0.png)

Monitor bạn tạo xuất hiện ở đây, gắn tag `env:storedog-tagging`.

### Bước 11: Xem sự kiện Alert

Vào **[Monitoring → Event Management → All Events](https://app.datadoghq.com/event/explorer)** → tìm kiếm:

```
source:alert
```

→ Thấy sự kiện alert được trigger bởi monitor vừa tạo.

![image_1773288628045_0](tech/files/image_1773288628045_0.png)

### Bước 12: Xóa monitor (dọn dẹp)

Vào **[Monitors → Monitor List](https://app.datadoghq.com/monitors/manage)** → mở rộng**Custom Monitors** → chọn monitor vừa tạo → xóa.

---

# Phần 8: So sánh phiên bản triển khai bằng Unified Service Tagging

Ba tag `env`, `service`, `version` cho phép so sánh hiệu suất giữa **các phiên bản deploy** khác nhau — đây là sức mạnh cốt lõi của Unified Service Tagging.

### Bước 1: Chuyển đổi phiên bản ứng dụng

Tắt phiên bản cũ:
```
docker compose -f docker-compose.yml down
```

![image_1773288832732_0](tech/files/image_1773288832732_0.png)

Khởi động phiên bản mới:
```
docker compose -f docker-compose-new.yml up -d
```

![image_1773288886947_0](tech/files/image_1773288886947_0.png)

### Bước 2: So sánh 2 file Docker Compose

Mở `docker-compose.yml` (phiên bản cũ):

![image_1773289304775_0](tech/files/image_1773289304775_0.png)

Mở `docker-compose-new.yml` (phiên bản mới):

![image_1773289275173_0](tech/files/image_1773289275173_0.png)

### Bước 3: Điểm khác biệt chính

Service `discounts` có **version** thay đổi:
- Phiên bản cũ: `1.2.4`
- Phiên bản mới: `1.3.0`

(Thay đổi ở cả environment variables `DD_VERSION` và Docker labels `com.datadoghq.tags.version`)

### Bước 4: Xem Deployment trên Service Page

Vào **[APM → Software Catalog](https://app.datadoghq.com/software)** → hover**store-discounts** → nhấn**Service Page**.

### Bước 5: Đổi time frame

Chọn **Past 15 Minutes** ở bộ chọn thời gian.

![image_1773289399779_0](tech/files/image_1773289399779_0.png)

### Bước 6: Xem tab Deployments

Nhấn **Deployments** bên trái → thấy 2 deploy: `1.2.4` và `1.3.0`.

> Nếu chưa thấy, đợi vài phút rồi refresh.

![image_1773289450456_0](tech/files/image_1773289450456_0.png)

→ Service `store-discounts` có vấn đề **latency cao ở phiên bản cũ**, đã được**khắc phục ở phiên bản mới**.

### Bước 7: So sánh Latency theo Version

Cuộn lên **Service Summary** → nhấn tiêu đề biểu đồ**Latency** → chọn**Latency by Version**.

![image_1773289530065_0](tech/files/image_1773289530065_0.png)

→ Biểu đồ cho thấy latency **cải thiện đáng kể** ở phiên bản mới.

> **Kết luận:** Unified Service Tagging giúp so sánh hiệu suất giữa các phiên bản, đồng thời cung cấp điều hướng mượt mà giữa trace, metric và log khi xử lý sự cố hoặc xác minh tác động của thay đổi.

---

# Phần 9: Tổng kết bài lab

Trong bài lab, bạn đã thực hiện:

1. ✅ **Khám phá dữ liệu liên kết** — chuyển đổi qua lại giữa metric, trace và log nhờ tag
2. ✅ **Tạo Synthetic test và targeted alert** — liên kết chúng với service thông qua tag
3. ✅ **Sử dụng tag làm facet** — tìm kiếm monitor, test và các tài sản khác trong Datadog
4. ✅ **Dùng Unified Service Tagging** — so sánh hiệu suất dịch vụ giữa các phiên bản deploy

---

# Phần 10: Bài lab Kubernetes (Tagging a Kubernetes Cluster)

(tiếp tục…)

---

# Tổng kết chung

**Tag** là nhãn gắn vào dữ liệu để thêm**ngữ cảnh**, phục vụ tìm kiếm và liên kết nhiều loại dữ liệu khác nhau trong Datadog.

## Những điểm cốt lõi cần nhớ:

1. **Tag là công cụ mạnh mẽ** giúp tối ưu hóa quy trình giám sát hạ tầng và ứng dụng
2. Ngoài **native tag** (tự động kế thừa từ integration), bạn có thể gán**custom tag** để thêm các chiều: scope, function, ownership, business, customer
3. Khi chọn và gán tag, hãy **xem xét use case và người dùng cuối**
4. **Phối hợp xuyên team** để xây dựng quy chuẩn tag toàn tổ chức — tránh nhầm lẫn, đảm bảo dữ liệu liên kết chính xác
5. Dùng tag `env`, `service`, `version` cùng nhau để kích hoạt **Unified Service Tagging** — so sánh deployment, liên kết trace-metric-log, điều hướng nhanh trong Datadog
