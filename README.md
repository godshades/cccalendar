# CC Calendar (Credit Card Calendar)

CC Calendar là một ứng dụng web giúp bạn theo dõi ngày đến hạn thanh toán thẻ tín dụng, quản lý các danh mục hoàn tiền và tối ưu hóa việc sử dụng thẻ tín dụng hàng tháng.

## 🚀 Tính năng chính

- **Lịch thanh toán**: Xem trực quan các ngày đến hạn thanh toán của tất cả các thẻ trong tháng.
- **Quản lý thẻ**: Thêm, sửa, xóa thông tin thẻ tín dụng của bạn.
- **Ma trận hoàn tiền (Matrix)**: So sánh tỷ lệ hoàn tiền giữa các thẻ cho từng danh mục chi tiêu (Ăn uống, Mua sắm, Du lịch, v.v.).
- **Theo dõi hạn mức hoàn tiền**: Đánh dấu các thẻ đã đạt mức hoàn tiền tối đa trong tháng để chuyển sang sử dụng thẻ khác hiệu quả hơn.
- **Sao lưu & Khôi phục**: Xuất và nhập dữ liệu dưới dạng chuỗi mã hóa để đồng bộ giữa các thiết bị mà không cần máy chủ.
- **Giao diện thân thiện**: Hỗ trợ tốt trên cả thiết bị di động và máy tính với Tailwind CSS.

## 🛠️ Công nghệ sử dụng

- **HTML5 & CSS3**
- **Tailwind CSS**: Framework CSS tiện lợi cho việc thiết kế giao diện nhanh chóng.
- **Alpine.js**: Framework JavaScript nhẹ nhàng để xử lý logic giao diện.
- **LZ-String**: Thư viện nén dữ liệu để tối ưu hóa việc xuất/nhập chuỗi mã hóa.
- **Cloudflare Pages**: Nền tảng triển khai ứng dụng web nhanh chóng và bảo mật.

## 📂 Cấu trúc thư mục

- `index.html`: Giao diện chính của ứng dụng.
- `app.js`: Logic xử lý dữ liệu và giao diện (sử dụng Alpine.js).
- `style.css`: Các tùy chỉnh CSS bổ sung.
- `data/`: Chứa các tệp dữ liệu mẫu về các loại thẻ tín dụng phổ biến.
- `workers/`: Các Cloudflare Workers (nếu có) để xử lý logic phía máy chủ.

## 📝 Hướng dẫn sử dụng

1. **Mở ứng dụng**: Truy cập vào trang web triển khai.
2. **Thêm thẻ**: Nhấn nút "Thêm thẻ", tìm kiếm thẻ trong danh sách có sẵn hoặc tự nhập thông tin.
3. **Theo dõi**: Xem lịch để biết khi nào cần thanh toán.
4. **Tối ưu chi tiêu**: Sử dụng chế độ "Matrix" để chọn thẻ có tỷ lệ hoàn tiền cao nhất cho nhu cầu hiện tại.
5. **Đồng bộ**: Sử dụng tính năng "Xuất" để lấy mã sao lưu và "Nhập" để khôi phục trên thiết bị khác.

## 📄 Giấy phép

Dự án này được phát triển cho mục đích cá nhân. Vui lòng kiểm tra thông tin ngân hàng và thẻ của bạn một cách cẩn thận.

---
*Phát triển bởi [godshades](https://github.com/godshades)*
