# Từ Card Mạng Vật Lý đến Địa Chỉ IP trên RHEL

## Phân biệt các khái niệm cốt lõi

| Khái niệm | Là gì | Tồn tại ở đâu |
|---|---|---|
| **NIC** | Chip phần cứng cắm vào bo mạch | Vật lý (PCIe slot) |
| **PCI Device** | Cách kernel nhìn thấy NIC qua bus PCIe | Kernel (`/sys/bus/pci/devices/`) |
| **Kernel Module (Driver)** | Phần mềm dịch tín hiệu phần cứng → lệnh kernel | Kernel memory |
| **Network Interface** | Đối tượng phần mềm thuần túy trong kernel đại diện cho NIC | Kernel (`/sys/class/net/`) |
| **Connection Profile** | File cấu hình IP, DNS, gateway | Disk (`/etc/NetworkManager/`) |
| **IP Address** | Số được gán vào Network Interface | Kernel routing table |

> **Mấu chốt**: `NIC ≠ Network Interface`. NIC là phần cứng. Network Interface là bản đại diện phần mềm của nó trong kernel — và chính cái này mới nhận IP address.

---

## Hành trình từng bước

### Bước 1: NIC → PCI Device

```
[NIC vật lý]
     │
     │  cắm vào PCIe bus
     ▼
[PCI Device]  →  kernel đọc được qua: lspci
                 nhận dạng bằng: vendor ID + device ID
                 ví dụ: 8086:10d3 = Intel 82574L
```

Lúc này kernel **biết có phần cứng** nhưng **chưa nói chuyện được** với nó.

---

### Bước 2: PCI Device → Driver nạp vào

`udev` nhận event "có device PCI mới" → tra bảng → nạp đúng kernel module:

```
[PCI Device: 8086:10d3]
     │
     │  udev tra /lib/modules/.../modules.alias
     ▼
[Kernel Module: e1000e]    ←  lệnh: lsmod | grep e1000e
     │
     │  module chứa code để:
     │  - đọc/ghi register của NIC
     │  - gửi/nhận frame Ethernet
     ▼
Kernel bây giờ "nói chuyện được" với NIC
```

---

### Bước 3: Driver → tạo ra Network Interface

Driver không chỉ điều khiển phần cứng — nó còn **đăng ký một đối tượng phần mềm** vào kernel gọi là `net_device`.

```
[Kernel Module: e1000e]
     │
     │  gọi hàm register_netdev() trong kernel
     ▼
[Network Interface: enp3s0]   ←  lệnh: ip link show
     │
     │  Đây là đối tượng THUẦN PHẦN MỀM, gồm:
     │  - Tên (enp3s0)
     │  - MAC address (copy từ NIC)
     │  - TX queue / RX queue
     │  - Trạng thái (UP/DOWN)
     │  - Chưa có IP (!)
```

Tên `enp3s0` được đặt theo quy tắc **Predictable Network Interface Names**:
- `en` = ethernet
- `p3` = PCIe bus 3
- `s0` = slot 0

> **Analogy**: NIC là chiếc xe vật lý. Network Interface là **bằng lái xe** — một đối tượng hành chính đại diện cho chiếc xe đó trong hệ thống.

---

### Bước 4: Network Interface → NetworkManager gán IP

Network Interface mới xuất hiện → `udev` bắn event → **NetworkManager** nhận được:

```
[Network Interface: enp3s0]  (trạng thái DOWN)
     │
     │  NetworkManager nhận udev event
     │  tìm Connection Profile khớp với interface này
     ▼
[Connection Profile]   ←  file: /etc/NetworkManager/system-connections/enp3s0.nmconnection
     │
     │  Trong file có ghi: DHCP hay Static?
     ▼
[DHCP hoặc Static Config]
     │
     │  NM bật interface lên (UP)
     │  NM chạy DHCP hoặc đọc IP tĩnh
     ▼
[IP Address gán vào enp3s0]   ←  lệnh: ip addr show enp3s0
```

NetworkManager giao tiếp với kernel qua **netlink socket** — một kênh đặc biệt để cấu hình mạng.

---

## Toàn bộ luồng

```
┌──────────────────────────────────────────────────────────┐
│                   PHẦN CỨNG                              │
│                                                          │
│   ┌─────────┐   PCIe bus   ┌──────────────────────┐     │
│   │  NIC    │ ──────────▶  │  PCI Device          │     │
│   │ (chip)  │              │  (vendor:device ID)  │     │
│   └─────────┘              └──────────┬───────────┘     │
└──────────────────────────────────────┼──────────────────┘
                                       │ udev event
┌──────────────────────────────────────▼──────────────────┐
│                   KERNEL                                 │
│                                                          │
│   ┌────────────────────┐   register_netdev()             │
│   │  Kernel Module     │ ──────────────────▶             │
│   │  (e.g. e1000e)     │              ┌─────────────┐    │
│   │                    │              │  Network    │    │
│   │  - nói chuyện NIC  │              │  Interface  │    │
│   │  - quản lý TX/RX   │              │  (enp3s0)   │    │
│   └────────────────────┘              │             │    │
│                                       │  - Tên      │    │
│                                       │  - MAC      │    │
│                                       │  - Queues   │    │
│                                       │  - Chưa IP  │    │
│                                       └──────┬──────┘    │
└──────────────────────────────────────────────┼───────────┘
                                               │ udev event
┌──────────────────────────────────────────────▼───────────┐
│                   USER SPACE                             │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │  NetworkManager                                  │   │
│   │                                                  │   │
│   │  Đọc: /etc/NM/system-connections/enp3s0.conf     │   │
│   │  Chạy: DHCP hoặc gán IP tĩnh                     │   │
│   │  Ghi: IP vào kernel qua netlink socket            │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
                                               │
                                               ▼
                              enp3s0 có IP: 192.168.1.100/24
```

---

## Tóm tắt quan hệ

```
NIC (vật lý)
  └─▶ được nhìn như PCI Device (bởi kernel bus subsystem)
        └─▶ được điều khiển bởi Kernel Module / Driver
              └─▶ tạo ra Network Interface (đối tượng phần mềm trong kernel)
                    └─▶ được NetworkManager cấu hình theo Connection Profile
                          └─▶ có IP Address gán vào
```

---

## Lệnh debug hữu ích trên RHEL

```bash
# Xem hardware NIC
lspci | grep -i ethernet
lspci -k | grep -A3 Ethernet

# Xem driver đang dùng
ethtool -i enp3s0

# Xem trạng thái interface
ip link show
ip addr show

# Xem NetworkManager quản lý gì
nmcli device status
nmcli connection show

# Xem log NetworkManager
journalctl -u NetworkManager -f
```
