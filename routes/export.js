const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const Expense = require("../models/expense");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const { env } = require("../util/config");

// Excel export
router.get("/excel", authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Giderler");

        // Başlıklar
        worksheet.columns = [
            { header: "Kategori", key: "category", width: 20 },
            { header: "Miktar (₺)", key: "amount", width: 15 },
            { header: "Açıklama", key: "description", width: 30 },
            { header: "Tarih", key: "date", width: 15 }
        ];

        // Verileri ekle
        expenses.forEach(expense => {
            worksheet.addRow({
                category: expense.category,
                amount: expense.amount,
                description: expense.description || "-",
                date: moment(expense.date).format("DD/MM/YYYY")
            });
        });

        // Stil ayarları
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD3D3D3" }
        };

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=giderler_${moment().format("YYYY-MM-DD")}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Excel export hatası:", error);
        res.status(500);
        res.cookie("messages",
            { error: "Excel dosyası oluşturulurken hata oluştu." },
            { httpOnly: true }).redirect("/dashboard");
    }
});

// PDF export
router.get("/pdf", authenticateToken, async (req, res) => {
    const locale = req.cookies.locale ? req.cookies.locale.split("-")[0] : env.LOCALE;

    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=giderler_${moment().format("YYYY-MM-DD")}.pdf`);

        doc.pipe(res);
        doc.registerFont("DejaVu", path.join(__dirname, "..", "fonts", "DejaVuSerif.ttf"));

        // Başlık
        doc.fontSize(20).text("Gider Raporu", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Rapor Tarihi: ${moment().format("DD/MM/YYYY")}`);
        doc.moveDown();

        // Tablo başlıkları
        const startX = 50;
        let currentY = doc.y;

        doc.fontSize(10).font("DejaVu");
        doc.text("Kategori", startX, currentY, { width: 120 });
        doc.text("Miktar (₺)", startX + 120, currentY, { width: 80 });
        doc.text("Açıklama", startX + 200, currentY, { width: 150 });
        doc.text("Tarih", startX + 350, currentY, { width: 100 });

        currentY += 20;
        doc.moveTo(startX, currentY).lineTo(startX + 450, currentY).stroke();
        currentY += 10;

        // Veriler
        doc.font("DejaVu");
        let totalAmount = 0;

        expenses.forEach(expense => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            doc.text(expense.category, startX, currentY, { width: 120 });
            doc.text(expense.amount.toFixed(2), startX + 120, currentY, { width: 80 });
            doc.text(expense.description || "-", startX + 200, currentY, { width: 150 });
            doc.text(moment(expense.date).format("DD/MM/YYYY"), startX + 350, currentY, { width: 100 });

            totalAmount += expense.amount;
            currentY += 15;
        });

        currentY += 20;
        doc.moveTo(startX, currentY).lineTo(startX + 450, currentY).stroke();
        currentY += 10;
        doc.text(`Toplam: ${totalAmount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`, startX + 120, currentY);

        doc.end();

    } catch (error) {
        console.error("PDF export hatası:", error);
        res.status(500);
        res.cookie("messages",
            { error: "PDF dosyası oluşturulurken hata oluştu." },
            { httpOnly: true }).redirect("/dashboard");
    }
});

// CSV export
router.get("/csv", authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

        const tempDir = path.join(__dirname, "..", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const fileName = `giderler_${moment().format("YYYY-MM-DD")}_${Date.now()}.csv`;
        const filePath = path.join(tempDir, fileName);

        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: "category", title: "Kategori" },
                { id: "amount", title: "Miktar (₺)" },
                { id: "description", title: "Açıklama" },
                { id: "date", title: "Tarih" }
            ],
            encoding: "utf8"
        });

        const records = expenses.map(expense => ({
            category: expense.category,
            amount: expense.amount,
            description: expense.description || "-",
            date: moment(expense.date).format("DD/MM/YYYY")
        }));

        await csvWriter.writeRecords(records);

        res.download(filePath, `giderler_${moment().format("YYYY-MM-DD")}.csv`, (err) => {
            if (err) {
                console.error("CSV download hatası:", err);
            }
            // Geçici dosyayı sil
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Geçici dosya silme hatası:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("CSV export hatası:", error);
        res.status(500);
        res.cookie("messages",
            { error: "CSV dosyası oluşturulurken hata oluştu." },
            { httpOnly: true }).redirect("/dashboard");
    }
});

module.exports = router;