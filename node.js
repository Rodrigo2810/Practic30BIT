const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const upload = multer();

// Создаем папку для хранения данных, если ее нет
const dataDir = path.join(__dirname, 'form-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

app.post('/api/contact', upload.none(), (req, res) => {
    const { name, email, phone, message, consent, captchaToken } = req.body;
    const hasConsent = consent === true;

    // Валидация данных
    if (!email || !phone || !message || !consent) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, заполните все обязательные поля' 
        });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, введите корректный email' 
        });
    }

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, введите корректный номер телефона' 
        });
    }

    if (!captchaToken) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, пройдите проверку капчи' 
        });
    }

    // Создаем объект с данными формы
    const formData = {
        name: name || '',
        email,
        phone,
        message,
        consent: hasConsent,
        captchaToken,
        timestamp: new Date().toISOString()
    };

    // Логирование данных в консоль
    console.log("Получены новые данные формы:");
    console.log(formData);

    // Сохранение в файл (опционально)
    const filename = `form-${Date.now()}.json`;
    fs.writeFile(path.join(dataDir, filename), JSON.stringify(formData, null, 2), (err) => {
        if (err) {
            console.error('Ошибка при сохранении данных:', err);
        }
    });

    res.json({ 
        success: true, 
        message: 'Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.',
        data: formData // Опционально: возвращаем полученные данные
    });
});

// Маршрут для получения всех отправленных форм (для тестирования)
app.get('/api/submissions', (req, res) => {
    fs.readdir(dataDir, (err, files) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при чтении данных' 
            });
        }

        const submissions = files.map(file => {
            return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        });

        res.json({ 
            success: true, 
            data: submissions 
        });
    });
});

app.listen(port, () => {
    console.log(`Данные форм сохраняются в: ${dataDir}`);
});
